'use client'

import { useState } from 'react'
import { Plus, X, Upload, Settings, Zap, Heart } from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  color?: string
}

interface FloatingActionMenuProps {
  actions?: QuickAction[]
  onUpload?: () => void
}

export function FloatingActionMenu({ actions, onUpload }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const defaultActions: QuickAction[] = actions || [
    {
      id: 'upload',
      label: 'New Design',
      icon: <Upload className="w-5 h-5" />,
      onClick: onUpload,
      color: 'from-primary to-primary/70',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Heart className="w-5 h-5" />,
      href: '#favorites',
      color: 'from-secondary to-secondary/70',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
      color: 'from-warning to-warning/70',
    },
    {
      id: 'boost',
      label: 'Get Boost',
      icon: <Zap className="w-5 h-5" />,
      href: '#upgrade',
      color: 'from-success to-success/70',
    },
  ]

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 animate-slide-up">
          {defaultActions.map((action, index) => {
            const ActionButton = action.href ? Link : 'button'

            return (
              <div
                key={action.id}
                className="flex items-center gap-3 group"
                style={{
                  animation: `slideIn 300ms ease-out ${index * 50}ms both`,
                }}
              >
                <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors whitespace-nowrap">
                  {action.label}
                </span>
                <ActionButton
                  href={action.href}
                  onClick={action.onClick}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center`}
                >
                  {action.icon}
                </ActionButton>
              </div>
            )
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Plus className="w-6 h-6" />
            <span className="absolute inset-0 rounded-full animate-pulse border-2 border-white/30" />
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
