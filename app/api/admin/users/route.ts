import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    const filter = request.nextUrl.searchParams.get('filter') || 'all'

    let query = supabase.from('profiles').select('*')

    if (filter === 'free') {
      query = query.eq('subscription_tier', 'free')
    } else if (filter === 'pro') {
      query = query.eq('subscription_tier', 'pro')
    } else if (filter === 'active') {
      query = query.eq('subscription_status', 'active')
    } else if (filter === 'suspended') {
      query = query.eq('subscription_status', 'suspended')
    }

    const { data: users } = await query.order('created_at', { ascending: false })

    return NextResponse.json({
      users: users || [],
    })
  } catch (error) {
    console.error('[v0] Users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
