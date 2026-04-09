'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import UploadForm from '@/components/upload-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Upload {
  id: string
  created_at: string
  status: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUploads = async () => {
      if (!user) return

      const { data } = await supabase
        .from('uploads')
        .select('id, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setUploads(data || [])
      setLoading(false)
    }

    fetchUploads()
  }, [user])

  return (
    <div className="space-y-12">
      <UploadForm />

      {/* Recent Uploads */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Recent Designs</h2>
          <div className="grid gap-4">
            {uploads.map((upload) => (
              <Card key={upload.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    Design from {new Date(upload.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-500 capitalize">{upload.status}</p>
                </div>
                <Link href={`/dashboard/results/${upload.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
