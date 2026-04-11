'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DesignGridItem } from '@/components/design-grid-item'
import { FileUploadArea } from '@/components/file-upload-area'
import UploadForm from '@/components/upload-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Sparkles, Plus } from 'lucide-react'

interface Design {
  id: string
  variation_number: number
  design_image_url: string
  created_at: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold gradient-text">RoomAI</div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        {/* Hero Section */}
        <div className="px-6 py-12 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-4xl font-bold text-text-primary mb-2">Welcome Back</h1>
                <p className="text-text-secondary">
                  Let&apos;s create beautiful room designs together
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="p-6 rounded-lg border border-white/10 bg-surface/30 backdrop-blur-sm">
                  <p className="text-text-secondary text-sm mb-2">Total Designs</p>
                  <p className="text-3xl font-bold text-primary">{designs.length}</p>
                </div>
                <div className="p-6 rounded-lg border border-white/10 bg-surface/30 backdrop-blur-sm">
                  <p className="text-text-secondary text-sm mb-2">Plan</p>
                  <p className="text-3xl font-bold text-secondary">Free</p>
                </div>
                <div className="p-6 rounded-lg border border-white/10 bg-surface/30 backdrop-blur-sm">
                  <p className="text-text-secondary text-sm mb-2">Account</p>
                  <p className="text-lg font-bold text-text-primary truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Create New Design Section */}
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  Create New Design
                </h2>
                <p className="text-text-secondary">
                  Upload a photo of your room and let our AI generate beautiful design variations
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <UploadForm />
                </div>

                {/* Tips */}
                <div className="space-y-4 p-6 rounded-lg border border-white/10 bg-surface/30 backdrop-blur-sm h-fit">
                  <h3 className="font-semibold text-text-primary">Tips for Best Results</h3>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    <li className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span>Good lighting makes a difference</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span>Include full wall view</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span>Clear focal point helps</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span>Set a budget for better matches</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Recent Designs Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-1">Your Designs</h2>
                  <p className="text-text-secondary">
                    {designs.length === 0
                      ? 'No designs yet. Create one to get started!'
                      : `You have ${designs.length} design${designs.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-rotate-spin" />
                  </div>
                  <p className="text-text-secondary">Loading your designs...</p>
                </div>
              ) : designs.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designs.map((design, idx) => (
                    <DesignGridItem
                      key={design.id}
                      id={design.id}
                      title={`Variation ${design.variation_number}`}
                      image={design.design_image_url}
                      date={design.created_at}
                      status="completed"
                      onView={(id) => router.push(`/dashboard/design/${id}`)}
                      onDelete={(id) => {
                        setDesigns(designs.filter((d) => d.id !== id))
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-lg border-2 border-dashed border-white/10 bg-surface/20 space-y-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-text-primary">No designs yet</p>
                    <p className="text-sm text-text-secondary">
                      Upload your first room photo above to get started
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

