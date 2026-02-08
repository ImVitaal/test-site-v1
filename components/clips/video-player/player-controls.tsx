'use client'

import { usePlayer } from './player-context'
import { Play, Pause, Volume2, VolumeX, Repeat } from 'lucide-react'
import { formatDuration } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export function PlayerControls() {
  const {
    state,
    togglePlay,
    seek,
    toggleMute,
    setVolume,
    toggleLooping,
  } = usePlayer()

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    seek(percentage * state.duration)
  }

  const progressPercentage = state.duration > 0
    ? (state.currentTime / state.duration) * 100
    : 0

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div
        className="relative h-1 bg-white/30 rounded-full cursor-pointer group/progress"
        onClick={handleProgressClick}
      >
        {/* Loop Region Indicator */}
        {state.loopStart !== null && state.loopEnd !== null && (
          <div
            className="absolute h-full bg-accent/30 rounded-full"
            style={{
              left: `${(state.loopStart / state.duration) * 100}%`,
              width: `${((state.loopEnd - state.loopStart) / state.duration) * 100}%`,
            }}
          />
        )}

        {/* Progress */}
        <div
          className="absolute h-full bg-accent rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Scrubber */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercentage}% - 6px)` }}
        />
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1 group/volume">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={state.isMuted ? 'Unmute' : 'Mute'}
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.isMuted ? 0 : state.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
            />
          </div>

          {/* Time Display */}
          <span className="text-sm font-mono">
            {formatDuration(Math.floor(state.currentTime))} / {formatDuration(Math.floor(state.duration))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Loop Toggle */}
          <button
            onClick={toggleLooping}
            className={cn(
              'p-2 rounded-full transition-colors',
              state.isLooping ? 'bg-accent text-white' : 'hover:bg-white/20'
            )}
            aria-label={state.isLooping ? 'Disable loop' : 'Enable loop'}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
