'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password)
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark overflow-hidden relative">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" />
        
        <div className="relative z-10">
          <Card className="w-full max-w-md p-8 border border-white/10 bg-surface/50 backdrop-blur-xl glow-primary">
            <div className="text-center space-y-4 animate-slide-up">
              <div className="text-5xl font-bold text-primary">✓</div>
              <h1 className="text-2xl font-bold gradient-text">
                Check your email
              </h1>
              <p className="text-sm text-text-secondary">
                Please check your email to confirm your account before signing in.
              </p>
            </div>
          </Card>
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
              <p className="text-sm text-text-secondary">Create your account</p>
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-text-secondary">Already have an account? </span>
              <Link href="/login" className="text-primary hover:text-secondary font-semibold transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
