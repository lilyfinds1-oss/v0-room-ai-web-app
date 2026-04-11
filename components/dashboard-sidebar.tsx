'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Zap, Settings, HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ open = true, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'My Designs',
      href: '/dashboard/designs',
      icon: Zap,
    },
    {
      label: 'Account',
      href: '/settings',
      icon: Settings,
    },
    {
      label: 'Help',
      href: '/help',
      icon: HelpCircle,
    },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface/30 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-40',
          'flex flex-col gap-6 p-6',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="font-semibold text-text-primary">Menu</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  active
                    ? 'bg-primary/20 text-primary border border-primary/30 glow-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-white/5 pt-4">
          <p className="text-xs text-text-muted px-4">Version 1.0.0</p>
          <a
            href="#"
            className="text-xs text-primary hover:text-secondary transition-colors px-4"
          >
            Privacy Policy
          </a>
        </div>
      </aside>
    </>
  )
}
