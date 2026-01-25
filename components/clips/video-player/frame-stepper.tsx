'use client'

import { usePlayer } from './player-context'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function FrameStepper() {
  const { state, stepBackward, stepForward } = usePlayer()

  return (
    <div className="flex items-center gap-2 text-white">
      {/* Step Backward */}
      <button
        onClick={stepBackward}
        className="p-1.5 hover:bg-white/20 rounded transition-colors"
        aria-label="Previous frame (,)"
        title="Previous frame (,)"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Frame Counter */}
      <div className="flex items-center gap-1 text-sm font-mono min-w-[100px] justify-center">
        <span>Frame</span>
        <span className="text-accent font-bold">{state.currentFrame}</span>
        <span>/</span>
        <span>{state.totalFrames}</span>
      </div>

      {/* Step Forward */}
      <button
        onClick={stepForward}
        className="p-1.5 hover:bg-white/20 rounded transition-colors"
        aria-label="Next frame (.)"
        title="Next frame (.)"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Keyboard hints */}
      <div className="hidden md:flex items-center gap-1 text-xs text-white/60 ml-2">
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded">,</kbd>
        <span>/</span>
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded">.</kbd>
      </div>
    </div>
  )
}
