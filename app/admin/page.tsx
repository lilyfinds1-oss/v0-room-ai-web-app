'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalJobs: number
  completedJobs: number
  failedJobs: number
  totalRevenue: number
  averageProcessingTime: number
  pipelineErrors: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">System overview and key metrics</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          <p className="text-muted-foreground mt-2">Loading stats...</p>
        </div>
      ) : stats ? (
        <>
          {/* Key Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-lg border border-border bg-card space-y-2">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card space-y-2">
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-3xl font-bold">{stats.totalJobs}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card space-y-2">
              <p className="text-sm text-muted-foreground">Completed Jobs</p>
              <p className="text-3xl font-bold text-green-500">{stats.completedJobs}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card space-y-2">
              <p className="text-sm text-muted-foreground">Failed Jobs</p>
              <p className="text-3xl font-bold text-red-500">{stats.failedJobs}</p>
            </div>
          </div>

          {/* Revenue & Performance */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card space-y-4">
              <h3 className="font-semibold">Revenue</h3>
              <p className="text-3xl font-bold">${(stats.totalRevenue / 100).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total income from subscriptions</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card space-y-4">
              <h3 className="font-semibold">Performance</h3>
              <p className="text-3xl font-bold">{stats.averageProcessingTime}s</p>
              <p className="text-sm text-muted-foreground">Average processing time per design</p>
            </div>
          </div>

          {/* Pipeline Health */}
          <div className="p-6 rounded-lg border border-border bg-card space-y-4">
            <h3 className="font-semibold">Pipeline Health</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Errors in Last 24h</span>
                <span className="font-bold text-red-500">{stats.pipelineErrors}</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-2">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.max(0, 100 - stats.pipelineErrors)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/jobs">
              <Button variant="outline" className="w-full">
                View Jobs
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full">
                Settings
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load stats</p>
        </div>
      )}
    </div>
  )
}
