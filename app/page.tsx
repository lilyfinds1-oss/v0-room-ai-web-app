'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-foreground">RoomAI</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleGetStarted = () => {
    router.push('/signup')
  }

  return (
    <div className="bg-background text-foreground">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">R</span>
            </div>
            <span className="font-semibold text-lg">RoomAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">How It Works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button onClick={handleGetStarted} className="bg-accent hover:bg-accent/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">AI-Powered Interior Design • Instant Results</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transform Your Room with
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent block mt-2">
              AI-Powered Design
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload a photo of your room and get professionally designed interior variations with curated furniture recommendations. All powered by advanced AI and ready to shop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 h-12 rounded-full font-semibold"
            >
              Start Designing Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="px-8 h-12 rounded-full font-semibold"
            >
              Watch Demo
            </Button>
          </div>

          <div className="text-sm text-muted-foreground pt-4">
            No credit card required. Free tier includes 1 design per week.
          </div>
        </div>

        {/* Feature preview cards */}
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: '1',
                title: 'Upload Your Room',
                description: 'Simply snap a photo of your space and tell us your style preferences',
                icon: '📸'
              },
              {
                number: '2',
                title: 'AI Designs',
                description: 'Our advanced AI analyzes and generates multiple design variations',
                icon: '✨'
              },
              {
                number: '3',
                title: 'Shop Instantly',
                description: 'Buy recommended furniture directly with affiliate pricing',
                icon: '🛒'
              }
            ].map((feature) => (
              <div key={feature.number} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6 rounded-xl border border-border hover:border-accent/50 transition-colors space-y-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to redesign your space</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Room Analysis',
                description: 'Advanced computer vision understands your room layout, lighting, and existing furniture',
                features: ['Automatic room detection', 'Layout analysis', 'Style recognition']
              },
              {
                title: 'Smart Furniture Placement',
                description: 'AI recommends optimal furniture placement based on room dimensions and your style',
                features: ['Depth-aware placement', 'Style matching', 'Budget optimization']
              },
              {
                title: 'Multiple Variations',
                description: 'Generate multiple design concepts to explore different aesthetics',
                features: ['Up to 3 variations', 'Different styles', 'Price comparisons']
              },
              {
                title: 'Real Product Integration',
                description: 'All recommended furniture items are real, shoppable products with direct links',
                features: ['Real products', 'Live pricing', 'Direct purchase links']
              },
              {
                title: 'Professional Compositing',
                description: 'High-quality image compositing ensures photorealistic design previews',
                features: ['4K rendering', 'Shadow mapping', 'Lighting adjustment']
              },
              {
                title: 'Budget-Aware Recommendations',
                description: 'Get recommendations that match your budget and financial preferences',
                features: ['Budget ranges', 'Price filtering', 'Value ranking']
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:bg-secondary/50 space-y-4 group">
                <h3 className="text-lg font-semibold group-hover:text-accent transition">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((f) => (
                    <span key={f} className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Get your perfect room design in minutes</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Snap Your Space',
                description: 'Take a photo of your room using your phone or camera. Tell us your room type, style preference, and budget.',
                details: ['Supports JPG & PNG', 'Max 10MB', 'Auto-enhanced']
              },
              {
                step: '2',
                title: 'AI Analysis',
                description: 'Our AI runs a 9-stage pipeline: analyzing room structure, detecting furniture, estimating depth, and planning optimal placement.',
                details: ['Real-time processing', 'Advanced vision AI', 'Depth mapping']
              },
              {
                step: '3',
                title: 'Design Generation',
                description: 'Furniture is intelligently placed and composited into your original photo with realistic shadows and lighting.',
                details: ['Photorealistic output', 'Multiple variations', 'Style-matched']
              },
              {
                step: '4',
                title: 'Shop & Furnish',
                description: 'View all recommended products with links to purchase directly. Save your designs and come back anytime.',
                details: ['Real products', 'Live pricing', 'Easy checkout']
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center font-bold text-lg text-accent">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.details.map((detail) => (
                      <span key={detail} className="text-xs px-3 py-1 bg-secondary/50 rounded-full">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Start free, upgrade anytime</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              {
                name: 'Free',
                price: '0',
                description: 'Perfect for trying it out',
                features: [
                  '1 design per week',
                  '1 variation per design',
                  'Basic AI features',
                  'Community support'
                ],
                cta: 'Get Started',
                highlighted: false
              },
              {
                name: 'Pro',
                price: '9.99',
                period: '/month',
                description: 'For design enthusiasts',
                features: [
                  'Unlimited designs',
                  '3 variations per design',
                  'Priority processing',
                  'Email support',
                  '4K image downloads',
                  'Design history'
                ],
                cta: 'Start Free Trial',
                highlighted: true
              }
            ].map((plan, idx) => (
              <div 
                key={idx}
                className={`relative p-8 rounded-2xl border-2 transition-all ${
                  plan.highlighted 
                    ? 'border-accent bg-accent/5 scale-105 md:scale-100' 
                    : 'border-border hover:border-accent/30'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={handleGetStarted}
                    className={`w-full rounded-lg py-6 font-semibold ${
                      plan.highlighted
                        ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-secondary/50 rounded-2xl border border-border p-12">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Redesign?</h2>
          <p className="text-xl text-muted-foreground">Start creating your perfect space today. No credit card required.</p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 h-12 rounded-full font-semibold"
          >
            Create Your First Design
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">R</span>
                </div>
                <span className="font-semibold">RoomAI</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered interior design for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
                <li><Link href="/pricing" className="hover:text-foreground transition">All Plans</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 RoomAI. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition">Twitter</a>
              <a href="#" className="hover:text-foreground transition">GitHub</a>
              <a href="#" className="hover:text-foreground transition">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
