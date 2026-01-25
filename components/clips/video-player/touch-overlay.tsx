'use client'

import { useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Heart } from 'lucide-react'
import { usePlayer } from './player-context'
import { useTouchControls } from '@/lib/hooks/use-touch-controls'
import { useIsMobile } from '@/lib/hooks/use-media-query'
import { cn } from '@/lib/utils/cn'
import { FRAME_DURATION } from '@/config/constants'

// Number of frames to skip on tap (5 frames = ~0.2s at 24fps)
const FRAMES_PER_TAP = 5
const SECONDS_PER_TAP = FRAMES_PER_TAP * FRAME_DURATION

interface TouchOverlayProps {
  className?: string
  onFavorite?: () => void
}

export function TouchOverlay({ className, onFavorite }: TouchOverlayProps) {
  const isMobile = useIsMobile()
  const { state, togglePlay, seek, pause } = usePlayer()

  // Skip back by 5 frames
  const handleLeftTap = useCallback(() => {
    const newTime = Math.max(0, state.currentTime - SECONDS_PER_TAP)
    seek(newTime)
  }, [state.currentTime, seek])

  // Skip forward by 5 frames
  const handleRightTap = useCallback(() => {
    const newTime = Math.min(state.duration, state.currentTime + SECONDS_PER_TAP)
    seek(newTime)
  }, [state.currentTime, state.duration, seek])

  // Play/pause
  const handleCenterTap = useCallback(() => {
    togglePlay()
  }, [togglePlay])

  // Double tap to favorite
  const handleDoubleTap = useCallback(() => {
    onFavorite?.()
  }, [onFavorite])

  // Scrub start - pause the video
  const handleScrubStart = useCallback(() => {
    pause()
  }, [pause])

  // Scrub move - seek relative to current position
  const handleScrubMove = useCallback(
    (deltaSeconds: number) => {
      const newTime = Math.max(0, Math.min(state.duration, state.currentTime + deltaSeconds))
      seek(newTime)
    },
    [state.currentTime, state.duration, seek]
  )

  const { touchState, handlers, lastTapZone, showTapFeedback } = useTouchControls({
    onLeftTap: handleLeftTap,
    onCenterTap: handleCenterTap,
    onRightTap: handleRightTap,
    onDoubleTap: handleDoubleTap,
    onScrubStart: handleScrubStart,
    onScrubMove: handleScrubMove,
    duration: state.duration,
    currentTime: state.currentTime,
    scrubSensitivity: 5,
  })

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  return (
    <div
      className={cn('absolute inset-0 touch-none', className)}
      {...handlers}
    >
      {/* Left tap feedback */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1/3 flex items-center justify-center',
          'transition-opacity duration-200',
          showTapFeedback && lastTapZone === 'left' ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="bg-black/60 rounded-full p-4 flex items-center gap-1 text-white">
          <ChevronLeft className="h-6 w-6" />
          <span className="text-sm font-medium">-{FRAMES_PER_TAP}</span>
        </div>
      </div>

      {/* Center tap feedback */}
      <div
        className={cn(
          'absolute left-1/3 top-0 h-full w-1/3 flex items-center justify-center',
          'transition-opacity duration-200',
          showTapFeedback && lastTapZone === 'center' ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="bg-black/60 rounded-full p-4 text-white">
          {state.isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </div>
      </div>

      {/* Right tap feedback */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-1/3 flex items-center justify-center',
          'transition-opacity duration-200',
          showTapFeedback && lastTapZone === 'right' ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="bg-black/60 rounded-full p-4 flex items-center gap-1 text-white">
          <span className="text-sm font-medium">+{FRAMES_PER_TAP}</span>
          <ChevronRight className="h-6 w-6" />
        </div>
      </div>

      {/* Scrubbing indicator */}
      {touchState.isScrubbing && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-black/80 rounded-lg px-6 py-4 text-white text-center">
            <p className="text-xs text-white/70 mb-1">Scrubbing</p>
            <p className="text-2xl font-mono tabular-nums">
              {formatTime(state.currentTime)}
            </p>
            <p className="text-xs text-white/70 mt-1">
              Frame {state.currentFrame} / {state.totalFrames}
            </p>
          </div>
        </div>
      )}

      {/* Double tap heart animation (for favorite) */}
      {onFavorite && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center pointer-events-none',
            'transition-all duration-300',
            // This would be triggered by a state when double tap happens
            // For now it's always hidden
            'opacity-0 scale-50'
          )}
        >
          <Heart className="h-20 w-20 text-red-500 fill-red-500" />
        </div>
      )}

      {/* Touch hints (shown briefly on first interaction) */}
      <TouchHints />
    </div>
  )
}

/**
 * Format time as MM:SS.ms
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

/**
 * Touch hints component - shows on first visit
 */
function TouchHints() {
  // This could use localStorage to only show once
  // For now, it's a simple visual guide that shows on hover
  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-8 text-white/40 text-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="text-center">
        <ChevronLeft className="h-4 w-4 mx-auto mb-1" />
        <span>Tap to rewind</span>
      </div>
      <div className="text-center">
        <Play className="h-4 w-4 mx-auto mb-1" />
        <span>Tap to play/pause</span>
      </div>
      <div className="text-center">
        <ChevronRight className="h-4 w-4 mx-auto mb-1" />
        <span>Tap to forward</span>
      </div>
    </div>
  )
}
