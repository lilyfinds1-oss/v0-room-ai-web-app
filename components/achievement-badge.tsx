'use client'

import { Trophy, Star, Zap, Heart, Crown, Sparkles } from 'lucide-react'
import { ReactNode } from 'react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: 'trophy' | 'star' | 'zap' | 'heart' | 'crown' | 'sparkles'
  unlockedAt?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
}

const ICON_MAP: Record<string, ReactNode> = {
  trophy: <Trophy className="w-full h-full" />,
  star: <Star className="w-full h-full" />,
  zap: <Zap className="w-full h-full" />,
  heart: <Heart className="w-full h-full" />,
  crown: <Crown className="w-full h-full" />,
  sparkles: <Sparkles className="w-full h-full" />,
}

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500 border-gray-500/50',
  rare: 'from-blue-400 to-blue-500 border-blue-500/50',
  epic: 'from-purple-400 to-purple-500 border-purple-500/50',
  legendary: 'from-yellow-400 to-yellow-500 border-yellow-500/50',
}

const RARITY_GLOW = {
  common: 'shadow-gray-500/50',
  rare: 'shadow-blue-500/50',
  epic: 'shadow-purple-500/50',
  legendary: 'shadow-yellow-500/50',
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const isUnlocked = !!achievement.unlockedAt

  return (
    <div className="group relative">
      <div
        className={`${sizes[size]} relative rounded-full border-2 ${RARITY_COLORS[achievement.rarity]} bg-gradient-to-br transition-all duration-300 ${
          isUnlocked
            ? `${RARITY_GLOW[achievement.rarity]} shadow-lg hover:scale-110`
            : 'opacity-40 grayscale'
        } flex items-center justify-center text-white cursor-pointer`}
      >
        {ICON_MAP[achievement.icon]}

        {isUnlocked && (
          <div className="absolute inset-0 rounded-full animate-pulse border-2 border-white/30" />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-background-dark border border-white/20 rounded-lg p-3 text-center whitespace-nowrap text-sm shadow-lg">
          <p className="font-semibold text-text-primary">{achievement.title}</p>
          <p className="text-xs text-text-secondary mt-1">{achievement.description}</p>
          <p className="text-xs text-primary mt-1 capitalize">{achievement.rarity}</p>
        </div>
      </div>
    </div>
  )
}
