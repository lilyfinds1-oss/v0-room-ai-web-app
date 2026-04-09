import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
            const cookieStore = await cookies()
            return cookieStore.getSetCookie()
          },
          setAll: async (cookiesToSet) => {
            const cookieStore = await cookies()
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

    // Get job with upload details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        upload:uploads(*)
      `)
      .eq('id', params.jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get designs for this job
    const { data: designs } = await supabase
      .from('designs')
      .select('*')
      .eq('job_id', params.jobId)
      .order('variation_number', { ascending: true })

    return NextResponse.json({
      job,
      designs: designs || [],
      status: job.status,
      currentStage: job.current_stage,
      stageResults: job.stage_results,
    })
  } catch (error) {
    console.error('Job fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job' },
      { status: 500 }
    )
  }
}
