'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, newPosition)))
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newPosition = ((e.touches[0].clientX - rect.left) / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, newPosition)))
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-white/10 bg-background-dark cursor-col-resize select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <div className="relative w-full aspect-video">
        <Image src={afterImage} alt={afterLabel} fill className="object-cover" priority />
      </div>

      {/* Before Image (Overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%`, transition: isDragging ? 'none' : 'width 0.3s ease' }}
      >
        <div className="relative w-screen aspect-video">
          <Image src={beforeImage} alt={beforeLabel} fill className="object-cover" priority />
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-white to-secondary hover:w-2 transition-all"
        style={{
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Handle Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg flex items-center justify-center border-2 border-white/30">
          <div className="flex gap-1">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.293 5.293a1 1 0 011.414 0L10 6.586l.293-.293a1 1 0 111.414 1.414L11.414 8l.293.293a1 1 0 01-1.414 1.414L10 9.414l-.293.293a1 1 0 01-1.414-1.414L8.586 8l-.293-.293a1 1 0 010-1.414z" />
            </svg>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.707 5.293a1 1 0 010 1.414L10.414 8l1.293 1.293a1 1 0 01-1.414 1.414L9 9.414l-1.293 1.293a1 1 0 01-1.414-1.414L7.586 8 6.293 6.707a1 1 0 011.414-1.414L9 6.586l1.293-1.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 pointer-events-none">
        <div className="px-3 py-1 bg-background-dark/80 backdrop-blur-sm rounded-full border border-white/10">
          <p className="text-sm font-semibold text-text-primary">{beforeLabel}</p>
        </div>
        <div className="px-3 py-1 bg-background-dark/80 backdrop-blur-sm rounded-full border border-white/10">
          <p className="text-sm font-semibold text-text-primary">{afterLabel}</p>
        </div>
      </div>
    </div>
  )
}
