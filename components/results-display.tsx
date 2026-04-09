'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface JobStatus {
  job: {
    id: string
    status: string
    current_stage: number
    created_at: string
    updated_at: string
  }
  designs: Array<{
    id: string
    variation_number: number
    design_image_url: string
    furniture_data: any[]
    created_at: string
  }>
  progress: number
  errorMessage?: string
}

const STAGE_NAMES = [
  'Normalization',
  'Room Analysis',
  'Object Detection',
  'Segmentation',
  'Depth Estimation',
  'Placement Planning',
  'Product Search',
  'Background Removal',
  'Image Compositing',
  'Upscaling',
]

export function ResultsDisplay({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariation, setSelectedVariation] = useState(0)

  useEffect(() => {
    const pollJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) throw new Error('Failed to fetch job status')

        const data = await response.json()
        setStatus(data)
        setError(null)

        // Stop polling if job is completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          setLoading(false)
        }
      } catch (err) {
        console.error('[v0] Poll error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    pollJob()
    const interval = setInterval(pollJob, 2000)

    return () => clearInterval(interval)
  }, [jobId])

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
          <h3 className="font-semibold text-destructive mb-2">Error</h3>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
        <p className="text-muted-foreground">Loading design...</p>
      </div>
    )
  }

  const currentDesign = status.designs[selectedVariation]

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Progress Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Design Generation Progress</h2>
          <span className="text-sm text-muted-foreground">{status.progress}%</span>
        </div>
        <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500"
            style={{ width: `${status.progress}%` }}
          />
        </div>

        {/* Stage Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STAGE_NAMES.map((name, idx) => (
            <div
              key={name}
              className={`text-xs px-2 py-1 rounded-full text-center transition-colors ${
                idx <= status.job.current_stage
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {status.job.status === 'completed' && currentDesign && (
        <>
          {/* Design Image */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Your Design</h3>
            <div className="relative w-full bg-secondary/30 rounded-xl overflow-hidden border border-border">
              <Image
                src={currentDesign.design_image_url}
                alt="Designed room"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Variations */}
          {status.designs.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Design Variations</h3>
              <div className="grid grid-cols-3 gap-4">
                {status.designs.map((design, idx) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedVariation(idx)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedVariation === idx
                        ? 'border-accent'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <Image
                      src={design.design_image_url}
                      alt={`Variation ${design.variation_number}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Furniture Products */}
          {currentDesign.furniture_data && currentDesign.furniture_data.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recommended Furniture</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {currentDesign.furniture_data.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border hover:border-accent/50 transition">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Product {item.product_id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Position: ({Math.round(item.x * 100)}%, {Math.round(item.y * 100)}%)
                      </p>
                      <p className="text-sm text-muted-foreground">Zone: {item.depth_zone}</p>
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        View Product
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.print()} variant="outline">
              Download Design
            </Button>
            <Button onClick={() => (window.location.href = '/dashboard')} className="bg-accent hover:bg-accent/90">
              Create Another Design
            </Button>
          </div>
        </>
      )}

      {status.job.status === 'failed' && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h3 className="font-semibold text-destructive mb-2">Design Generation Failed</h3>
          <p className="text-sm text-destructive/80 mb-4">{status.errorMessage}</p>
          <Button onClick={() => (window.location.href = '/dashboard')} variant="outline">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
