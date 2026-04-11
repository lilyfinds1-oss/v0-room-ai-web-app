'use client'

import { Trash2, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import Image from 'next/image'

interface DesignGridItemProps {
  id: string
  title: string
  image: string
  date: string
  status?: 'completed' | 'processing' | 'failed'
  onView?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusColors = {
  completed: 'success',
  processing: 'warning',
  failed: 'error',
} as const

export function DesignGridItem({
  id,
  title,
  image,
  date,
  status = 'completed',
  onView,
  onDelete,
}: DesignGridItemProps) {
  return (
    <div className="group relative rounded-lg overflow-hidden border border-white/10 bg-surface/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 animate-slide-up">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-background-dark overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">{new Date(date).toLocaleDateString()}</span>
          <Badge variant={statusColors[status]}>{status}</Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <Button
            onClick={() => onView?.(id)}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4" />
            View
          </Button>
          <Button
            onClick={() => onDelete?.(id)}
            variant="ghost"
            size="sm"
            className="text-error hover:text-error hover:bg-error/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
