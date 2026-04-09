import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { designId: string } }
) {
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get design details
    const { data: design, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', params.designId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    return NextResponse.json({ design })
  } catch (error) {
    console.error('[v0] Design fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
