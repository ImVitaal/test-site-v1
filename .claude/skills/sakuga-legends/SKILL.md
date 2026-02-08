---
name: sakuga-legends
description: Project context and code patterns for the Sakuga Legends anime platform (Next.js 14 + Prisma + Tailwind)
---

# Sakuga Legends - Project Skill

## When to Use
Reference this skill when working on the Sakuga Legends project — a Next.js 14 web platform celebrating anime key animators with clip database, frame-by-frame video analysis, influence graphs, community rankings, and technique glossary.

---

## Architecture Overview

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS (dark-mode-first, `class` strategy) |
| Database | PostgreSQL 15 + Prisma ORM 5.22 |
| Search | Meilisearch v1.6 |
| Auth | NextAuth.js v5 beta (Google, Discord, Twitter) |
| Media | Cloudflare R2 (storage) + Cloudflare Stream (video) |
| Jobs | Inngest |
| Client State | Zustand 5 (stores) |
| Server State | React Query 5 (`@tanstack/react-query`) |
| Animations | Framer Motion 11 |
| Validation | Zod |
| Package Mgr | **pnpm** (never npm/yarn) |

### Services
```
Next.js App ──┬── API Routes ──── PostgreSQL (Prisma)
              ├── Meilisearch (full-text search)
              ├── NextAuth (OAuth: Google, Discord, Twitter)
              ├── Cloudflare R2 (image/thumbnail storage)
              ├── Cloudflare Stream (video delivery)
              ├── Inngest (background jobs)
              └── Redis (rate limiting, caching)
```

---

## File Structure

```
app/                        # Next.js App Router
├── (auth)/                 # Auth route group (/login)
├── (main)/                 # Main layout (header + footer)
│   ├── animators/          # Listing + [slug] detail + influence
│   ├── clips/              # Listing + [slug] detail
│   ├── collections/        # User collections
│   ├── favorites/          # User favorites
│   ├── glossary/           # Technique glossary + [slug]
│   ├── moderation/         # Mod dashboard + clip queue
│   ├── rankings/           # Ranking lists + [slug]
│   ├── search/             # Full-text search
│   ├── trending/           # Trending clips
│   └── upload/             # Clip submission
├── api/                    # API route handlers
└── demo/                   # Standalone demo (works without DB)

components/                 # Feature-based React components
├── ui/                     # Primitives (see UI Primitives section)
├── animators/              # Animator card, grid, header, timeline
├── clips/                  # Clip card, grid, video-player/
├── collections/            # Collection CRUD modals + cards
├── common/                 # Shared (favorite button)
├── glossary/               # Glossary index, term cards, tags
├── graphs/                 # Influence graph (D3-style)
├── home/                   # Featured hero, recent additions
├── layout/                 # Header + Footer
├── moderation/             # Mod queue, review modal, stats
├── providers/              # SessionProvider + QueryClientProvider
├── rankings/               # Ranking cards, filters, vote
├── search/                 # Search command, filters, hit cards
└── upload/                 # Upload form, dropzone, progress

lib/                        # Business logic
├── api/                    # client.ts, errors.ts, endpoints.ts
├── auth/                   # NextAuth config + session utils
├── db/                     # Prisma singleton + queries/ (10 files)
├── hooks/                  # React Query hooks per entity
├── search/                 # Meilisearch client + hooks
├── stores/                 # Zustand: create-store.ts, ui, search, player
├── utils/                  # cn(), format helpers, slug
└── validations/            # Zod schemas (animator, clip, common)

config/                     # constants.ts, routes.ts, navigation.ts, site.ts
types/                      # index.ts, animator.ts, clip.ts, api.ts
prisma/schema.prisma        # 18 models, enums, relationships
```

---

## Code Patterns

### API Client (`lib/api/client.ts`)

```typescript
import { api } from '@/lib/api'

// Typed fetch wrapper — throws ApiClientError on non-2xx
api.get<AnimatorListResponse>('/animators', { page: 1, limit: 20 })
api.post<ClipResponse>('/clips', { title: '...', videoUrl: '...' })
api.patch<T>(endpoint, body)
api.put<T>(endpoint, body)
api.delete<T>(endpoint)

// Error class
class ApiClientError extends Error {
  code: string      // ERROR_CODES enum value
  status: number    // HTTP status
  details?: Record<string, unknown>
}
```

### API Endpoints (`lib/api/endpoints.ts`)

```typescript
import { API_ENDPOINTS } from '@/lib/api'

API_ENDPOINTS.animators.list           // '/animators'
API_ENDPOINTS.animators.detail(slug)   // '/animators/{slug}'
API_ENDPOINTS.animators.clips(slug)    // '/animators/{slug}/clips'
API_ENDPOINTS.clips.trending           // '/clips/trending'
API_ENDPOINTS.search.global            // '/search'
API_ENDPOINTS.user.favorites           // '/user/favorites'
```

### Error Handling (`lib/api/errors.ts`)

```typescript
import { errors, withErrorHandler } from '@/lib/api/errors'

// Pre-configured responses
errors.notFound('Animator')     // 404 + { code, message }
errors.unauthorized()           // 401
errors.forbidden()              // 403
errors.validation(zodError)     // 400 + flattened Zod errors
errors.badRequest('Invalid')    // 400
errors.internal(error)          // 500 (logs to console)
errors.duplicate('Clip')        // 409
errors.rateLimited()            // 429

// Wrapper for API routes — auto-catches ZodError + unexpected errors
export const GET = withErrorHandler(async (request) => {
  // ZodError -> errors.validation(), other Error -> errors.internal()
  return NextResponse.json({ success: true, data: result })
})
```

### React Query Hooks (`lib/hooks/use-*.ts`)

```typescript
// Query key factory pattern
export const animatorKeys = {
  all: ['animators'] as const,
  lists: () => [...animatorKeys.all, 'list'] as const,
  list: (params) => [...animatorKeys.lists(), params] as const,
  details: () => [...animatorKeys.all, 'detail'] as const,
  detail: (slug) => [...animatorKeys.details(), slug] as const,
}

// Standard list hook
export function useAnimators(params: AnimatorSearchParams = {}) {
  return useQuery({
    queryKey: animatorKeys.list(params),
    queryFn: () => api.get<AnimatorListResponse>(API_ENDPOINTS.animators.list, params),
  })
}

// Infinite scroll hook
export function useAnimatorsInfinite(params = {}) {
  return useInfiniteQuery({
    queryKey: [...animatorKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      api.get<AnimatorListResponse>(API_ENDPOINTS.animators.list, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  })
}

// Detail hook with select transform + enabled guard
export function useAnimator(slug: string | undefined) {
  return useQuery({
    queryKey: animatorKeys.detail(slug!),
    queryFn: () => api.get<AnimatorDetailResponse>(API_ENDPOINTS.animators.detail(slug!)),
    select: (data) => data.data,
    enabled: !!slug,
  })
}
```

### Zustand Stores (`lib/stores/`)

```typescript
// Factory: lib/stores/create-store.ts
import { createStore, createPersistedStore } from '@/lib/stores/create-store'

// createStore(name, initializer) — devtools + subscribeWithSelector
// createPersistedStore(name, initializer) — adds localStorage persistence

// Usage: lib/stores/ui-store.ts
export const useUIStore = createStore<UIState>('ui-store', (set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  toasts: [],
  addToast: (message, type) => set((state) => ({
    toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }],
  })),
}))

// Other stores: useSearchStore, usePlayerStore
```

### Route Definitions (`config/routes.ts`)

```typescript
import { ROUTES } from '@/config/routes'

ROUTES.home                          // '/'
ROUTES.animators.list                // '/animators'
ROUTES.animators.detail('hayao-miyazaki')  // '/animators/hayao-miyazaki'
ROUTES.clips.detail('akira-bike')    // '/clips/akira-bike'
ROUTES.moderation.dashboard          // '/moderation'

// Helper for parameterized routes
import { route } from '@/config/routes'
route('/animators/:slug', { slug: 'hayao-miyazaki' })
```

### Validation (`lib/validations/`)

```typescript
// Zod schemas for query params + request bodies
import { z } from 'zod'

export const animatorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
})

// Used in API routes:
const params = animatorQuerySchema.parse(Object.fromEntries(searchParams))
```

### Styling

```typescript
// cn() utility — lib/utils/cn.ts (clsx + tailwind-merge)
import { cn } from '@/lib/utils/cn'

className={cn(
  'rounded-lg bg-surface p-4',
  isActive && 'border-accent',
  className
)}

// Design tokens (tailwind.config.ts):
// Background: #0D0D14 | Surface: #161622 | Accent: #8B5CF6 (purple)
// Fonts: DM Sans (body), Playfair Display (headings), JetBrains Mono (code)
// Semantic: verified (green), speculative (amber), disputed (red)
```

---

## Database Schema

### Key Models (18 total)

| Model | Purpose |
|-------|---------|
| Animator | Key animators with bio, native name, slug |
| Clip | Video clips (max 45s, Cloudflare Stream) |
| Attribution | Links Animator <-> Clip with Role + VerificationStatus |
| Anime | Source anime series |
| Studio | Animation studios |
| StudioHistory | Animator career at studios |
| AnimatorRelation | Mentor/student/colleague graph |
| Tag, ClipTag | Technique/style tagging |
| GlossaryTerm | Animation technique definitions |
| RankingList, RankingEntry | Editorial + community rankings |
| User | Auth + role + trustScore |
| Favorite, Collection | User bookmarks + curated lists |
| Comment | Discussion on clips |
| Account, Session, VerificationToken | NextAuth models |

### Key Enums

```
Role: KEY_ANIMATION | SECOND_KEY_ANIMATION | ANIMATION_DIRECTOR |
      CHIEF_ANIMATION_DIRECTOR | CHARACTER_DESIGN |
      MECHANICAL_ANIMATION | EFFECTS_ANIMATION

VerificationStatus: VERIFIED | SPECULATIVE | DISPUTED

UserRole: USER | CONTRIBUTOR | MODERATOR | ADMIN

SubmissionStatus: PENDING | APPROVED | REJECTED | FLAGGED
```

---

## Domain Concepts

- **Sakuga** — Well-animated sequences in anime credited to specific key animators
- **Attribution** — Links Animator to Clip with Role + VerificationStatus + source proof
- **Trust Score** — User reputation: New (0-10), Contributor (11-50), Trusted (51-200), Expert (201-500)
- **Fair Use** — Clips max 45s, must include `techniqueDescription` for educational value
- **Influence Graph** — Mentor/student/colleague network between animators

---

## UI Primitives (`components/ui/`)

badge, button, card, combobox, dialog, input, select, skeleton, tabs, textarea, toast

---

## Commands

```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm type-check       # tsc --noEmit
pnpm test             # Vitest unit tests
pnpm test:e2e         # Playwright E2E

pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema (no migration)
pnpm db:migrate       # Prisma migrate dev
pnpm db:seed          # Run seed script
pnpm db:studio        # Prisma Studio GUI

docker-compose up -d  # Postgres + Meilisearch + Redis
```

---

## Critical Rules

1. **pnpm only** — never npm or yarn
2. **`@/` import alias** for all imports
3. **kebab-case** file naming (`animator-card.tsx`, `use-clips.ts`)
4. **Server components by default** — `'use client'` only where needed
5. **`withErrorHandler()`** on all API routes
6. **API response format**: `{ success: true, data }` or `{ success: false, error: { code, message } }`
7. **`cn()`** for all conditional Tailwind classes
8. **No magic values** — use `config/constants.ts`
9. **Dark-mode-first** design
10. **TypeScript strict** — no implicit any, no unchecked index access
11. **Feature-based** component folders under `components/`
12. **Query key factories** for React Query cache management

---

## Current Status

**Complete:** Phase 1 MVP — 192 files, full component library, 26 API endpoints, 18 DB models, working `/demo` page

**Blocker:** Prisma client not generated (`binaries.prisma.sh` network blocked) — causes 76 TypeScript errors

**Pending:** Seed data scripts, unit tests (`__tests__/`), E2E tests (`e2e/`), production deployment
