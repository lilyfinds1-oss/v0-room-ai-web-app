'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface FeatureCardProps {
  icon?: ReactNode
  title: string
  description: string
  index?: number
}

export function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <div
      className="opacity-0"
      style={{
        animation: `slide-up 0.6s ease-out ${index * 100}ms forwards`,
      }}
    >
      <Card className="relative overflow-hidden group h-full">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4">
          {icon && (
            <div className="text-4xl text-primary group-hover:text-secondary transition-colors duration-300 group-hover:scale-110 transform">
              {icon}
            </div>
          )}
          <h3 className="text-xl font-bold text-text-primary">{title}</h3>
          <p className="text-text-secondary leading-relaxed">{description}</p>
        </div>
      </Card>
    </div>
  )
}
