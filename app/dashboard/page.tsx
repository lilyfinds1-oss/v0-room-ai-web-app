'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import UploadForm from '@/components/upload-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Design {
  id: string
  variation_number: number
  design_image_url: string
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDesigns = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/designs')
        if (response.ok) {
          const data = await response.json()
          setDesigns(data.designs || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch designs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDesigns()
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.email}</p>
          </div>
          <Link href="/dashboard/account">
            <Button variant="outline">Account Settings</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Create New Design</h2>
              <p className="text-sm text-muted-foreground">
                Upload a photo of your room and let AI design beautiful variations for you.
              </p>
              <UploadForm />
            </div>
          </div>

          {/* Recent Designs */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Recent Designs</h2>
                <p className="text-sm text-muted-foreground">
                  {designs.length === 0 ? 'No designs yet. Create one to get started!' : `You have ${designs.length} design(s)`}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                  <p className="text-muted-foreground mt-2">Loading designs...</p>
                </div>
              ) : designs.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {designs.map((design) => (
                    <Link
                      key={design.id}
                      href={`/dashboard/design/${design.id}`}
                      className="group"
                    >
                      <div className="relative rounded-lg overflow-hidden border border-border hover:border-accent/50 transition group-hover:shadow-lg">
                        <div className="relative w-full aspect-video bg-secondary/30">
                          <Image
                            src={design.design_image_url}
                            alt={`Design ${design.variation_number}`}
                            fill
                            className="object-cover group-hover:opacity-90 transition"
                          />
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-sm">
                            Variation {design.variation_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(design.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">No designs yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Upload your first room photo to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
