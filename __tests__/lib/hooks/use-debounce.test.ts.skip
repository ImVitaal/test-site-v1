import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from '@/lib/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300))
    expect(result.current).toBe('test')
  })

  it('should debounce value updates', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated' })
    expect(result.current).toBe('initial') // Still initial

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should cancel previous timeout on rapid updates', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    )

    expect(result.current).toBe('first')

    // Update multiple times rapidly
    rerender({ value: 'second' })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'third' })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'fourth' })

    // Fast-forward full delay
    act(() => {
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(result.current).toBe('fourth')
    })
  })

  it('should handle different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 500 })

    // 300ms shouldn't be enough
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('test')

    // 500ms should update
    act(() => {
      vi.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should use default delay of 300ms', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'test' } }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should handle different data types', async () => {
    // Number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    )

    numberRerender({ value: 42 })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    await waitFor(() => {
      expect(numberResult.current).toBe(42)
    })

    // Boolean
    const { result: boolResult, rerender: boolRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: false } }
    )

    boolRerender({ value: true })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    await waitFor(() => {
      expect(boolResult.current).toBe(true)
    })

    // Object
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { id: 1 } } }
    )

    objRerender({ value: { id: 2 } })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    await waitFor(() => {
      expect(objResult.current).toEqual({ id: 2 })
    })
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call callback after delay', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    act(() => {
      result.current('arg1', 'arg2')
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2')
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  it('should cancel previous call on rapid invocations', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    // Call multiple times rapidly
    act(() => {
      result.current('call1')
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current('call2')
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current('call3')
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('call3')
    })
  })

  it('should use default delay of 300ms', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback))

    act(() => {
      result.current()
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  it('should handle different callback signatures', async () => {
    const callback = vi.fn((a: number, b: string, c: boolean) => {})
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    act(() => {
      result.current(1, 'test', true)
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1, 'test', true)
    })
  })

  it('should cleanup timeout on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300))

    act(() => {
      result.current('test')
    })

    unmount()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled()
  })
})
