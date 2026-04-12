'use client'

import { useEffect, useState } from 'react'
import { Cloud, Sun, Moon } from 'lucide-react'

interface PersonalizedGreetingProps {
  userName: string
  designCount: number
}

export function PersonalizedGreeting({ userName, designCount }: PersonalizedGreetingProps) {
  const [greeting, setGreeting] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>(
    'morning'
  )

  useEffect(() => {
    const hour = new Date().getHours()

    if (hour < 12) {
      setTimeOfDay('morning')
    } else if (hour < 17) {
      setTimeOfDay('afternoon')
    } else if (hour < 21) {
      setTimeOfDay('evening')
    } else {
      setTimeOfDay('night')
    }
  }, [])

  const greetings = {
    morning: [
      'Rise and shine! Time to create something amazing.',
      'Good morning! Your designs are waiting to be discovered.',
      'Morning inspiration awaits. Let&apos;s create together!',
      'A fresh start to a creative day!',
    ],
    afternoon: [
      'Keep the creativity flowing!',
      'Afternoon inspiration hits different.',
      'More designs, more vibes!',
      'The perfect time to explore new ideas.',
    ],
    evening: [
      'Evening sessions hit different. Let&apos;s create!',
      'As the sun sets, creativity rises.',
      'Wind down with some design inspiration.',
      'Perfect time to reflect on your creations.',
    ],
    night: [
      'Burning the midnight oil? Let&apos;s get creative!',
      'Night owls create the best designs.',
      'Nighttime inspiration is real.',
      'Your designs shine brightest in the dark.',
    ],
  }

  const TimeIcon = {
    morning: <Sun className="w-6 h-6 text-yellow-400" />,
    afternoon: <Sun className="w-6 h-6 text-orange-400" />,
    evening: <Cloud className="w-6 h-6 text-purple-400" />,
    night: <Moon className="w-6 h-6 text-blue-400" />,
  }

  const randomGreeting = greetings[timeOfDay][Math.floor(Math.random() * greetings[timeOfDay].length)]

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm p-8 animate-slide-up">
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 animate-float" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -ml-16 -mb-16 animate-float" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {TimeIcon[timeOfDay]}
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {timeOfDay}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back, {userName.split(' ')[0]}!
            </h2>
            <p className="text-text-secondary">{randomGreeting}</p>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold gradient-text">{designCount}</div>
            <p className="text-sm text-text-secondary mt-1">
              {designCount === 1 ? 'Design' : 'Designs'} created
            </p>
          </div>
        </div>

        {/* Quick tip */}
        <div className="mt-6 pt-4 border-t border-white/10 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary mb-1">Pro Tip:</p>
          <p>
            {designCount === 0
              ? 'Get started by uploading your first room photo to see AI-powered design variations!'
              : `You&apos;re on a creative streak! Keep designing to unlock new achievements.`}
          </p>
        </div>
      </div>
    </div>
  )
}
