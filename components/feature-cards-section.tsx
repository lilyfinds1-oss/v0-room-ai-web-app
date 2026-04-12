'use client'

import { useState } from 'react'
import { Wand2, Zap, TrendingUp, Users, Lock, Smile } from 'lucide-react'
import { ScrollTrigger } from './scroll-trigger'

const FEATURES = [
  {
    id: 1,
    icon: <Wand2 className="w-8 h-8" />,
    title: 'AI-Powered Design',
    description: 'Get unlimited design variations powered by cutting-edge AI technology.',
    color: 'from-primary',
  },
  {
    id: 2,
    icon: <Zap className="w-8 h-8" />,
    title: 'Instant Results',
    description: 'See beautiful design variations in seconds, not hours.',
    color: 'from-secondary',
  },
  {
    id: 3,
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Budget Friendly',
    description: 'Affordable designs for every room and every budget level.',
    color: 'from-success',
  },
  {
    id: 4,
    icon: <Users className="w-8 h-8" />,
    title: 'Expert Recommendations',
    description: 'Get insights from professional interior design experts.',
    color: 'from-warning',
  },
  {
    id: 5,
    icon: <Lock className="w-8 h-8" />,
    title: 'Privacy First',
    description: 'Your room photos are encrypted and never shared.',
    color: 'from-info',
  },
  {
    id: 6,
    icon: <Smile className="w-8 h-8" />,
    title: 'Personalized',
    description: 'Designs tailored to your style, preferences, and needs.',
    color: 'from-secondary',
  },
]

function FeatureCard({
  id,
  icon,
  title,
  description,
  color,
}: (typeof FEATURES)[0] & { delay?: number }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="relative w-full h-64 cursor-pointer perspective"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className={`absolute w-full h-full p-6 rounded-xl border border-white/10 bg-gradient-to-br ${color}/20 to-transparent backdrop-blur-sm flex flex-col items-start justify-between`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color} to-transparent text-white`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary">{description.substring(0, 40)}...</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-full p-6 rounded-xl border border-white/10 bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm flex flex-col items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-text-primary font-semibold mb-2">{title}</p>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  )
}

export function FeatureCardsSection() {
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <ScrollTrigger className="text-center mb-16 animate-slide-up">
          <h2 className="text-5xl font-bold text-text-primary mb-4">Why Choose RoomAI</h2>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto">
            Experience the future of interior design with our powerful AI-driven platform
          </p>
        </ScrollTrigger>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <ScrollTrigger
              key={feature.id}
              animation="scale-in"
              delay={idx * 100}
              threshold={0.2}
            >
              <FeatureCard {...feature} />
            </ScrollTrigger>
          ))}
        </div>
      </div>
    </section>
  )
}
