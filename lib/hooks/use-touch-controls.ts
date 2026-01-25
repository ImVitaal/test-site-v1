import { useCallback, useRef, useState } from 'react'

// Edge safe zone in pixels to avoid browser back/forward gestures
const EDGE_SAFE_ZONE = 20

// Thresholds for gesture detection
const LONG_PRESS_DELAY = 300 // ms before long press triggers
const TAP_MAX_DURATION = 250 // ms - longer is considered hold
const DOUBLE_TAP_DELAY = 300 // ms between taps for double tap
const MIN_DRAG_DISTANCE = 10 // px before drag is detected

type TapZone = 'left' | 'center' | 'right'

interface TouchState {
  isScrubbing: boolean
  scrubStartX: number
  scrubStartTime: number
  scrubDelta: number
}

interface TouchControlsOptions {
  onLeftTap?: () => void
  onCenterTap?: () => void
  onRightTap?: () => void
  onDoubleTap?: () => void
  onScrubStart?: () => void
  onScrubMove?: (deltaSeconds: number) => void
  onScrubEnd?: () => void
  // Video duration for scrub calculation
  duration?: number
  // Current time for scrub reference
  currentTime?: number
  // Scrub sensitivity (seconds per 100px drag)
  scrubSensitivity?: number
}

interface TouchControlsReturn {
  touchState: TouchState
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
    onTouchCancel: () => void
  }
  // Feedback state for UI
  lastTapZone: TapZone | null
  showTapFeedback: boolean
}

/**
 * Hook for touch controls on video player
 * Implements:
 * - Tap zones (left/center/right) like Instagram Stories
 * - Long press + drag for precision scrubbing
 * - Double tap for favorite
 * - Edge safe zones to avoid browser gestures
 */
export function useTouchControls(options: TouchControlsOptions): TouchControlsReturn {
  const {
    onLeftTap,
    onCenterTap,
    onRightTap,
    onDoubleTap,
    onScrubStart,
    onScrubMove,
    onScrubEnd,
    duration = 0,
    currentTime = 0,
    scrubSensitivity = 5, // 5 seconds per 100px drag
  } = options

  const [touchState, setTouchState] = useState<TouchState>({
    isScrubbing: false,
    scrubStartX: 0,
    scrubStartTime: 0,
    scrubDelta: 0,
  })

  const [lastTapZone, setLastTapZone] = useState<TapZone | null>(null)
  const [showTapFeedback, setShowTapFeedback] = useState(false)

  // Refs for gesture tracking
  const touchStartRef = useRef<{
    x: number
    y: number
    time: number
    target: EventTarget | null
  } | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTapTimeRef = useRef<number>(0)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Determine tap zone based on touch position
   */
  const getTapZone = useCallback((x: number, containerWidth: number): TapZone => {
    const leftThreshold = containerWidth * 0.33
    const rightThreshold = containerWidth * 0.67

    if (x < leftThreshold) return 'left'
    if (x > rightThreshold) return 'right'
    return 'center'
  }, [])

  /**
   * Check if touch is in safe zone (not near edges)
   */
  const isInSafeZone = useCallback((x: number, containerWidth: number): boolean => {
    return x > EDGE_SAFE_ZONE && x < containerWidth - EDGE_SAFE_ZONE
  }, [])

  /**
   * Show tap feedback briefly
   */
  const showFeedback = useCallback((zone: TapZone) => {
    setLastTapZone(zone)
    setShowTapFeedback(true)

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
    }

    feedbackTimerRef.current = setTimeout(() => {
      setShowTapFeedback(false)
    }, 400)
  }, [])

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = touch.clientX - rect.left
    const containerWidth = rect.width

    // Skip if touch is in edge danger zone
    if (!isInSafeZone(x, containerWidth)) {
      return
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      target: e.target,
    }

    // Start long press timer for scrubbing
    longPressTimerRef.current = setTimeout(() => {
      setTouchState({
        isScrubbing: true,
        scrubStartX: touch.clientX,
        scrubStartTime: currentTime,
        scrubDelta: 0,
      })
      onScrubStart?.()
    }, LONG_PRESS_DELAY)
  }, [currentTime, isInSafeZone, onScrubStart])

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    // If moved significantly, cancel long press (this is a drag/scroll)
    if (
      !touchState.isScrubbing &&
      (Math.abs(deltaX) > MIN_DRAG_DISTANCE || Math.abs(deltaY) > MIN_DRAG_DISTANCE)
    ) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    // Handle scrubbing
    if (touchState.isScrubbing) {
      e.preventDefault() // Prevent scrolling while scrubbing

      const scrubDelta = (deltaX / 100) * scrubSensitivity
      const newTime = Math.max(0, Math.min(duration, touchState.scrubStartTime + scrubDelta))

      setTouchState((prev) => ({ ...prev, scrubDelta }))
      onScrubMove?.(newTime - currentTime)
    }
  }, [touchState.isScrubbing, touchState.scrubStartTime, currentTime, duration, scrubSensitivity, onScrubMove])

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle scrub end
    if (touchState.isScrubbing) {
      setTouchState({
        isScrubbing: false,
        scrubStartX: 0,
        scrubStartTime: 0,
        scrubDelta: 0,
      })
      onScrubEnd?.()
      touchStartRef.current = null
      return
    }

    // Handle tap
    if (touchStartRef.current) {
      const touchDuration = Date.now() - touchStartRef.current.time
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = touchStartRef.current.x - rect.left
      const containerWidth = rect.width

      // Only count as tap if short duration and within safe zone
      if (touchDuration < TAP_MAX_DURATION && isInSafeZone(x, containerWidth)) {
        const now = Date.now()
        const timeSinceLastTap = now - lastTapTimeRef.current

        // Check for double tap
        if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
          onDoubleTap?.()
          lastTapTimeRef.current = 0 // Reset to prevent triple-tap
        } else {
          // Single tap
          const zone = getTapZone(x, containerWidth)
          showFeedback(zone)

          switch (zone) {
            case 'left':
              onLeftTap?.()
              break
            case 'center':
              onCenterTap?.()
              break
            case 'right':
              onRightTap?.()
              break
          }

          lastTapTimeRef.current = now
        }
      }

      touchStartRef.current = null
    }
  }, [
    touchState.isScrubbing,
    isInSafeZone,
    getTapZone,
    showFeedback,
    onLeftTap,
    onCenterTap,
    onRightTap,
    onDoubleTap,
    onScrubEnd,
  ])

  /**
   * Handle touch cancel
   */
  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (touchState.isScrubbing) {
      setTouchState({
        isScrubbing: false,
        scrubStartX: 0,
        scrubStartTime: 0,
        scrubDelta: 0,
      })
      onScrubEnd?.()
    }

    touchStartRef.current = null
  }, [touchState.isScrubbing, onScrubEnd])

  return {
    touchState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    lastTapZone,
    showTapFeedback,
  }
}
