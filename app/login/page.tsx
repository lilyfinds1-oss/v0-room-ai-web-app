'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    console.log('[v0] Login page: authLoading=', authLoading, 'user=', user?.email)
    if (!authLoading && user) {
      console.log('[v0] Login page: User already logged in, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('[v0] Login attempt with email:', email)
      await signIn(email, password)
      console.log('[v0] Login successful, waiting for auth context to update...')
      // Don't redirect here - let the useEffect above handle it when the context updates
    } catch (err) {
      console.log('[v0] Login error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Login failed'
      setError(errorMsg)
      setLoading(false)
    } finally {
      // Always reset loading state on completion
      // Note: On success, it will be reset after redirect, but this ensures it's cleared for error cases
      if (!error) {
        // Only reset if no error was set (success case handled by redirect)
        console.log('[v0] Login flow completed')
      }
    }
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

  // If user is already logged in, show redirect message
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold gradient-text">RoomAI</div>
          <p className="text-text-secondary">Redirecting to dashboard...</p>
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-rotate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" />
      
      <div className="relative z-10">
        <Card className="w-full max-w-md p-8 border border-white/10 bg-surface/50 backdrop-blur-xl glow-primary">
          <div className="space-y-6">
            <div className="text-center space-y-2 animate-slide-up">
              <h1 className="text-4xl font-bold gradient-text">
                RoomAI
              </h1>
              <p className="text-sm text-text-secondary">AI-powered interior design</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm animate-slide-up">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading} 
                variant="primary"
                size="md"
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-text-secondary">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-primary hover:text-secondary font-semibold transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

