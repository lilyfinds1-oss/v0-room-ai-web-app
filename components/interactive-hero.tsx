'use client'

import { useEffect, useRef, useState } from 'react'

export function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [orbPositions, setOrbPositions] = useState([
    { x: 0, y: 0, delay: 0 },
    { x: 0, y: 0, delay: 100 },
    { x: 0, y: 0, delay: 200 },
  ])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      setMousePosition({ x, y })

      // Update orb positions with parallax effect
      setOrbPositions(
        orbPositions.map((orb, idx) => ({
          ...orb,
          x: x * (20 + idx * 10),
          y: y * (20 + idx * 10),
        }))
      )
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [orbPositions])

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-background-dark overflow-hidden flex items-center justify-center"
    >
      {/* Interactive gradient orbs */}
      {orbPositions.map((orb, idx) => (
        <div
          key={idx}
          className="absolute rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"
          style={{
            width: `${400 - idx * 50}px`,
            height: `${400 - idx * 50}px`,
            background:
              idx === 0
                ? 'linear-gradient(135deg, #7c3aed 0%, transparent 70%)'
                : idx === 1
                  ? 'linear-gradient(135deg, #0ea5e9 0%, transparent 70%)'
                  : 'linear-gradient(135deg, #06b6d4 0%, transparent 70%)',
            transform: `translate(calc(-50% + ${orb.x}px), calc(-50% + ${orb.y}px))`,
            transition: 'transform 0.3s ease-out',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <span className="gradient-text">Transform Your Space</span>
          <br />
          <span className="text-text-primary">With AI Design</span>
        </h1>
        <p
          className="text-xl text-text-secondary max-w-2xl mx-auto mb-8 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          Upload a photo of your room and watch as our AI generates unlimited beautiful design variations just for you.
        </p>
      </div>
    </div>
  )
}
