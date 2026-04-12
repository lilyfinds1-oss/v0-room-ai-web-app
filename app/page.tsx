'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { PricingCard } from '@/components/pricing-card'
import { StepTimeline } from '@/components/step-timeline'
import { ScrollTrigger } from '@/components/scroll-trigger'
import { FeatureCardsSection } from '@/components/feature-cards-section'
import { InteractiveHero } from '@/components/interactive-hero'
import { BeforeAfterSlider } from '@/components/before-after-slider'
import Link from 'next/link'
import {
  Sparkles,
  Upload,
  Wand2,
  ShoppingCart,
  Zap,
  Lock,
  Palette,
  TrendingUp,
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-4xl font-bold gradient-text">RoomAI</div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  const handleGetStarted = () => {
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-background-dark text-text-primary overflow-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background-dark/80 backdrop-blur-md border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center group-hover:glow-primary transition-all">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RoomAI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-secondary hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-text-secondary hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-text-secondary hover:text-primary transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/login')} size="sm">
              Sign In
            </Button>
            <Button onClick={handleGetStarted} variant="primary" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Interactive Hero Section */}
      <InteractiveHero />

      {/* Features Section - Replaced with 3D Flip Cards */}
      <section id="features" className="py-20 px-4 md:px-8">
        <FeatureCardsSection />
      </section>

      {/* Before/After Demo Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollTrigger className="text-center mb-16 animate-slide-up">
            <h2 className="text-5xl font-bold text-text-primary mb-4">See the Difference</h2>
            <p className="text-text-secondary text-xl max-w-2xl mx-auto">
              Watch as our AI transforms your space with stunning design variations
            </p>
          </ScrollTrigger>

          <ScrollTrigger animation="scale-in" threshold={0.2}>
            <BeforeAfterSlider
              beforeImage="/images/before-room.jpg"
              afterImage="/images/after-room.jpg"
              beforeLabel="Your Room"
              afterLabel="AI Design"
            />
          </ScrollTrigger>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollTrigger animation="slide-up" threshold={0.2} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary">How It Works</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Get your perfect room design in just 4 simple steps
            </p>
          </ScrollTrigger>

          <ScrollTrigger animation="fade-in" threshold={0.2}>
            <StepTimeline
              steps={[
                {
                  number: 1,
                  title: 'Snap Your Space',
                  description: 'Take a photo of your room. Tell us your room type, style preference, and budget.',
                  icon: <Upload className="w-6 h-6" />,
                },
                {
                  number: 2,
                  title: 'AI Analysis',
                  description: 'Our AI runs advanced analysis: detecting furniture, estimating depth, and planning optimal placement.',
                  icon: <Sparkles className="w-6 h-6" />,
                },
                {
                  number: 3,
                  title: 'Design Generation',
                  description: 'Furniture is intelligently placed and composited with realistic shadows and lighting.',
                  icon: <Wand2 className="w-6 h-6" />,
                },
                {
                  number: 4,
                  title: 'Shop & Furnish',
                  description: 'View all recommended products with links to purchase. Save designs and create anytime.',
                  icon: <ShoppingCart className="w-6 h-6" />,
                },
              ]}
            />
          </ScrollTrigger>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollTrigger animation="slide-up" threshold={0.2} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary">Simple Pricing</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">Start free, upgrade anytime</p>
          </ScrollTrigger>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <ScrollTrigger animation="scale-in" delay={0} threshold={0.2}>
              <PricingCard
                name="Free"
                price="0"
                description="Perfect for trying it out"
                features={['1 design per week', '1 variation per design', 'Basic AI features', 'Community support']}
                highlighted={false}
                index={0}
              />
            </ScrollTrigger>

            <ScrollTrigger animation="scale-in" delay={100} threshold={0.2}>
              <PricingCard
                name="Pro"
                price="9.99"
                description="For design enthusiasts"
                features={['Unlimited designs', '3 variations per design', 'Priority processing', 'Email support', '4K downloads', 'Design history']}
                highlighted={true}
                index={1}
              />
            </ScrollTrigger>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <ScrollTrigger animation="slide-up" threshold={0.3} className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm p-12 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary">Ready to Redesign?</h2>
            <p className="text-xl text-text-secondary">
              Start creating your perfect space today. No credit card required.
            </p>
            <Button size="lg" onClick={handleGetStarted} variant="primary">
              Create Your First Design
            </Button>
          </div>
        </ScrollTrigger>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8 bg-background-dark/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="font-bold gradient-text">RoomAI</span>
              </div>
              <p className="text-sm text-text-secondary">AI-powered interior design for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex items-center justify-between text-sm text-text-muted">
            <p>&copy; 2026 RoomAI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-text-secondary transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-text-secondary transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-text-secondary transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

