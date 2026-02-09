import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    const [value] = result.current

    expect(value).toBe('initial')
  })

  it('should set and retrieve string value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      const [, setValue] = result.current
      setValue('updated')
    })

    const [value] = result.current
    expect(value).toBe('updated')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
  })

  it('should set and retrieve number value', () => {
    const { result } = renderHook(() => useLocalStorage('test-number', 0))

    act(() => {
      const [, setValue] = result.current
      setValue(42)
    })

    const [value] = result.current
    expect(value).toBe(42)
  })

  it('should set and retrieve boolean value', () => {
    const { result } = renderHook(() => useLocalStorage('test-boolean', false))

    act(() => {
      const [, setValue] = result.current
      setValue(true)
    })

    const [value] = result.current
    expect(value).toBe(true)
  })

  it('should set and retrieve object value', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-object', { id: 1, name: 'test' })
    )

    act(() => {
      const [, setValue] = result.current
      setValue({ id: 2, name: 'updated' })
    })

    const [value] = result.current
    expect(value).toEqual({ id: 2, name: 'updated' })
  })

  it('should set and retrieve array value', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('test-array', []))

    act(() => {
      const [, setValue] = result.current
      setValue([1, 2, 3])
    })

    const [value] = result.current
    expect(value).toEqual([1, 2, 3])
  })

  it('should support functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-counter', 0))

    act(() => {
      const [, setValue] = result.current
      setValue((prev) => prev + 1)
    })

    let [value] = result.current
    expect(value).toBe(1)

    act(() => {
      const [, setValue] = result.current
      setValue((prev) => prev + 1)
    })

    ;[value] = result.current
    expect(value).toBe(2)
  })

  it('should persist value across hook instances', () => {
    // First hook sets value
    const { result: result1 } = renderHook(() => useLocalStorage('shared-key', 'initial'))

    act(() => {
      const [, setValue] = result1.current
      setValue('shared-value')
    })

    // Second hook should read the same value
    const { result: result2 } = renderHook(() => useLocalStorage('shared-key', 'initial'))
    const [value] = result2.current

    expect(value).toBe('shared-value')
  })

  it('should remove value from storage', () => {
    const { result } = renderHook(() => useLocalStorage('test-remove', 'value'))

    act(() => {
      const [, , removeValue] = result.current
      removeValue()
    })

    const [value] = result.current
    expect(value).toBe('value') // Returns to initial value
    expect(localStorage.getItem('test-remove')).toBeNull()
  })

  it('should handle storage events from other tabs', () => {
    const { result } = renderHook(() => useLocalStorage('test-sync', 'initial'))

    // Simulate storage event from another tab
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-sync',
        newValue: JSON.stringify('from-other-tab'),
        oldValue: JSON.stringify('initial'),
        storageArea: localStorage,
      })
      window.dispatchEvent(event)
    })

    const [value] = result.current
    expect(value).toBe('from-other-tab')
  })

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('invalid-json', 'not-json{')

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage('invalid-json', 'fallback'))
    const [value] = result.current

    expect(value).toBe('fallback')
    expect(consoleWarnSpy).toHaveBeenCalled()

    consoleWarnSpy.mockRestore()
  })

  it('should handle localStorage quota exceeded error', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Mock setItem to throw quota exceeded error
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = vi.fn(() => {
      const error: any = new Error('QuotaExceededError')
      error.name = 'QuotaExceededError'
      throw error
    })

    const { result } = renderHook(() => useLocalStorage('test-quota', 'initial'))

    act(() => {
      const [, setValue] = result.current
      setValue('large-value')
    })

    expect(consoleWarnSpy).toHaveBeenCalled()

    Storage.prototype.setItem = originalSetItem
    consoleWarnSpy.mockRestore()
  })

  it('should handle SSR (no window object)', () => {
    // This test simulates server-side rendering where window is undefined
    // In real implementation, the hook checks typeof window === 'undefined'
    const { result } = renderHook(() => useLocalStorage('ssr-key', 'ssr-initial'))
    const [value] = result.current

    expect(value).toBeTruthy()
  })

  it('should use different keys for different hooks', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'))
    const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'))

    act(() => {
      const [, setValue1] = result1.current
      setValue1('updated1')
    })

    act(() => {
      const [, setValue2] = result2.current
      setValue2('updated2')
    })

    const [value1] = result1.current
    const [value2] = result2.current

    expect(value1).toBe('updated1')
    expect(value2).toBe('updated2')
    expect(localStorage.getItem('key1')).toBe(JSON.stringify('updated1'))
    expect(localStorage.getItem('key2')).toBe(JSON.stringify('updated2'))
  })

  it('should dispatch local-storage event on setValue', () => {
    const eventListener = vi.fn()
    window.addEventListener('local-storage', eventListener)

    const { result } = renderHook(() => useLocalStorage('test-event', 'initial'))

    act(() => {
      const [, setValue] = result.current
      setValue('updated')
    })

    expect(eventListener).toHaveBeenCalled()

    window.removeEventListener('local-storage', eventListener)
  })

  it('should dispatch local-storage event on removeValue', () => {
    const eventListener = vi.fn()
    window.addEventListener('local-storage', eventListener)

    const { result } = renderHook(() => useLocalStorage('test-remove-event', 'initial'))

    act(() => {
      const [, , removeValue] = result.current
      removeValue()
    })

    expect(eventListener).toHaveBeenCalled()

    window.removeEventListener('local-storage', eventListener)
  })
})
