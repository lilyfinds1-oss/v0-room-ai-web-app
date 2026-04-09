'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Job {
  id: string
  user_id: string
  status: string
  current_stage: number
  created_at: string
  completed_at?: string
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`/api/admin/jobs?filter=${filter}`)
        if (response.ok) {
          const data = await response.json()
          setJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [filter])

  const STAGES = [
    'Normalization',
    'Room Analysis',
    'Object Detection',
    'Segmentation',
    'Depth Estimation',
    'Placement Planning',
    'Product Fetching',
    'Background Removal',
    'Compositing',
    'Upscaling',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs Monitoring</h1>
        <p className="text-muted-foreground">Track and manage design generation jobs</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'queued', 'running', 'completed', 'failed'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-accent hover:bg-accent/90' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Job ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stage</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                    {job.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : job.status === 'failed'
                          ? 'bg-red-500/20 text-red-500'
                          : job.status === 'running'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-secondary/50 text-muted-foreground'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold">{STAGES[job.current_stage]}</p>
                      <p className="text-xs text-muted-foreground">{job.current_stage + 1}/10</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(job.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {job.status === 'failed' && (
                      <Button size="sm" variant="outline">
                        Retry
                      </Button>
                    )}
                    {job.status === 'running' && (
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      )}
    </div>
  )
}
