import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role, permissions')
      .eq('id', user.id)
      .single()

    if (error || !adminUser) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    return NextResponse.json({
      user,
      adminUser,
    })
  } catch (error) {
    console.error('[v0] Admin verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify admin access' },
      { status: 500 }
    )
  }
}
