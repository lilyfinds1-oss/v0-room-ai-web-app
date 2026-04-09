'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-white">RoomAI</div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white mb-4">RoomAI</h1>
          <p className="text-xl text-slate-300">AI-Powered Interior Design</p>
        </div>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Upload a photo of your room and let our advanced AI design stunning interior variations tailored to your style and budget.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="px-8"
          >
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/signup')}
            className="px-8"
          >
            Sign Up
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-20">
          <div className="space-y-2">
            <div className="text-3xl">📸</div>
            <h3 className="font-semibold text-white">Upload</h3>
            <p className="text-sm text-slate-400">Share a photo of your room</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">✨</div>
            <h3 className="font-semibold text-white">Generate</h3>
            <p className="text-sm text-slate-400">AI designs multiple variations</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🛋️</div>
            <h3 className="font-semibold text-white">Furnish</h3>
            <p className="text-sm text-slate-400">Shop recommended products</p>
          </div>
        </div>
      </div>
    </div>
  )
}
