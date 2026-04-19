import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { inngest } from '@/lib/pipeline-orchestration'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const roomType = formData.get('roomType') as string
    const budgetRange = formData.get('budgetRange') as string
    const stylePreference = formData.get('stylePreference') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get user from Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upload file to Vercel Blob
    const blob = await put(`roomai/${user.id}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    // Create upload record in Supabase
    const { data: uploadData, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        user_id: user.id,
        original_image_url: blob.url,
        original_image_key: blob.pathname,
        room_type: roomType,
        budget_range: budgetRange,
        style_preference: stylePreference,
        status: 'processing',
      })
      .select()
      .single()

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Create job record
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert({
        upload_id: uploadData.id,
        user_id: user.id,
        status: 'queued',
        current_stage: 0,
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    // Trigger Inngest workflow
    await inngest.send({
      name: 'roomai/design.requested',
      data: {
        jobId: jobData.id,
        uploadId: uploadData.id,
        userId: user.id,
        imageUrl: blob.url,
        budget: parseInt(budgetRange) || 2500,
        stylePreference: stylePreference || 'modern',
      },
    })

    // Redirect to pipeline trigger page with job info
    const triggerUrl = `/api/pipeline/trigger?jobId=${jobData.id}&uploadId=${uploadData.id}`
    
    await fetch(triggerUrl, { method: 'POST' })
    
    return NextResponse.redirect(new URL(`/process/${jobData.id}`, request.url))
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
