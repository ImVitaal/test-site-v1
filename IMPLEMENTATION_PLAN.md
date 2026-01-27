# Sakuga Legends - Phase 1 MVP Implementation Plan

## Status: COMPLETE ✓

All Phase 1 MVP features have been implemented. See FRONTEND_PLAN.md for Phase 2 roadmap.

---

## Overview
Build the MVP for Sakuga Legends - a web platform celebrating anime key animators. This is a **greenfield project** (no existing code).

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma + PostgreSQL, Meilisearch, NextAuth.js, Cloudflare R2/Stream, Inngest

---

## Implementation Phases

### Phase A: Infrastructure (Sprint 1-2) ✓ COMPLETE

#### A1. Project Initialization
```bash
# Files to create:
package.json              # Dependencies
tsconfig.json             # TypeScript strict mode
tailwind.config.ts        # Design tokens from PRD
next.config.js            # Image domains, env vars
.env.example              # Environment template
docker-compose.yml        # Local Postgres + Meilisearch
```

**Key dependencies:**
- next, react, typescript, tailwind
- prisma, @prisma/client
- next-auth@5 (beta)
- zustand, @tanstack/react-query
- framer-motion, zod
- meilisearch, @aws-sdk/client-s3

#### A2. Database Schema
```
prisma/schema.prisma      # Complete schema from PRD Section 8.3
lib/db/prisma.ts          # Singleton client
lib/db/utils.ts           # Pagination helpers
```

**Models:** Animator, AnimatorRelation, Studio, StudioHistory, Clip, Anime, Attribution, Tag, ClipTag, User, Favorite, Collection, Comment, GlossaryTerm

#### A3. Authentication
```
lib/auth/config.ts        # NextAuth v5 config
lib/auth/providers.ts     # Google, Discord, Twitter OAuth
lib/auth/utils.ts         # getSession, requireAuth
app/api/auth/[...nextauth]/route.ts
middleware.ts             # Protected routes
app/(auth)/login/page.tsx
```

#### A4. Core Layout
```
app/layout.tsx            # Root with providers
app/globals.css           # Tailwind + CSS vars (PRD colors)
components/layout/header.tsx
components/layout/footer.tsx
components/layout/search-command.tsx  # Cmd+K modal
app/(main)/layout.tsx
app/(main)/page.tsx       # Homepage
```

---

### Phase B: Animator System (Sprint 3-4) ✓ COMPLETE

#### B1. Animator API
```
lib/db/queries/animators.ts           # getBySlug, list, getClips
app/api/animators/route.ts            # GET list, POST create
app/api/animators/[slug]/route.ts     # GET, PATCH
app/api/animators/[slug]/clips/route.ts
app/api/animators/[slug]/timeline/route.ts
lib/validations/animator.ts           # Zod schemas
```

#### B2. Animator Components
```
components/animators/
├── animator-card.tsx          # Grid card
├── animator-header.tsx        # Profile header
├── animator-bio.tsx           # Biography
├── career-timeline.tsx        # Horizontal timeline
├── signature-reel.tsx         # Auto-playing clips
├── external-links.tsx         # Social links
└── animator-grid.tsx          # Browse grid
```

#### B3. Animator Pages
```
app/(main)/animators/page.tsx              # Browse
app/(main)/animators/[slug]/page.tsx       # Profile
app/(main)/animators/[slug]/loading.tsx    # Skeleton
app/(main)/animators/[slug]/opengraph-image.tsx
```

---

### Phase C: Clip System (Sprint 5-6) ✓ COMPLETE

#### C1. Video Player (Critical Path)
```
lib/storage/stream.ts                      # Cloudflare Stream client
components/clips/video-player/
├── video-player.tsx           # Main HLS player
├── player-context.tsx         # State context
├── player-controls.tsx        # Play/pause/progress
├── frame-stepper.tsx          # Frame-by-frame (`,` `.` keys)
├── playback-speed.tsx         # 0.25x - 2x
└── loop-region.tsx            # A-B loop
hooks/use-player.ts
stores/player-store.ts
```

**Frame stepping:** 24fps = 41.67ms per frame

#### C2. Clip API + Components
```
lib/db/queries/clips.ts
app/api/clips/route.ts
app/api/clips/[slug]/route.ts
app/api/clips/[slug]/favorite/route.ts

components/clips/
├── clip-card.tsx
├── clip-grid.tsx
├── clip-metadata.tsx
├── attribution-panel.tsx
├── verification-badge.tsx
└── clip-upload-form.tsx
```

#### C3. Clip Pages
```
app/(main)/clips/page.tsx
app/(main)/clips/[slug]/page.tsx
app/(main)/clips/[slug]/loading.tsx
```

#### C4. Upload Flow
```
lib/storage/r2.ts              # Presigned URLs
lib/storage/upload.ts          # Orchestration
app/api/upload/route.ts        # Initiate
app/api/upload/complete/route.ts
app/(main)/upload/page.tsx     # Protected
```

**Flow:** Frontend → Get presigned URL → Upload to R2 → Confirm → Inngest job → Cloudflare Stream transcode → Webhook updates clip

#### C5. Moderation Queue
```
lib/db/queries/moderation.ts
app/api/moderation/queue/route.ts
app/api/moderation/[clipId]/route.ts

components/moderation/
├── mod-queue-table.tsx
├── clip-review-modal.tsx
└── mod-action-buttons.tsx

app/(main)/moderation/page.tsx
app/(main)/moderation/clips/page.tsx
```

#### C6. Search Integration
```
lib/search/meilisearch.ts      # Client setup
lib/search/indexer.ts          # Index config
lib/search/sync.ts             # DB → Search sync

app/api/search/route.ts
app/api/search/suggest/route.ts

components/search/
├── search-bar.tsx
├── search-filters.tsx
└── search-results.tsx

app/(main)/search/page.tsx
```

**Indexes:** animators, clips, anime (typo-tolerant, filterable)

---

### Phase D: Background Jobs ✓ COMPLETE

```
lib/inngest/client.ts
lib/inngest/functions/
├── process-video.ts           # Transcode trigger
├── index-content.ts           # Search indexing
└── send-notification.ts

app/api/webhooks/cloudflare-stream/route.ts
app/api/webhooks/inngest/route.ts
```

---

## Seed Data Strategy

### Animators (100)
- Source: Sakugabooru tags, Wikipedia, AniDB
- File: `prisma/seed/data/animators.json`
- Include: name, nativeName, bio, studios, mentors

### Clips (5,000)
- Phase A: 500 manual curated
- Phase B: 1,500 Sakugabooru import
- Phase C: 3,000 community uploads
- File: `prisma/seed/data/clips.json`

### Supporting Data
- Studios: 50+ with parent relationships
- Anime: 200+ matching clips
- Tags: 30+ technique/style tags

---

## Design System (from PRD)

**Colors (Dark Mode Default):**
- Background: `#0D0D14`
- Surface: `#161622`
- Accent: `#8B5CF6` (violet)
- Text: `#F4F4F5`

**Typography:**
- Display: Playfair Display 700
- Body: DM Sans 400/500/600

**Performance Targets:**
- LCP < 2.5s
- CLS < 0.1
- Search < 200ms

---

## File Creation Order (Critical Path)

1. `package.json` + `tsconfig.json` + `tailwind.config.ts`
2. `docker-compose.yml` (Postgres + Meilisearch)
3. `prisma/schema.prisma` (copy from PRD lines 561-883)
4. `lib/db/prisma.ts`
5. `lib/auth/config.ts` + NextAuth route
6. Core layout components
7. Animator queries → API → components → pages
8. `lib/storage/stream.ts` (Cloudflare client)
9. Video player components (frame-stepper is key)
10. Clip queries → API → components → pages
11. Upload flow + moderation queue
12. Meilisearch setup + search UI
13. Inngest background jobs
14. Seed scripts + data

---

## Testing Strategy

**Unit (Vitest):** Zod schemas, utilities, components
**Integration:** API routes with test DB
**E2E (Playwright):** Critical user flows

**Critical E2E paths:**
1. Browse animators/clips anonymously
2. OAuth login flow
3. Favorite a clip
4. Upload clip (contributor)
5. Approve/reject clip (moderator)
6. Search returns results
7. Frame-stepping works

---

## Verification

After implementation:
1. `pnpm dev` - App runs locally
2. `pnpm db:push` - Schema applied
3. `pnpm seed` - 100 animators, 5,000 clips seeded
4. Browse animators at `/animators`
5. View animator profile with timeline
6. Play clip with frame-stepping (`,` `.` keys)
7. Search returns results < 200ms
8. Upload flow creates pending clip
9. Mod queue shows pending, approve works
10. `pnpm test` - All tests pass
11. `pnpm build` - Production build succeeds

---

## Environment Variables Required

```
DATABASE_URL
NEXTAUTH_URL, NEXTAUTH_SECRET
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_STREAM_API_TOKEN
MEILISEARCH_HOST, MEILISEARCH_MASTER_KEY
INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
```

---

## Key Files Reference

- **PRD:** `/home/user/test-site-v1/PRD.md`
  - Prisma schema: lines 561-883
  - API spec: lines 900-1000
  - Design system: lines 371-430
  - User stories: lines 130-225
