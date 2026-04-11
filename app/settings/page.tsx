'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Settings, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('[v0] Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 pt-16">
        <div className="px-6 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
                <p className="text-text-secondary">Manage your account and preferences</p>
              </div>
            </div>

            {/* Account Section */}
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">Account Information</h2>
                <p className="text-text-secondary text-sm">Your account details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-surface/50"
                  />
                  <p className="text-xs text-text-muted mt-2">
                    Contact support to change your email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Account Status
                  </label>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-success text-sm font-medium">
                    Active
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Plan
                  </label>
                  <div className="p-4 rounded-lg bg-surface/50 border border-white/10 text-text-primary text-sm font-medium flex items-center justify-between">
                    <span>Free Plan</span>
                    <Button variant="secondary" size="sm">
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-8 space-y-6 border-error/30 bg-error/5">
              <div>
                <h2 className="text-xl font-bold text-error mb-1">Danger Zone</h2>
                <p className="text-text-secondary text-sm">Irreversible actions</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface/30 border border-error/20">
                  <div>
                    <p className="font-medium text-text-primary">Log Out</p>
                    <p className="text-sm text-text-secondary">Sign out of your account</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    disabled={loading}
                    variant="danger"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4" />
                    {loading ? 'Logging out...' : 'Log Out'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
