'use client'

import { ResultsDisplay } from '@/components/results-display'

export default function ResultsPage({ params }: { params: { jobId: string } }) {
  return (
    <div className="min-h-screen bg-background py-8">
      <ResultsDisplay jobId={params.jobId} />
    </div>
  )
}
