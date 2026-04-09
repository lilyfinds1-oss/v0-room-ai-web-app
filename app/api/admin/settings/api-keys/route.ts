import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { service, key } = body

    if (!service || !key) {
      return NextResponse.json(
        { error: 'Service and key are required' },
        { status: 400 }
      )
    }

    const { data: apiKey } = await supabase
      .from('api_keys')
      .insert({
        service,
        key,
        is_active: true,
      })
      .select()
      .single()

    return NextResponse.json({ apiKey })
  } catch (error) {
    console.error('[v0] API key error:', error)
    return NextResponse.json(
      { error: 'Failed to add API key' },
      { status: 500 }
    )
  }
}
