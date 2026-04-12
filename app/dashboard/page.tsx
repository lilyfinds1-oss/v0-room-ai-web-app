'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DesignGridItem } from '@/components/design-grid-item'
import { FileUploadArea } from '@/components/file-upload-area'
import UploadForm from '@/components/upload-form'
import { StatsCard } from '@/components/stats-card'
import { GalleryFilters, FilterState } from '@/components/gallery-filters'
import { AchievementBadge, Achievement } from '@/components/achievement-badge'
import { StreakDisplay } from '@/components/streak-display'
import { PersonalizedGreeting } from '@/components/personalized-greeting'
import { FloatingActionMenu } from '@/components/floating-action-menu'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Sparkles, Plus, Heart, TrendingUp, Crown, Zap } from 'lucide-react'

interface Design {
  id: string
  variation_number: number
  design_image_url: string
  created_at: string
}

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-design',
    title: 'First Steps',
    description: 'Created your first design',
    icon: 'star',
    rarity: 'common',
    unlockedAt: new Date(),
  },
  {
    id: 'five-designs',
    title: 'Design Collector',
    description: 'Created 5 designs',
    icon: 'trophy',
    rarity: 'rare',
    unlockedAt: new Date(),
  },
  {
    id: 'style-master',
    title: 'Style Master',
    description: 'Explored all design styles',
    icon: 'sparkles',
    rarity: 'epic',
  },
  {
    id: 'pro-member',
    title: 'Pro Member',
    description: 'Upgraded to Pro',
    icon: 'crown',
    rarity: 'legendary',
  },
]

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    roomType: 'All Rooms',
    status: 'All Status',
    dateRange: 'All Time',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[v0] Dashboard: No user found, redirecting to login')
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
          setFilteredDesigns(data.designs || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch designs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDesigns()
  }, [user])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // Apply filters (in a real app, this would be more sophisticated)
    setFilteredDesigns(designs)
  }

  const handleSortChange = (sortBy: string) => {
    let sorted = [...designs]
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }
    setFilteredDesigns(sorted)
  }

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
      <FloatingActionMenu onUpload={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        {/* Personalized Greeting */}
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <PersonalizedGreeting userName={user?.email || 'User'} designCount={designs.length} />
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="px-6 py-8 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">
              Your Dashboard
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <StatsCard
                title="Total Designs"
                value={designs.length}
                subtitle="All time"
                icon={<Sparkles className="w-6 h-6 text-secondary" />}
                trend={{ value: 12, direction: 'up' }}
                gradient="primary"
              />
              <StatsCard
                title="Favorites"
                value={Math.floor(designs.length * 0.3)}
                subtitle="Saved designs"
                icon={<Heart className="w-6 h-6 text-error" />}
                gradient="secondary"
              />
              <StatsCard
                title="Cart Value"
                value={`$${Math.floor(Math.random() * 5000) + 1000}`}
                subtitle="Ready to buy"
                icon={<TrendingUp className="w-6 h-6 text-success" />}
                gradient="success"
              />
              <StatsCard
                title="Pro Status"
                value="Free"
                subtitle="Upgrade now"
                icon={<Crown className="w-6 h-6 text-warning" />}
                gradient="warning"
                onClick={() => router.push('/settings')}
              />
            </div>
          </div>
        </div>

        {/* Gamification Section */}
        <div className="px-6 py-8 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">
              Achievements & Streaks
            </h3>
            <StreakDisplay
              currentStreak={3}
              totalPoints={1250}
              weeklyChallenge={{
                title: 'Create 3 Modern Designs',
                progress: 2,
                target: 3,
                reward: 100,
              }}
            />
          </div>
        </div>

        {/* Achievements Badges */}
        <div className="px-6 py-8 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">
              Badges Earned
            </h3>
            <div className="flex flex-wrap gap-6">
              {SAMPLE_ACHIEVEMENTS.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} size="md" />
              ))}
            </div>
          </div>
        </div>

        {/* Create New Design Section */}
        <div className="px-6 py-12 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-secondary" />
                Create New Design
              </h2>
              <p className="text-text-secondary mb-8">
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
          </div>
        </div>

        {/* Recent Designs Section with Filters */}
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">Your Designs</h2>
              <p className="text-text-secondary mb-6">
                {designs.length === 0
                  ? 'No designs yet. Create one to get started!'
                  : `You have ${designs.length} design${designs.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Filters */}
            {designs.length > 0 && (
              <GalleryFilters
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
              />
            )}

            {/* Gallery */}
            {loading ? (
              <div className="text-center py-20 space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-rotate-spin" />
                </div>
                <p className="text-text-secondary">Loading your designs...</p>
              </div>
            ) : filteredDesigns.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDesigns.map((design) => (
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
                      setFilteredDesigns(filteredDesigns.filter((d) => d.id !== id))
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
          </div>
        </div>
      </main>
    </div>
  )
}


