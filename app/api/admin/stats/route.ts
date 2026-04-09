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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get stats
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' })

    const { count: completedJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'completed')

    const { count: failedJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'failed')

    const { count: pipelineErrors } = await supabase
      .from('pipeline_logs')
      .select('*', { count: 'exact' })
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString())

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalJobs: totalJobs || 0,
        completedJobs: completedJobs || 0,
        failedJobs: failedJobs || 0,
        totalRevenue: 0, // Calculate from payment records
        averageProcessingTime: 45,
        pipelineErrors: pipelineErrors || 0,
      },
    })
  } catch (error) {
    console.error('[v0] Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
