'use client'

import { useEffect, useCallback } from 'react'
import { PlayerProvider, usePlayer } from './player-context'
import { PlayerControls } from './player-controls'
import { FrameStepper } from './frame-stepper'
import { PlaybackSpeed } from './playback-speed'
import { TouchOverlay } from './touch-overlay'
import { cn } from '@/lib/utils/cn'
import { FRAME_RATE } from '@/config/constants'

interface VideoPlayerInnerProps {
  src: string
  poster?: string
  title?: string
  className?: string
  onFavorite?: () => void
}

function VideoPlayerInner({ src, poster, title, className, onFavorite }: VideoPlayerInnerProps) {
  const { videoRef, state, togglePlay, stepForward, stepBackward, updateState } = usePlayer()

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      updateState({
        currentTime,
        currentFrame: Math.floor(currentTime * FRAME_RATE),
      })

      // Handle loop region
      if (state.isLooping && state.loopEnd !== null && currentTime >= state.loopEnd) {
        videoRef.current.currentTime = state.loopStart ?? 0
      }
    }
  }, [videoRef, updateState, state.isLooping, state.loopStart, state.loopEnd])

  // Handle metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      updateState({
        duration: videoRef.current.duration,
        totalFrames: Math.floor(videoRef.current.duration * FRAME_RATE),
      })
    }
  }, [videoRef, updateState])

  // Handle play/pause events
  const handlePlay = useCallback(() => {
    updateState({ isPlaying: true })
  }, [updateState])

  const handlePause = useCallback(() => {
    updateState({ isPlaying: false })
  }, [updateState])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case ',':
          e.preventDefault()
          stepBackward()
          break
        case '.':
          e.preventDefault()
          stepForward()
          break
        case 'ArrowLeft':
          e.preventDefault()
          stepBackward()
          break
        case 'ArrowRight':
          e.preventDefault()
          stepForward()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, stepForward, stepBackward])

  return (
    <div className={cn('video-container group', className)}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />

      {/* Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4">
            <p className="text-white text-sm font-medium drop-shadow-lg">{title}</p>
          </div>
        )}

        {/* Controls Bar */}
        <div className="p-4 space-y-2">
          <PlayerControls />
          <div className="flex items-center justify-between">
            <FrameStepper />
            <PlaybackSpeed />
          </div>
        </div>
      </div>

      {/* Play button overlay when paused (desktop only) */}
      {!state.isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none sm:pointer-events-auto"
        >
          <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Mobile touch overlay */}
      <TouchOverlay onFavorite={onFavorite} />
    </div>
  )
}

export interface VideoPlayerProps extends VideoPlayerInnerProps {}

export function VideoPlayer(props: VideoPlayerProps) {
  return (
    <PlayerProvider>
      <VideoPlayerInner {...props} />
    </PlayerProvider>
  )
}
