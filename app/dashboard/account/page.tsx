'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Profile Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Profile</h2>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Email</label>
                <p className="text-foreground mt-1">{user?.email}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Account Created</label>
                <p className="text-foreground mt-1">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Subscription</h2>
              <p className="text-sm text-muted-foreground">Manage your plan and billing</p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Free Plan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    1 design per week, 1 variation per design
                  </p>
                </div>
                <Link href="/pricing">
                  <Button className="bg-accent hover:bg-accent/90">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-6 pt-12 border-t border-border">
            <div>
              <h2 className="text-xl font-semibold mb-2">Session</h2>
              <p className="text-sm text-muted-foreground">Manage your login session</p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border border-destructive/30 bg-destructive/5">
              <p className="text-sm text-muted-foreground">
                Click the button below to sign out from all devices.
              </p>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
