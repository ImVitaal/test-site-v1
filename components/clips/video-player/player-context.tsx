'use client'

import { createContext, useContext, useState, useRef, useCallback, type ReactNode, type RefObject } from 'react'
import { FRAME_RATE, FRAME_DURATION, PLAYBACK_SPEEDS } from '@/config/constants'

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  volume: number
  isMuted: boolean
  isLooping: boolean
  loopStart: number | null
  loopEnd: number | null
  currentFrame: number
  totalFrames: number
}

interface PlayerContextValue {
  videoRef: RefObject<HTMLVideoElement>
  state: PlayerState
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  stepForward: () => void
  stepBackward: () => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setLoopRegion: (start: number | null, end: number | null) => void
  toggleLooping: () => void
  updateState: (updates: Partial<PlayerState>) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

interface PlayerProviderProps {
  children: ReactNode
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 1,
    isMuted: false,
    isLooping: false,
    loopStart: null,
    loopEnd: null,
    currentFrame: 0,
    totalFrames: 0,
  })

  const updateState = useCallback((updates: Partial<PlayerState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const play = useCallback(() => {
    videoRef.current?.play()
    updateState({ isPlaying: true })
  }, [updateState])

  const pause = useCallback(() => {
    videoRef.current?.pause()
    updateState({ isPlaying: false })
  }, [updateState])

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      const clampedTime = Math.max(0, Math.min(time, videoRef.current.duration))
      videoRef.current.currentTime = clampedTime
      updateState({
        currentTime: clampedTime,
        currentFrame: Math.floor(clampedTime * FRAME_RATE),
      })
    }
  }, [updateState])

  const stepForward = useCallback(() => {
    if (videoRef.current) {
      pause()
      const newTime = Math.min(
        videoRef.current.currentTime + FRAME_DURATION,
        videoRef.current.duration
      )
      videoRef.current.currentTime = newTime
      updateState({
        currentTime: newTime,
        currentFrame: Math.floor(newTime * FRAME_RATE),
      })
    }
  }, [pause, updateState])

  const stepBackward = useCallback(() => {
    if (videoRef.current) {
      pause()
      const newTime = Math.max(videoRef.current.currentTime - FRAME_DURATION, 0)
      videoRef.current.currentTime = newTime
      updateState({
        currentTime: newTime,
        currentFrame: Math.floor(newTime * FRAME_RATE),
      })
    }
  }, [pause, updateState])

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current && PLAYBACK_SPEEDS.includes(rate)) {
      videoRef.current.playbackRate = rate
      updateState({ playbackRate: rate })
    }
  }, [updateState])

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume))
      videoRef.current.volume = clampedVolume
      updateState({ volume: clampedVolume, isMuted: clampedVolume === 0 })
    }
  }, [updateState])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      updateState({ isMuted: videoRef.current.muted })
    }
  }, [updateState])

  const setLoopRegion = useCallback((start: number | null, end: number | null) => {
    updateState({ loopStart: start, loopEnd: end })
  }, [updateState])

  const toggleLooping = useCallback(() => {
    updateState({ isLooping: !state.isLooping })
  }, [state.isLooping, updateState])

  const value: PlayerContextValue = {
    videoRef,
    state,
    play,
    pause,
    togglePlay,
    seek,
    stepForward,
    stepBackward,
    setPlaybackRate,
    setVolume,
    toggleMute,
    setLoopRegion,
    toggleLooping,
    updateState,
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}
