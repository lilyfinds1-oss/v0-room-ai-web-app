'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollTriggerProps {
  children: ReactNode
  className?: string
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'scale-in' | 'slide-left' | 'slide-right'
  delay?: number
  threshold?: number
}

export function ScrollTrigger({
  children,
  className = '',
  animation = 'fade-in',
  delay = 0,
  threshold = 0.1,
}: ScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add(`animate-${animation}`)
            observer.unobserve(entry.target)
          }, delay)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [animation, delay, threshold])

  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  )
}
