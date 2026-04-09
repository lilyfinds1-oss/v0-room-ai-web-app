'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PIPELINE_STAGES = [
  'Room Analysis',
  'Budget Breakdown',
  'Furniture Placement',
  'Product Search',
  'Product Ranking',
  'Product Selection',
  'Background Removal',
  'Image Compositing',
  'Upscaling',
]

interface JobData {
  status: string
  currentStage: number
  stageResults: Record<string, any>
  designs: Array<{
    id: string
    variation_number: number
    design_image_url: string
  }>
}

export default function ResultsPage({ params }: { params: { jobId: string } }) {
  const { user } = useAuth()
  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.jobId}`)
        if (!response.ok) throw new Error('Failed to fetch job')
        const data = await response.json()
        setJob(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job')
        setLoading(false)
      }
    }

    fetchJob()

    // Poll every 2 seconds if job is still processing
    const interval = setInterval(fetchJob, 2000)
    return () => clearInterval(interval)
  }, [params.jobId])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Processing Your Design...</h1>
        <Card className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Setting up your personalized design...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Error</h1>
        <Card className="p-8 border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const isComplete = job?.status === 'completed'
  const isFailed = job?.status === 'failed'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isComplete ? 'Your Designs Are Ready!' : 'Processing Design...'}
        </h1>
        <p className="text-slate-600">
          {isFailed ? 'An error occurred while processing your design.' : 'Watch as we create your personalized interior designs'}
        </p>
      </div>

      {/* Pipeline Progress */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Processing Pipeline</h2>
        <div className="space-y-2">
          {PIPELINE_STAGES.map((stage, index) => (
            <div key={stage} className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  index < job.currentStage
                    ? 'bg-green-500 text-white'
                    : index === job.currentStage
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {index < job.currentStage ? '✓' : index + 1}
              </div>
              <span
                className={`flex-1 ${
                  index <= job.currentStage ? 'text-slate-900 font-medium' : 'text-slate-500'
                }`}
              >
                {stage}
              </span>
              {index === job.currentStage && !isComplete && (
                <span className="text-xs text-blue-600 font-semibold">In Progress</span>
              )}
              {index < job.currentStage && (
                <span className="text-xs text-green-600 font-semibold">Done</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Results */}
      {isComplete && job.designs && job.designs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Your Design Variations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {job.designs.map((design) => (
              <Link
                key={design.id}
                href={`/dashboard/design/${design.id}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div className="relative w-full aspect-square bg-slate-100">
                    <img
                      src={design.design_image_url}
                      alt={`Variation ${design.variation_number}`}
                      className="w-full h-full object-cover group-hover:opacity-90 transition"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900">
                      Variation {design.variation_number}
                    </p>
                    <p className="text-sm text-slate-600">Click to view details</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isComplete && !isFailed && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-blue-900 text-sm">
            This usually takes 30-60 seconds. Feel free to leave this page—we&apos;ll email you when your designs are ready.
          </p>
        </Card>
      )}

      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        {isComplete && (
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        )}
      </div>
    </div>
  )
}
