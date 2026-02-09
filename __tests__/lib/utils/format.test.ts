import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateShort,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatYearRange,
} from '@/lib/utils/format'

describe('formatDate', () => {
  it('should format Date object correctly', () => {
    const date = new Date('2024-03-15T12:00:00Z')
    const result = formatDate(date)
    expect(result).toBe('March 15, 2024')
  })

  it('should format ISO string correctly', () => {
    const result = formatDate('2024-03-15T12:00:00Z')
    expect(result).toBe('March 15, 2024')
  })

  it('should handle different months', () => {
    expect(formatDate('2024-01-01')).toBe('January 1, 2024')
    expect(formatDate('2024-12-31')).toBe('December 31, 2024')
  })

  it('should handle leap year dates', () => {
    expect(formatDate('2024-02-29')).toBe('February 29, 2024')
  })
})

describe('formatDateShort', () => {
  it('should format Date object with short month name', () => {
    const date = new Date('2024-03-15T12:00:00Z')
    const result = formatDateShort(date)
    expect(result).toBe('Mar 15, 2024')
  })

  it('should format ISO string with short month name', () => {
    const result = formatDateShort('2024-03-15T12:00:00Z')
    expect(result).toBe('Mar 15, 2024')
  })

  it('should handle different months in short format', () => {
    expect(formatDateShort('2024-01-01')).toBe('Jan 1, 2024')
    expect(formatDateShort('2024-12-31')).toBe('Dec 31, 2024')
  })
})

describe('formatRelativeTime', () => {
  it('should format recent dates as "just now" or "X minutes ago"', () => {
    const now = new Date()
    const result = formatRelativeTime(now)
    expect(result).toContain('ago')
  })

  it('should format Date object relative to now', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    const result = formatRelativeTime(pastDate)
    expect(result).toMatch(/about 1 hour ago/)
  })

  it('should format ISO string relative to now', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    const result = formatRelativeTime(pastDate.toISOString())
    expect(result).toMatch(/1 day ago/)
  })

  it('should handle dates from the past week', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    const result = formatRelativeTime(pastDate)
    expect(result).toMatch(/3 days ago/)
  })
})

describe('formatDuration', () => {
  it('should format seconds as MM:SS', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(30)).toBe('0:30')
    expect(formatDuration(60)).toBe('1:00')
    expect(formatDuration(90)).toBe('1:30')
  })

  it('should pad seconds with leading zero', () => {
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(125)).toBe('2:05')
  })

  it('should handle multi-minute durations', () => {
    expect(formatDuration(600)).toBe('10:00') // 10 minutes
    expect(formatDuration(3600)).toBe('60:00') // 1 hour (60 minutes)
  })

  it('should handle maximum video duration (45 seconds)', () => {
    expect(formatDuration(45)).toBe('0:45')
  })

  it('should handle edge cases', () => {
    expect(formatDuration(1)).toBe('0:01')
    expect(formatDuration(59)).toBe('0:59')
    expect(formatDuration(61)).toBe('1:01')
  })
})

describe('formatNumber', () => {
  it('should format numbers below 1,000 as-is', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(1)).toBe('1')
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(999)).toBe('999')
  })

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K')
    expect(formatNumber(1500)).toBe('1.5K')
    expect(formatNumber(10000)).toBe('10.0K')
    expect(formatNumber(99999)).toBe('100.0K')
  })

  it('should format millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M')
    expect(formatNumber(1500000)).toBe('1.5M')
    expect(formatNumber(10000000)).toBe('10.0M')
  })

  it('should round to 1 decimal place', () => {
    expect(formatNumber(1234)).toBe('1.2K')
    expect(formatNumber(1567)).toBe('1.6K')
    expect(formatNumber(1234567)).toBe('1.2M')
  })

  it('should handle edge cases', () => {
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(1000)).toBe('1.0K')
    expect(formatNumber(999999)).toBe('1000.0K')
    expect(formatNumber(1000000)).toBe('1.0M')
  })
})

describe('formatYearRange', () => {
  it('should format single year when start equals end', () => {
    expect(formatYearRange(2020, 2020)).toBe('2020')
  })

  it('should format year range when end is provided', () => {
    expect(formatYearRange(2015, 2020)).toBe('2015 - 2020')
    expect(formatYearRange(2000, 2024)).toBe('2000 - 2024')
  })

  it('should format as "Present" when end is null', () => {
    expect(formatYearRange(2020, null)).toBe('2020 - Present')
  })

  it('should format as "Present" when end is undefined', () => {
    expect(formatYearRange(2020)).toBe('2020 - Present')
  })

  it('should handle long career spans', () => {
    expect(formatYearRange(1980, 2024)).toBe('1980 - 2024')
  })

  it('should handle recent start dates', () => {
    expect(formatYearRange(2024)).toBe('2024 - Present')
  })
})
