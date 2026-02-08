'use client'

import { useState } from 'react'
import { usePlayer } from './player-context'
import { PLAYBACK_SPEEDS } from '@/config/constants'
import { cn } from '@/lib/utils/cn'

export function PlaybackSpeed() {
  const { state, setPlaybackRate } = usePlayer()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-sm font-mono text-white hover:bg-white/20 rounded transition-colors"
      >
        {state.playbackRate}x
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute bottom-full right-0 mb-2 bg-surface border border-border rounded-card shadow-lg overflow-hidden z-20">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackRate(speed)
                  setIsOpen(false)
                }}
                className={cn(
                  'block w-full px-4 py-2 text-sm text-left font-mono hover:bg-surface-hover transition-colors',
                  state.playbackRate === speed
                    ? 'text-accent bg-accent/10'
                    : 'text-foreground'
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
