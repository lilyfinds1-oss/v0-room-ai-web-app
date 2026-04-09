'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface Design {
  id: string
  variation_number: number
  design_image_url: string
  furniture_data: any[]
  room_analysis: any
  created_at: string
}

export default function DesignDetailPage({ params }: { params: { designId: string } }) {
  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const response = await fetch(`/api/designs/${params.designId}`)
        if (!response.ok) throw new Error('Failed to fetch design')

        const data = await response.json()
        setDesign(data.design)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDesign()
  }, [params.designId])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Error Loading Design</h2>
          <p className="text-muted-foreground">{error}</p>
          <Link href="/dashboard">
            <Button className="bg-accent hover:bg-accent/90">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading || !design) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          <p className="text-muted-foreground">Loading design...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Design Variation {design.variation_number}</h1>
          <p className="text-muted-foreground mt-1">
            Created {new Date(design.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Design Image */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Design</h2>
            <div className="relative w-full bg-secondary/30 rounded-lg overflow-hidden border border-border">
              <Image
                src={design.design_image_url}
                alt="Design"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Room Analysis */}
          {design.room_analysis && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Room Analysis</h2>
              <div className="grid sm:grid-cols-2 gap-4 p-6 rounded-lg border border-border bg-secondary/30">
                {design.room_analysis.room_type && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Room Type</p>
                    <p className="text-foreground capitalize mt-1">
                      {design.room_analysis.room_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
                {design.room_analysis.style && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Style</p>
                    <p className="text-foreground capitalize mt-1">{design.room_analysis.style}</p>
                  </div>
                )}
                {design.room_analysis.mood && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Mood</p>
                    <p className="text-foreground capitalize mt-1">{design.room_analysis.mood}</p>
                  </div>
                )}
                {design.room_analysis.lighting && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Lighting</p>
                    <p className="text-foreground capitalize mt-1">
                      {design.room_analysis.lighting.replace(/-/g, ' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Furniture Recommendations */}
          {design.furniture_data && design.furniture_data.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Furniture Placement</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {design.furniture_data.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border hover:border-accent/50 transition bg-secondary/30 space-y-2"
                  >
                    <h3 className="font-semibold">Product {item.product_id}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Position: ({Math.round(item.x * 100)}%, {Math.round(item.y * 100)}%)</p>
                      <p>Depth Zone: <span className="capitalize">{item.depth_zone}</span></p>
                      <p>Scale: {(item.scale_factor * 100).toFixed(0)}%</p>
                      {item.rotation !== 0 && <p>Rotation: {item.rotation}°</p>}
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      View Product
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-8 border-t border-border">
            <Button variant="outline" onClick={() => window.print()}>
              Download Design
            </Button>
            <Button className="bg-accent hover:bg-accent/90">
              Shop This Design
            </Button>
            <Link href="/dashboard" className="ml-auto">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
