'use client'

import { useEffect, useState } from 'react'

interface PipelineLog {
  id: string
  stage_name: string
  status: string
  duration_ms: number
  retry_count: number
  created_at: string
}

export default function AdminMonitoringPage() {
  const [logs, setLogs] = useState<PipelineLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/monitoring')
        if (response.ok) {
          const data = await response.json()
          setLogs(data.logs || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500'
      case 'failed':
        return 'bg-red-500/20 text-red-500'
      case 'running':
        return 'bg-blue-500/20 text-blue-500'
      default:
        return 'bg-secondary/50 text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Pipeline Monitoring</h1>
        <p className="text-muted-foreground">Track stages, errors, and performance metrics</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg border border-border bg-card space-y-2">
          <p className="text-sm text-muted-foreground">Total Runs</p>
          <p className="text-3xl font-bold">{logs.length}</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card space-y-2">
          <p className="text-sm text-muted-foreground">Success Rate</p>
          <p className="text-3xl font-bold">
            {logs.length > 0
              ? Math.round((logs.filter((l) => l.status === 'completed').length / logs.length) * 100)
              : 0}
            %
          </p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card space-y-2">
          <p className="text-sm text-muted-foreground">Avg Duration</p>
          <p className="text-3xl font-bold">
            {logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + l.duration_ms, 0) / logs.length) : 0}ms
          </p>
        </div>
      </div>

      {/* Pipeline Logs */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stage</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Retries</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="px-6 py-4 text-sm font-semibold">{log.stage_name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{log.duration_ms}ms</td>
                  <td className="px-6 py-4 text-sm">{log.retry_count}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No pipeline logs yet</p>
        </div>
      )}
    </div>
  )
}
