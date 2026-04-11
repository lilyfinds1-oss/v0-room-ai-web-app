'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  index?: number
}

export function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  index = 0,
}: PricingCardProps) {
  return (
    <div
      className="opacity-0"
      style={{
        animation: `scale-in 0.6s ease-out ${index * 100}ms forwards`,
      }}
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 h-full flex flex-col ${
          highlighted
            ? 'border-primary/50 bg-gradient-to-br from-primary/20 to-secondary/10 ring-1 ring-primary/30 scale-105'
            : 'hover:scale-105'
        }`}
      >
        {highlighted && (
          <Badge variant="primary" className="absolute top-4 right-4">
            Popular
          </Badge>
        )}

        <div className="flex-1 flex flex-col gap-6 p-6">
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">{name}</h3>
            <p className="text-text-secondary">{description}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">${price}</span>
            <span className="text-text-secondary">/month</span>
          </div>

          <ul className="space-y-3 flex-1">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            variant={highlighted ? 'primary' : 'outline'}
            className="w-full"
          >
            Get Started
          </Button>
        </div>
      </Card>
    </div>
  )
}
