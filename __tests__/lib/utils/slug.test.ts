import { describe, it, expect } from 'vitest'
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug'

describe('generateSlug', () => {
  it('should convert text to lowercase slug', () => {
    expect(generateSlug('Yutaka Nakamura')).toBe('yutaka-nakamura')
    expect(generateSlug('UPPERCASE TEXT')).toBe('uppercase-text')
    expect(generateSlug('MixedCase Text')).toBe('mixedcase-text')
  })

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('multiple words here')).toBe('multiple-words-here')
    expect(generateSlug('one two three four')).toBe('one-two-three-four')
  })

  it('should remove special characters', () => {
    expect(generateSlug('text@with#special$chars')).toBe('textwithspecialchars')
    expect(generateSlug('hello!world?')).toBe('helloworld')
    expect(generateSlug('test@email.com')).toBe('testemailcom')
  })

  it('should handle Japanese characters', () => {
    expect(generateSlug('中村豊')).toBeTruthy() // Will be transliterated or removed
    expect(generateSlug('アニメーター')).toBeTruthy()
  })

  it('should trim whitespace', () => {
    expect(generateSlug('  trimmed text  ')).toBe('trimmed-text')
    expect(generateSlug(' leading')).toBe('leading')
    expect(generateSlug('trailing ')).toBe('trailing')
  })

  it('should handle empty and edge cases', () => {
    expect(generateSlug('')).toBe('')
    expect(generateSlug('   ')).toBe('')
    expect(generateSlug('-')).toBe('')
  })

  it('should handle numbers correctly', () => {
    expect(generateSlug('Cowboy Bebop 1998')).toBe('cowboy-bebop-1998')
    expect(generateSlug('Episode 01')).toBe('episode-01')
  })

  it('should handle anime titles', () => {
    expect(generateSlug('Attack on Titan')).toBe('attack-on-titan')
    expect(generateSlug("JoJo's Bizarre Adventure")).toBe('jojos-bizarre-adventure')
    expect(generateSlug('Fullmetal Alchemist: Brotherhood')).toBe('fullmetal-alchemist-brotherhood')
  })

  it('should handle animator names', () => {
    expect(generateSlug('Yutaka Nakamura')).toBe('yutaka-nakamura')
    expect(generateSlug('Toshiyuki Inoue')).toBe('toshiyuki-inoue')
    expect(generateSlug('Mitsuo Iso')).toBe('mitsuo-iso')
  })

  it('should handle technique names', () => {
    expect(generateSlug('Full Limited Animation')).toBe('full-limited-animation')
    expect(generateSlug('Impact Frames')).toBe('impact-frames')
  })

  it('should collapse multiple spaces/hyphens', () => {
    expect(generateSlug('multiple   spaces')).toBe('multiple-spaces')
    expect(generateSlug('word1--word2')).toBe('word1-word2')
  })
})

describe('generateUniqueSlug', () => {
  it('should return base slug when no conflicts', () => {
    const result = generateUniqueSlug('Test Animator', [])
    expect(result).toBe('test-animator')
  })

  it('should return base slug when not in existing slugs', () => {
    const existingSlugs = ['yutaka-nakamura', 'toshiyuki-inoue']
    const result = generateUniqueSlug('Mitsuo Iso', existingSlugs)
    expect(result).toBe('mitsuo-iso')
  })

  it('should append -1 for first conflict', () => {
    const existingSlugs = ['test-animator']
    const result = generateUniqueSlug('Test Animator', existingSlugs)
    expect(result).toBe('test-animator-1')
  })

  it('should increment counter for multiple conflicts', () => {
    const existingSlugs = ['test-animator', 'test-animator-1', 'test-animator-2']
    const result = generateUniqueSlug('Test Animator', existingSlugs)
    expect(result).toBe('test-animator-3')
  })

  it('should handle gaps in numbering', () => {
    const existingSlugs = ['test-animator', 'test-animator-1']
    // Should return test-animator-2 (doesn't reuse gaps)
    const result = generateUniqueSlug('Test Animator', existingSlugs)
    expect(result).toBe('test-animator-2')
  })

  it('should handle large arrays of existing slugs', () => {
    const existingSlugs = Array.from({ length: 10 }, (_, i) =>
      i === 0 ? 'popular-animator' : `popular-animator-${i}`
    )
    const result = generateUniqueSlug('Popular Animator', existingSlugs)
    expect(result).toBe('popular-animator-10')
  })

  it('should work with complex slug names', () => {
    const existingSlugs = ['fullmetal-alchemist-brotherhood']
    const result = generateUniqueSlug('Fullmetal Alchemist: Brotherhood', existingSlugs)
    expect(result).toBe('fullmetal-alchemist-brotherhood-1')
  })

  it('should handle empty existing slugs array', () => {
    const result = generateUniqueSlug('New Animator', [])
    expect(result).toBe('new-animator')
  })

  it('should handle case-insensitive comparisons', () => {
    // Slug generation converts to lowercase, so this tests consistency
    const existingSlugs = ['test-animator']
    const result = generateUniqueSlug('TEST ANIMATOR', existingSlugs)
    expect(result).toBe('test-animator-1')
  })

  it('should handle special characters in unique slug generation', () => {
    const existingSlugs = ['jojos-bizarre-adventure']
    const result = generateUniqueSlug("JoJo's Bizarre Adventure", existingSlugs)
    expect(result).toBe('jojos-bizarre-adventure-1')
  })
})
