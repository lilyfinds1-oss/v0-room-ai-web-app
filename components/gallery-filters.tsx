'use client'

import { useState } from 'react'
import { Filter, SortAsc } from 'lucide-react'

interface GalleryFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  onSortChange?: (sortBy: SortOption) => void
}

export interface FilterState {
  roomType: string
  status: string
  dateRange: string
}

export type SortOption = 'newest' | 'oldest' | 'liked' | 'budget'

const ROOM_TYPES = ['All Rooms', 'Bedroom', 'Living Room', 'Kitchen', 'Office', 'Bathroom']
const STATUSES = ['All Status', 'Completed', 'In Progress', 'Pending']
const DATE_RANGES = ['All Time', 'This Week', 'This Month', 'Last 3 Months']
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'liked', label: 'Most Liked' },
  { id: 'budget', label: 'Budget (High to Low)' },
]

export function GalleryFilters({
  onFilterChange,
  onSortChange,
}: GalleryFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    roomType: 'All Rooms',
    status: 'All Status',
    dateRange: 'All Time',
  })
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
    onSortChange?.(sort)
  }

  const hasActiveFilters =
    filters.roomType !== 'All Rooms' ||
    filters.status !== 'All Status' ||
    filters.dateRange !== 'All Time'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            hasActiveFilters
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs font-semibold">
              {[filters.roomType, filters.status, filters.dateRange].filter(
                (f) => !f.startsWith('All')
              ).length}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5">
          <SortAsc className="w-4 h-4 text-text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="bg-transparent text-sm text-text-primary focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-lg border border-white/10 bg-surface/30 backdrop-blur-sm animate-slide-down">
          {/* Room Type */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
              Room Type
            </label>
            <select
              value={filters.roomType}
              onChange={(e) => handleFilterChange('roomType', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background-dark border border-white/10 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background-dark border border-white/10 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background-dark border border-white/10 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {DATE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
