'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AdminUser {
  role: string
  permissions: string[]
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/admin/verify')
        if (!response.ok) {
          router.push('/dashboard')
          return
        }

        const data = await response.json()
        setAdminUser(data.adminUser)
        setIsAdmin(true)
      } catch (error) {
        console.error('[v0] Admin check failed:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to access this area.</p>
          <Link href="/dashboard">
            <Button className="bg-accent hover:bg-accent/90">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/jobs', label: 'Jobs', icon: '⚙️' },
    { href: '/admin/payments', label: 'Payments', icon: '💳' },
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { href: '/admin/monitoring', label: 'Monitoring', icon: '📈' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold">RoomAI Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">Role: {adminUser?.role}</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition text-foreground hover:text-accent"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-border">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
