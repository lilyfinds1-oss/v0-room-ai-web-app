'use client'

import { ReactNode } from 'react'
import { ArrowUpRight, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  gradient?: 'primary' | 'secondary' | 'success' | 'warning'
  onClick?: () => void
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient = 'primary',
  onClick,
}: StatsCardProps) {
  const gradientClasses = {
    primary: 'from-primary/20 to-primary/5',
    secondary: 'from-secondary/20 to-secondary/5',
    success: 'from-success/20 to-success/5',
    warning: 'from-warning/20 to-warning/5',
  }

  const borderClasses = {
    primary: 'border-primary/30 hover:border-primary/50',
    secondary: 'border-secondary/30 hover:border-secondary/50',
    success: 'border-success/30 hover:border-success/50',
    warning: 'border-warning/30 hover:border-warning/50',
  }

  return (
    <div
      onClick={onClick}
      className={`group p-6 rounded-xl border ${borderClasses[gradient]} bg-gradient-to-br ${gradientClasses[gradient]} backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-up`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-text-secondary font-medium mb-1">{title}</p>
          <p className="text-4xl font-bold text-text-primary">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between">
          {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${
                trend.direction === 'up' ? 'text-success' : 'text-error'
              }`}
            >
              <ArrowUpRight className={`w-3 h-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      )}
    </div>
  )
}
