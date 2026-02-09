import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersReducedMotion,
  usePrefersDarkMode,
} from '@/lib/hooks/use-media-query'

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  const listeners: ((event: MediaQueryListEvent) => void)[] = []

  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.push(listener)
    }),
    removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }),
    dispatchEvent: vi.fn(),
    _trigger: (newMatches: boolean) => {
      listeners.forEach((listener) => {
        listener({ matches: newMatches } as MediaQueryListEvent)
      })
    },
    _listeners: listeners,
  }
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return initial match state', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(true)
  })

  it('should return false when query does not match', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(false)
  })

  it('should update when media query changes', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)

    // Simulate media query change
    act(() => {
      mediaQueryList._trigger(true)
    })

    expect(result.current).toBe(true)
  })

  it('should cleanup listener on unmount', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(mediaQueryList.addEventListener).toHaveBeenCalled()

    unmount()

    expect(mediaQueryList.removeEventListener).toHaveBeenCalled()
  })

  it('should update listener when query changes', () => {
    const mediaQueryList1 = mockMatchMedia(true)
    const mediaQueryList2 = mockMatchMedia(false)

    let queryListToReturn = mediaQueryList1
    window.matchMedia = vi.fn(() => queryListToReturn as unknown as MediaQueryList)

    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    )

    expect(result.current).toBe(true)

    // Change the query
    queryListToReturn = mediaQueryList2
    rerender({ query: '(max-width: 767px)' })

    expect(result.current).toBe(false)
  })
})

describe('useIsMobile', () => {
  it('should return true on mobile viewport', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn((query) => {
      if (query === '(max-width: 639px)') {
        return mediaQueryList as unknown as MediaQueryList
      }
      return mockMatchMedia(false) as unknown as MediaQueryList
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return false on non-mobile viewport', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})

describe('useIsTablet', () => {
  it('should return true on tablet viewport', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn((query) => {
      if (query === '(min-width: 640px) and (max-width: 1023px)') {
        return mediaQueryList as unknown as MediaQueryList
      }
      return mockMatchMedia(false) as unknown as MediaQueryList
    })

    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(true)
  })

  it('should return false on non-tablet viewport', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(false)
  })
})

describe('useIsDesktop', () => {
  it('should return true on desktop viewport', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn((query) => {
      if (query === '(min-width: 1024px)') {
        return mediaQueryList as unknown as MediaQueryList
      }
      return mockMatchMedia(false) as unknown as MediaQueryList
    })

    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(true)
  })

  it('should return false on non-desktop viewport', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(false)
  })
})

describe('useIsLargeDesktop', () => {
  it('should return true on large desktop viewport', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn((query) => {
      if (query === '(min-width: 1280px)') {
        return mediaQueryList as unknown as MediaQueryList
      }
      return mockMatchMedia(false) as unknown as MediaQueryList
    })

    const { result } = renderHook(() => useIsLargeDesktop())
    expect(result.current).toBe(true)
  })

  it('should return false on non-large-desktop viewport', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsLargeDesktop())
    expect(result.current).toBe(false)
  })
})

describe('usePrefersReducedMotion', () => {
  it('should return true when user prefers reduced motion', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return mediaQueryList as unknown as MediaQueryList
      }
      return mockMatchMedia(false) as unknown as MediaQueryList
    })

    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('should return false when user does not prefer reduced motion', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })
})

describe('usePrefersDarkMode', () => {
  it('should return true when user prefers dark mode', () => {
    const mediaQueryList = mockMatchMedia(true)
    window.matchMedia = vi.fn((query) => {
      if (query === '(prefers-color-scheme: dark)') {
        return mediaQueryList as unknown as MediaQueryList
      }
      return mockMatchMedia(false) as unknown as MediaQueryList
    })

    const { result } = renderHook(() => usePrefersDarkMode())
    expect(result.current).toBe(true)
  })

  it('should return false when user does not prefer dark mode', () => {
    const mediaQueryList = mockMatchMedia(false)
    window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList)

    const { result } = renderHook(() => usePrefersDarkMode())
    expect(result.current).toBe(false)
  })
})
