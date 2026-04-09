import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { inngest } from '@/lib/pipeline-orchestration'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      imageUrl,
      budget,
      stylePreference,
      variationCount = 1,
      enableUpscaling = true,
    } = body

    if (!imageUrl || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl, budget' },
        { status: 400 }
      )
    }

    // Create job record
    const jobId = crypto.randomUUID()
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        id: jobId,
        user_id: user.id,
        status: 'queued',
        current_stage: 0,
        metadata: {
          imageUrl,
          budget,
          stylePreference,
          variationCount,
          enableUpscaling,
        },
      })
      .select()
      .single()

    if (jobError) {
      console.error('[v0] Failed to create job:', jobError)
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      )
    }

    // Trigger Inngest pipeline
    await inngest.send({
      name: 'roomai/design.requested',
      data: {
        jobId,
        userId: user.id,
        imageUrl,
        budget,
        stylePreference,
        variationCount,
        enableUpscaling,
      },
    })

    console.log('[v0] Pipeline triggered for job:', jobId)

    return NextResponse.json({
      jobId,
      status: 'queued',
      message: 'Design generation started',
    })
  } catch (error) {
    console.error('[v0] Pipeline trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to start pipeline' },
      { status: 500 }
    )
  }
}
