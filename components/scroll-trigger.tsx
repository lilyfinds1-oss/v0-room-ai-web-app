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
            entry.target.style.opacity = '1'
            observer.unobserve(entry.target)
          }, delay)
        }
      },
      { threshold }
    )

    if (ref.current) {
      // Set initial state: invisible but will animate in
      ref.current.style.opacity = '0'
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [animation, delay, threshold])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

