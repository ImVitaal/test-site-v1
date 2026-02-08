// Video constraints (Fair Use compliance)
export const VIDEO_MAX_DURATION_SECONDS = 45
export const VIDEO_MAX_SIZE_BYTES = 100 * 1024 * 1024 // 100MB
export const VIDEO_ALLOWED_TYPES = ['video/mp4', 'video/webm']

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Animation playback
export const FRAME_RATE = 24 // Standard anime frame rate
export const FRAME_DURATION = 1 / FRAME_RATE // ~0.04167 seconds
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

// Trust system thresholds
export const TRUST_LEVELS = {
  NEW_USER: { min: 0, max: 10 },
  CONTRIBUTOR: { min: 11, max: 50 },
  TRUSTED: { min: 51, max: 200 },
  EXPERT: { min: 201, max: 500 },
} as const

// Trust points
export const TRUST_POINTS = {
  CLIP_APPROVED: 5,
  ATTRIBUTION_VERIFIED: 10,
  CORRECTION_ACCEPTED: 3,
  REPORT_VALID: 2,
  SUBMISSION_REJECTED: -2,
  FALSE_REPORT: -5,
  GUIDELINE_VIOLATION: -20,
} as const

// Role enum values
export const ANIMATION_ROLES = [
  'KEY_ANIMATION',
  'SECOND_KEY_ANIMATION',
  'ANIMATION_DIRECTOR',
  'CHIEF_ANIMATION_DIRECTOR',
  'CHARACTER_DESIGN',
  'MECHANICAL_ANIMATION',
  'EFFECTS_ANIMATION',
] as const

export const ANIMATION_ROLE_LABELS: Record<(typeof ANIMATION_ROLES)[number], string> = {
  KEY_ANIMATION: 'Key Animation',
  SECOND_KEY_ANIMATION: 'Second Key Animation',
  ANIMATION_DIRECTOR: 'Animation Director',
  CHIEF_ANIMATION_DIRECTOR: 'Chief Animation Director',
  CHARACTER_DESIGN: 'Character Design',
  MECHANICAL_ANIMATION: 'Mechanical Animation',
  EFFECTS_ANIMATION: 'Effects Animation',
}

// Verification status
export const VERIFICATION_STATUS = ['VERIFIED', 'SPECULATIVE', 'DISPUTED'] as const

export const VERIFICATION_STATUS_LABELS: Record<(typeof VERIFICATION_STATUS)[number], string> = {
  VERIFIED: 'Verified',
  SPECULATIVE: 'Speculative',
  DISPUTED: 'Disputed',
}

// Tag categories
export const TAG_CATEGORIES = ['technique', 'style', 'content'] as const

// Anime seasons
export const ANIME_SEASONS = ['winter', 'spring', 'summer', 'fall'] as const
