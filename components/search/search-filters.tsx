'use client'

import * as React from 'react'
import { Filter, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export interface SearchFilters {
  type: 'all' | 'animators' | 'clips'
  verificationStatus?: 'VERIFIED' | 'SPECULATIVE' | 'DISPUTED'
  yearStart?: number
  yearEnd?: number
}

interface SearchFiltersProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  totalResults?: {
    animators: number
    clips: number
  }
}

const currentYear = new Date().getFullYear()
const startYear = 1960

export function SearchFiltersPanel({ filters, onChange, totalResults }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.verificationStatus !== undefined ||
    filters.yearStart !== undefined ||
    filters.yearEnd !== undefined

  const resetFilters = () => {
    onChange({
      type: 'all',
      verificationStatus: undefined,
      yearStart: undefined,
      yearEnd: undefined,
    })
  }

  return (
    <div className="space-y-4">
      {/* Mobile toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">Active</span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Filters panel */}
      <div className={cn('space-y-6', !isOpen && 'hidden lg:block')}>
        {/* Type filter */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">Type</h3>
          <div className="space-y-2">
            {(['all', 'animators', 'clips'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={filters.type === type}
                  onChange={() => onChange({ ...filters, type })}
                  className="h-4 w-4 border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-foreground capitalize">
                  {type === 'all' ? 'All Results' : type}
                </span>
                {totalResults && type !== 'all' && (
                  <span className="ml-auto text-xs text-foreground-muted">
                    {type === 'animators' ? totalResults.animators : totalResults.clips}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Verification status (clips only) */}
        {(filters.type === 'all' || filters.type === 'clips') && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Verification Status</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="verification"
                  checked={filters.verificationStatus === undefined}
                  onChange={() => onChange({ ...filters, verificationStatus: undefined })}
                  className="h-4 w-4 border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-foreground">Any</span>
              </label>
              {(['VERIFIED', 'SPECULATIVE', 'DISPUTED'] as const).map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="verification"
                    checked={filters.verificationStatus === status}
                    onChange={() => onChange({ ...filters, verificationStatus: status })}
                    className="h-4 w-4 border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-foreground capitalize">{status.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Year range */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">Year Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="From"
              min={startYear}
              max={currentYear}
              value={filters.yearStart || ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  yearStart: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full rounded-button border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-foreground-muted">—</span>
            <input
              type="number"
              placeholder="To"
              min={startYear}
              max={currentYear}
              value={filters.yearEnd || ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  yearEnd: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full rounded-button border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Reset button (desktop) */}
        {hasActiveFilters && (
          <Button variant="secondary" size="sm" onClick={resetFilters} className="hidden lg:flex w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <FilterTag
              label={`Type: ${filters.type}`}
              onRemove={() => onChange({ ...filters, type: 'all' })}
            />
          )}
          {filters.verificationStatus && (
            <FilterTag
              label={`Status: ${filters.verificationStatus.toLowerCase()}`}
              onRemove={() => onChange({ ...filters, verificationStatus: undefined })}
            />
          )}
          {(filters.yearStart || filters.yearEnd) && (
            <FilterTag
              label={`Years: ${filters.yearStart || startYear}-${filters.yearEnd || currentYear}`}
              onRemove={() => onChange({ ...filters, yearStart: undefined, yearEnd: undefined })}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-3 py-1 text-xs text-foreground">
      {label}
      <button onClick={onRemove} className="hover:text-error">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
