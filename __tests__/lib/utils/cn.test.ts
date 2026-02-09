import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils/cn'

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle single class name', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should filter out falsy values', () => {
    expect(cn('foo', false, 'bar', null, 'baz', undefined)).toBe('foo bar baz')
  })

  it('should handle conditional classes with &&', () => {
    expect(cn('foo', true && 'bar')).toBe('foo bar')
    expect(cn('foo', false && 'bar')).toBe('foo')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
    expect(cn(['foo', false, 'bar'])).toBe('foo bar')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should merge Tailwind classes correctly', () => {
    // tailwind-merge should keep the last conflicting class
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle Tailwind color conflicts', () => {
    expect(cn('text-red-500', 'text-blue-600')).toBe('text-blue-600')
  })

  it('should handle Tailwind sizing conflicts', () => {
    expect(cn('h-10', 'h-12')).toBe('h-12')
    expect(cn('w-full', 'w-1/2')).toBe('w-1/2')
  })

  it('should preserve non-conflicting Tailwind classes', () => {
    expect(cn('p-4 text-red-500', 'bg-blue-500')).toBe('p-4 text-red-500 bg-blue-500')
  })

  it('should handle complex Tailwind class merging', () => {
    expect(cn('p-4 m-2', 'p-6 bg-white')).toBe('m-2 p-6 bg-white')
  })

  it('should handle mixed input types', () => {
    expect(
      cn('base-class', { active: true, disabled: false }, ['extra', 'classes'], 'final')
    ).toBe('base-class active extra classes final')
  })

  it('should handle responsive variants', () => {
    expect(cn('text-sm', 'md:text-base', 'lg:text-lg')).toBe(
      'text-sm md:text-base lg:text-lg'
    )
  })

  it('should handle hover and focus variants', () => {
    expect(cn('hover:bg-blue-500', 'focus:ring-2')).toBe('hover:bg-blue-500 focus:ring-2')
  })

  it('should merge dark mode variants correctly', () => {
    expect(cn('bg-white dark:bg-black', 'text-black dark:text-white')).toBe(
      'bg-white dark:bg-black text-black dark:text-white'
    )
  })

  it('should handle arbitrary values', () => {
    expect(cn('top-[117px]', 'left-[344px]')).toBe('top-[117px] left-[344px]')
  })

  it('should handle important modifier', () => {
    expect(cn('!font-bold', '!text-red-500')).toBe('!font-bold !text-red-500')
  })

  it('should handle conflicting classes with variants', () => {
    expect(cn('hover:text-red-500', 'hover:text-blue-500')).toBe('hover:text-blue-500')
  })

  it('should handle duplicate classes (clsx behavior)', () => {
    // Note: clsx and tailwind-merge don't deduplicate non-conflicting classes
    expect(cn('foo', 'foo', 'bar', 'bar')).toBe('foo foo bar bar')
  })

  it('should handle negative values', () => {
    expect(cn('-top-4', '-left-2')).toBe('-top-4 -left-2')
  })

  it('should handle peer and group variants', () => {
    expect(cn('peer-hover:bg-blue-500', 'group-focus:ring-2')).toBe(
      'peer-hover:bg-blue-500 group-focus:ring-2'
    )
  })

  it('should handle before and after pseudo-elements', () => {
    expect(cn('before:content-[""]', 'after:content-[""]')).toBe(
      'before:content-[""] after:content-[""]'
    )
  })

  it('should handle nested conditional logic', () => {
    const isActive = true
    const isDisabled = false
    expect(
      cn('base', isActive && 'active', isDisabled && 'disabled', !isDisabled && 'enabled')
    ).toBe('base active enabled')
  })
})
