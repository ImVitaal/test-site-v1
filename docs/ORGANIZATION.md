# Code Organization Guide

This document describes the folder structure, naming conventions, and organizational patterns used in Sakuga Legends.

---

## Project Structure Overview

```
sakuga-legends/
├── app/                    # Next.js App Router (routes + API)
├── components/             # Feature-based React components
├── lib/                    # Business logic + utilities
├── config/                 # App-wide constants + config
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema + seeds
├── __tests__/              # Vitest unit tests
├── e2e/                    # Playwright E2E tests
├── docs/                   # Documentation files
└── public/                 # Static assets
```

---

## Folder Responsibilities

### `app/` — Routes & API

Next.js App Router structure with route groups and API handlers.

| Path | Purpose |
|------|---------|
| `app/(auth)/` | Auth-related routes (login page) |
| `app/(main)/` | Main layout group with header + footer |
| `app/api/` | REST API route handlers |
| `app/demo/` | Standalone demo page (no DB required) |

**Route Naming:**
- Use kebab-case for route segments: `/animators`, `/glossary`
- Dynamic segments use brackets: `[slug]`, `[id]`
- Group folders use parentheses: `(auth)`, `(main)` (don't affect URL)

### `components/` — UI Components

Feature-based organization. Each feature gets its own folder.

```
components/
├── animators/          # Animator-specific components
├── clips/              # Clip-specific components
│   └── video-player/   # Nested for complex features
├── common/             # Shared feature components
├── graphs/             # Influence graph visualization
├── layout/             # Header, Footer, navigation
├── providers/          # React context providers
├── ui/                 # Primitives (button, card, dialog, input)
└── upload/             # Upload form + dropzone
```

**Component Rules:**
- One component per file
- Use `index.ts` barrel exports for public API
- Co-locate component-specific hooks and utils in same folder
- Nest complex features (e.g., `video-player/` has multiple files)

### `lib/` — Business Logic

All non-UI code: API clients, database queries, hooks, stores.

```
lib/
├── api/                # Fetch client + error helpers
├── auth/               # NextAuth config + session utils
├── db/                 # Prisma client + query modules
│   └── queries/        # Per-entity query functions
├── hooks/              # React Query hooks (data fetching)
├── search/             # Meilisearch client + hooks
├── stores/             # Zustand stores (client state)
├── utils/              # Pure utility functions
└── validations/        # Zod schemas
```

**Query Organization (`lib/db/queries/`):**
- One file per entity: `animators.ts`, `clips.ts`, `collections.ts`
- Export named functions: `getAnimatorBySlug()`, `listClips()`
- Never export Prisma client directly from queries

### `config/` — Configuration

Centralized app-wide constants and settings.

| File | Contents |
|------|----------|
| `constants.ts` | Video limits, pagination, trust system, enums |
| `navigation.ts` | Nav items (main, user, moderator, footer) |
| `routes.ts` | Type-safe route map (ROUTES object) |
| `site.ts` | Site name, description, URLs, keywords |

**Rule:** Never hardcode magic values. All limits, labels, and enum mappings live here.

### `types/` — Type Definitions

Centralized TypeScript types with barrel exports.

| File | Contents |
|------|----------|
| `index.ts` | Common types + re-exports from Prisma |
| `animator.ts` | Animator-specific types |
| `clip.ts` | Clip-specific types |
| `api.ts` | API response types + error codes |

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `animator-card.tsx` |
| Hooks | `use-*.ts` | `use-clips.ts` |
| Utilities | kebab-case | `format-date.ts` |
| Types | kebab-case | `animator.ts` |
| API routes | `route.ts` | `app/api/animators/route.ts` |
| Pages | `page.tsx` | `app/(main)/animators/page.tsx` |

### Code

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AnimatorCard` |
| Functions | camelCase | `getAnimatorBySlug` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_VIDEO_DURATION` |
| Types/Interfaces | PascalCase | `AnimatorWithClips` |
| Hooks | camelCase with `use` prefix | `useAnimator` |
| Stores | camelCase with `use*Store` suffix | `useUIStore` |

### Imports

All imports use the `@/` alias which maps to project root:

```typescript
// Good
import { AnimatorCard } from '@/components/animators/animator-card'
import { getAnimatorBySlug } from '@/lib/db/queries/animators'

// Bad (don't use relative paths for cross-directory imports)
import { AnimatorCard } from '../../../components/animators/animator-card'
```

---

## Test Organization

### Unit Tests (`__tests__/`)

Mirror the source file structure:

```
__tests__/
├── lib/
│   ├── utils/
│   │   └── format-date.test.ts
│   └── db/queries/
│       └── animators.test.ts
└── components/
    └── animators/
        └── animator-card.test.tsx
```

**Naming:** `[source-file].test.ts` or `[source-file].test.tsx`

### E2E Tests (`e2e/`)

Organize by user flow, not by page:

```
e2e/
├── auth.spec.ts              # Login, logout, session
├── animator-browsing.spec.ts # Browse, search, view animators
├── clip-playback.spec.ts     # Video player, frame stepping
├── collections.spec.ts       # Create, edit, share collections
└── moderation.spec.ts        # Mod queue workflow
```

**Naming:** `[feature-flow].spec.ts`

---

## Component Patterns

### Server vs Client Components

- **Default:** Server components (no directive needed)
- **Client:** Add `'use client'` only when needed (interactivity, hooks, browser APIs)

```typescript
// Server component (default)
export function AnimatorList({ animators }: Props) {
  return <div>{/* ... */}</div>
}

// Client component
'use client'
export function VideoPlayer({ src }: Props) {
  const [playing, setPlaying] = useState(false)
  return <video>{/* ... */}</video>
}
```

### Page Split Pattern

For pages that need both server and client rendering:

```
app/(main)/animators/[slug]/
├── page.tsx           # Server component (data fetching)
└── page-client.tsx    # Client component (interactivity)
```

### Barrel Exports

Use `index.ts` for clean imports:

```typescript
// components/animators/index.ts
export { AnimatorCard } from './animator-card'
export { AnimatorGrid } from './animator-grid'
export { AnimatorHeader } from './animator-header'

// Usage
import { AnimatorCard, AnimatorGrid } from '@/components/animators'
```

---

## API Route Patterns

### Handler Structure

All handlers wrap with `withErrorHandler()` for consistent error responses:

```typescript
// app/api/animators/route.ts
import { withErrorHandler } from '@/lib/api/errors'

export const GET = withErrorHandler(async (req) => {
  const animators = await getAnimators()
  return Response.json({ success: true, data: animators })
})
```

### Response Format

```typescript
// Success
{ success: true, data: { ... } }

// Error (handled by withErrorHandler)
{ success: false, error: { code: "NOT_FOUND", message: "..." } }
```

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) — Project overview + coding conventions
- [PRD.md](../PRD.md) — Product requirements + specifications
- [TECH_DEBT.md](./TECH_DEBT.md) — Known issues + prioritized improvements

---

*Last updated: February 10, 2026*
