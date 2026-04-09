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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-slate-950 to-background overflow-hidden relative">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-50" />
        
        <div className="relative z-10">
          <Card className="w-full max-w-md p-8 border border-border/50 bg-card/40 backdrop-blur-xl glow-pulse">
            <div className="text-center space-y-4 slide-up">
              <div className="text-5xl font-bold text-primary">✓</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground">
                Please check your email to confirm your account before signing in.
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-slate-950 to-background overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-50" />
      
      <div className="relative z-10">
        <Card className="w-full max-w-md p-8 border border-border/50 bg-card/40 backdrop-blur-xl glow-pulse">
          <div className="space-y-6">
            <div className="text-center space-y-2 slide-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                RoomAI
              </h1>
              <p className="text-sm text-muted-foreground">Create your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground/90">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-input/50 border-border/40 focus:border-primary/60 focus:glow-pulse transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/90">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-input/50 border-border/40 focus:border-primary/60 focus:glow-pulse transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/90">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-input/50 border-border/40 focus:border-primary/60 focus:glow-pulse transition-all"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm slide-up">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-2 rounded-lg transition-all duration-300 glow-pulse disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
