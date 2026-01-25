import { createPersistedStore } from './create-store'

interface PlayerState {
  // Audio
  volume: number
  isMuted: boolean
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  toggleMute: () => void

  // Playback
  playbackRate: number
  setPlaybackRate: (rate: number) => void

  // Preferences
  autoLoop: boolean
  setAutoLoop: (autoLoop: boolean) => void

  showFrameCounter: boolean
  setShowFrameCounter: (show: boolean) => void

  // A-B Loop
  loopStart: number | null
  loopEnd: number | null
  setLoopRegion: (start: number | null, end: number | null) => void
  clearLoopRegion: () => void
}

export const usePlayerStore = createPersistedStore<PlayerState>(
  'player-store',
  (set) => ({
    // Audio
    volume: 1,
    isMuted: false,
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setMuted: (muted) => set({ isMuted: muted }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    // Playback
    playbackRate: 1,
    setPlaybackRate: (rate) => set({ playbackRate: rate }),

    // Preferences
    autoLoop: false,
    setAutoLoop: (autoLoop) => set({ autoLoop }),

    showFrameCounter: true,
    setShowFrameCounter: (show) => set({ showFrameCounter: show }),

    // A-B Loop
    loopStart: null,
    loopEnd: null,
    setLoopRegion: (start, end) => set({ loopStart: start, loopEnd: end }),
    clearLoopRegion: () => set({ loopStart: null, loopEnd: null }),
  })
)
