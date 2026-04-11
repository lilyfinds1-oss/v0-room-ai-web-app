'use client'

import { ReactNode } from 'react'

interface StepTimelineProps {
  steps: {
    number: number
    title: string
    description: string
    icon?: ReactNode
  }[]
}

export function StepTimeline({ steps }: StepTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent" />

      <div className="space-y-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="opacity-0"
            style={{
              animation: `slide-up 0.6s ease-out ${index * 150}ms forwards`,
            }}
          >
            <div className="flex items-center gap-8">
              {/* Left side - alternates */}
              {index % 2 === 0 ? (
                <>
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary">{step.description}</p>
                  </div>

                  {/* Center circle */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white shadow-elevation-3 glow-primary">
                    {step.icon || step.number}
                  </div>

                  <div className="flex-1" />
                </>
              ) : (
                <>
                  <div className="flex-1" />

                  {/* Center circle */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-2xl font-bold text-white shadow-elevation-3 glow-secondary">
                    {step.icon || step.number}
                  </div>

                  <div className="flex-1 text-left pl-8">
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary">{step.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
