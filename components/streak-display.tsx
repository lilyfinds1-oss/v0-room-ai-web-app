'use client'

import { Flame, Target } from 'lucide-react'

interface StreakDisplayProps {
  currentStreak: number
  totalPoints: number
  weeklyChallenge?: {
    title: string
    progress: number
    target: number
    reward: number
  }
}

export function StreakDisplay({
  currentStreak,
  totalPoints,
  weeklyChallenge,
}: StreakDisplayProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {/* Streak Card */}
      <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-warning/20 to-warning/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text-secondary font-medium mb-1">Design Streak</p>
            <p className="text-4xl font-bold text-text-primary">{currentStreak}</p>
            <p className="text-xs text-text-secondary mt-1">Days in a row</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-warning/30 to-warning/10">
            <Flame className="w-8 h-8 text-warning animate-pulse" />
          </div>
        </div>

        <div className="w-full bg-white/5 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-warning to-error h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary mt-2">Keep it going to reach 30 days!</p>
      </div>

      {/* Points Card */}
      <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text-secondary font-medium mb-1">Total Points</p>
            <p className="text-4xl font-bold text-text-primary">{totalPoints}</p>
            <p className="text-xs text-text-secondary mt-1">Earned this month</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10">
            <Target className="w-8 h-8 text-secondary" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(totalPoints % 1000) / 10}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">{1000 - (totalPoints % 1000)} to next tier</p>
        </div>
      </div>

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <div className="sm:col-span-2 p-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm">
          <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Weekly Challenge
          </p>
          <p className="text-text-primary font-semibold mb-2">{weeklyChallenge.title}</p>

          <div className="flex items-center justify-between mb-2">
            <div className="w-full bg-white/5 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%`,
                }}
              />
            </div>
            <p className="ml-3 text-sm font-bold text-primary">
              +{weeklyChallenge.reward} pts
            </p>
          </div>
          <p className="text-xs text-text-secondary">
            {weeklyChallenge.progress} / {weeklyChallenge.target} completed
          </p>
        </div>
      )}
    </div>
  )
}

import { Sparkles } from 'lucide-react'
