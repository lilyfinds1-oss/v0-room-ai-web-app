import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = params.jobId

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get pipeline logs for this job
    const { data: logs } = await supabase
      .from('pipeline_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      job,
      logs: logs || [],
      progress: calculateProgress(job.current_stage, job.status),
    })
  } catch (error) {
    console.error('[v0] Job status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  }
}

function calculateProgress(stage: number, status: string): number {
  if (status === 'completed') return 100
  if (status === 'failed') return 0
  if (status === 'queued') return 5
  // 10 stages (0-9), each is 10% of progress (after 5% initial)
  return 5 + (stage * 9.5)
}
