'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    description: 'Perfect for trying RoomAI',
    features: [
      '1 design variation per upload',
      'Basic room analysis',
      'Standard furniture selection',
      'Community support',
    ],
    priceId: null,
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious interior design',
    features: [
      '3 design variations per upload',
      'Advanced room analysis',
      'Premium furniture catalog',
      'Image upscaling',
      'Priority support',
      'Unlimited uploads',
    ],
    priceId: 'price_pro_monthly',
    cta: 'Upgrade to Pro',
    popular: true,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return

    setLoading(true)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Simple, Transparent Pricing</h1>
          <p className="text-lg text-slate-300">
            Choose the plan that fits your design needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-500 md:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
                  <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-700">
                      <span className="text-blue-500 font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={!plan.priceId || loading}
                  className={`w-full ${
                    plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loading ? 'Processing...' : plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-slate-800 rounded-lg p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Questions about pricing?</h3>
          <p className="text-slate-300">
            Contact our support team at support@roomai.com
          </p>
        </div>
      </div>
    </div>
  )
}
