# Sakuga Legends

Web platform celebrating anime key animators with clip database, frame-by-frame analysis tools, and educational content.

> **Reference:** All specifications live in [PRD.md](./PRD.md) (v5.1)

---

## 🚨 Critical Blockers

- [ ] **Fix Prisma Client Generation** — `binaries.prisma.sh` is network-blocked, causing 76 TypeScript errors. Must be resolved before any other work. See PRD §13.1 for workarounds.
- [ ] **Schema Sync** — Prisma schema needs updates to match PRD v5.1 (add `commentCount` to Clip, `RelationType` enum, rename AnimatorRelation fields from `mentorId/studentId` to `sourceId/targetId`, add missing indexes). See PRD §13.2.
- [ ] **Install Missing Phase 1 Dependencies** — Verify all installed deps match PRD §4.1 list.

---

## Phase 1: Foundation & Core — *In Progress*

### ✅ Infrastructure (DONE)
- [x] Next.js 14 App Router setup
- [x] TypeScript strict mode
- [x] Tailwind CSS (dark-mode-first)
- [x] Prisma schema (15+ models)
- [x] NextAuth v5 (Google, Discord, Twitter OAuth)
- [x] Docker Compose (PostgreSQL + Meilisearch + Redis)
- [x] ESLint + PostCSS config
- [x] Cloudflare R2 + Stream integration

### ✅ Animator System (DONE)
- [x] Animator profile pages (`/animators/[slug]`)
- [x] Career timeline (horizontal, clickable nodes)
- [x] Browse all animators page
- [x] Loading skeleton states
- [x] Animator CRUD API routes
- [x] Seed data

### ✅ Clip System (DONE)
- [x] Clip upload flow (presigned URL → R2 → Stream)
- [x] Custom video player (HLS.js + Cloudflare Stream)
- [x] Frame-by-frame stepping (`,`/`.` keys at 24fps)
- [x] Playback speed controls (0.25x–2x)
- [x] A-B loop region selection
- [x] Frame counter display
- [x] Browse clips page
- [x] Clip detail page
- [x] Attribution system with verification status
- [x] Moderation queue (submit → auto-check → human review → approve/reject)
- [x] Upload page with client component

### ✅ Search (DONE)
- [x] Meilisearch integration
- [x] Global search page (`/search`)
- [x] Search API route (Meilisearch proxy)
- [ ] Cmd+K command palette

### ✅ Discovery (DONE)
- [x] Trending clips page with decay algorithm
- [x] Trending API route
- [x] Rankings pages (browse + detail)
- [x] Community voting API

### ✅ Education (DONE)
- [x] Technique glossary index page (`/glossary`)
- [x] Term detail pages (`/glossary/[slug]`)
- [x] Glossary API routes
- [ ] Inline tooltips (clickable popover tags on clips showing term definitions)

### ✅ Social (DONE)
- [x] Favorites system (clips + animators)
- [x] Collections (create, browse, share)
- [x] Influence graph (mentor/student/colleague visualization)
- [x] Influence graph page (`/animators/[slug]/influence`)

### ✅ Mobile UX (DONE)
- [x] Touch controls (tap zones: left=rewind, right=forward, center=play/pause)
- [x] Double-tap to favorite
- [x] Long-press + drag precision scrubbing
- [x] Edge safe zones (20px)

### ✅ Featured Animator (DONE)
- [x] Featured animator hero section on homepage
- [x] Featured animator API route

### ⬜ Phase 1 Items Still To Do
- [ ] Cmd+K command palette for search
- [ ] Inline technique tooltips (popover tags below video player)
- [ ] Verify Vercel deployment is working end-to-end
- [ ] SEO: Dynamic meta tags + OG images for all pages
- [ ] SEO: JSON-LD structured data (Person for animators, VideoObject for clips)
- [ ] SEO: Auto-generated sitemap
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Performance audit against targets (LCP <2.5s, CLS <0.1, INP <200ms)
- [ ] Rate limiting via Redis (100 req/min anon, 1000 req/min auth)
- [ ] CSP headers
- [ ] CSRF protection

---

## Phase 2: Community & Engagement — *Not Started*

### Studio Timeline
- [ ] Studio model + StudioHistory model in database
- [ ] Studio browse page (`/studios`)
- [ ] Studio detail page (`/studios/[slug]`)
- [ ] Interactive career visualization (timeline component)
- [ ] Studio API endpoints

### Timestamped Comments
- [ ] Comment model in database (with `parentId` for threading)
- [ ] Comments UI on clip detail pages
- [ ] Clickable timestamps that jump video player to that point
- [ ] Comment threading (replies)
- [ ] Comment moderation

### Follow Animators + Notifications
- [ ] Follow model in database
- [ ] Follow/unfollow API (`POST /api/user/follows/:animatorId`)
- [ ] Notification model in database
- [ ] Notification inbox API (`GET /api/user/notifications`)
- [ ] Mark notification as read (`PATCH /api/user/notifications/:id`)
- [ ] Install and configure Inngest for background jobs
- [ ] Background job: notify followers when clip attribution approved

### Phase 2 Infrastructure
- [ ] Install + configure Inngest (event-driven background jobs)
- [x] Install + configure Sentry (error tracking) — **DONE**
- [ ] Install + configure Plausible (privacy-focused analytics)
- [x] Set up Sentry environment variables (SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN) — **DONE**

### Phase 2 API Expansion
- [ ] Studio endpoints (list, detail, timeline)
- [ ] Autocomplete search API
- [ ] Related clips API
- [ ] User profile API
- [ ] Comprehensive seed data expansion (more animators, clips, anime)

---

## Phase 3: Scale & Expand — *Not Started*

### Mobile App
- [ ] React Native project setup (iOS + Android)
- [ ] Shared API backend integration
- [ ] Mobile video player with frame stepping
- [ ] Browse animators/clips
- [ ] Search
- [ ] Favorites
- [ ] Push notifications

### Internationalization (i18n)
- [ ] Install + configure next-intl
- [ ] Japanese language support (first priority)
- [ ] Chinese (Simplified) support
- [ ] Korean support
- [ ] Locale-aware date/number formatting

### Performance & Scale
- [ ] Edge caching optimization
- [ ] Database read replicas
- [ ] Bundle optimization + code splitting audit
- [ ] Performance monitoring

### Community Growth
- [ ] Contributor onboarding flow
- [ ] Public API documentation

---

## Monetization (When Ready)
- [ ] Ko-fi or Buy Me a Coffee integration
- [ ] Patreon page for recurring supporters
- [ ] Stripe one-time donations
- [ ] Supporter badges (cosmetic only)
- [ ] Transparent spending breakdown page

---

## ❌ Removed from Scope
These were in earlier plans but have been **dropped** in PRD v5.0:
- ~~Export/GIF functionality~~
- ~~Embed codes~~
- ~~PWA offline support~~
- ~~User personas~~
- ~~Freemium monetization~~

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Framework | Next.js 14 (App Router) | ✅ Installed |
| Language | TypeScript (strict) | ✅ Installed |
| Styling | Tailwind CSS | ✅ Installed |
| Database | PostgreSQL 15 + Prisma 5.22 | ✅ Installed |
| Search | Meilisearch | ✅ Installed |
| Auth | NextAuth.js v5 | ✅ Installed |
| Media | Cloudflare R2 + Stream | ✅ Installed |
| Video | hls.js | ✅ Installed |
| State | Zustand + React Query | ✅ Installed |
| Animation | Framer Motion | ✅ Installed |
| Validation | Zod | ✅ Installed |
| Testing | Vitest + Playwright | ✅ Installed |
| Background Jobs | Inngest | ⬜ Phase 2 |
| Error Tracking | Sentry | ✅ Installed |
| Analytics | Plausible | ⬜ Phase 2 |
| i18n | next-intl | ⬜ Phase 3 |
| Mobile | React Native | ⬜ Phase 3 |

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (never npm/yarn)
- Docker (for local PostgreSQL + Meilisearch + Redis)

### Quick Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start local services
docker-compose up -d

# 4. Set up database
pnpm db:generate
pnpm db:push

# 5. Seed database
pnpm db:seed

# 6. Start dev server
pnpm dev
```

### Demo Page

If you hit Prisma client issues, you can still preview the UI:

```bash
pnpm dev
# Visit http://localhost:3000/demo
```

---

## Error Tracking (Sentry)

Sentry is configured for comprehensive error tracking and monitoring across client, server, and edge runtimes.

### Quick Start

1. **Get Sentry credentials** from [sentry.io](https://sentry.io):
   - Create a new project (or use existing)
   - Copy the DSN from Project Settings → Client Keys (DSN)
   - Generate auth token from Settings → Auth Tokens (needs `project:write` + `project:releases`)

2. **Configure environment variables** in `.env.local`:

```bash
# Runtime error reporting (both can be the same DSN)
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"  # Client-side (public)
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"              # Server-side (private)

# Source map uploads during build
SENTRY_ORG="your-org-slug"           # From Sentry organization URL
SENTRY_PROJECT="your-project-slug"   # From Project Settings → General
SENTRY_AUTH_TOKEN="your-auth-token"  # From Settings → Auth Tokens
```

3. **Test the integration**:

```bash
# Test client-side error capture
pnpm test:sentry-client

# Test server-side error capture
pnpm test:sentry-server

# Verify source maps configuration
pnpm verify:sentry-sourcemaps
```

### What's Configured

✅ **Client-Side Tracking** (`sentry.client.config.ts`)
- React error boundaries capture
- Performance monitoring (10% sample rate)
- Session replay (10% on error, 1% always)
- Breadcrumbs (navigation, console, clicks)
- Sensitive data filtering (passwords, tokens, emails)

✅ **Server-Side Tracking** (`sentry.server.config.ts`)
- API route error capture
- Request context (method, URL, headers)
- Performance monitoring (10% sample rate)
- Database query breadcrumbs
- Sensitive data filtering (auth headers, cookies, secrets)

✅ **Edge Runtime Tracking** (`sentry.edge.config.ts`)
- Middleware error capture
- Optimized for CDN edges (5% sample rate)
- Minimal overhead

✅ **Source Maps**
- Automatically uploaded during production builds
- Readable stack traces in Sentry dashboard
- Original TypeScript file paths and line numbers

### Integration Points

Sentry is integrated in:
- `app/error.tsx` — Route-level error boundary
- `app/global-error.tsx` — Global error boundary
- `lib/api/errors.ts` — API error handler
- `instrumentation.ts` — Next.js initialization hook

### Verification

After deploying, verify Sentry is working:

1. Check Sentry dashboard for test errors
2. Verify stack traces show TypeScript source (not minified JS)
3. Confirm error grouping and release tracking work

**Troubleshooting:** See [docs/SENTRY_SOURCEMAP_VERIFICATION.md](./docs/SENTRY_SOURCEMAP_VERIFICATION.md) for detailed verification steps and troubleshooting guide.

---

## Documentation

| Doc | Description |
|-----|-------------|
| [PRD.md](./PRD.md) | Product Requirements Document (v5.1) — the single source of truth |
| [FILEMAP.md](./FILEMAP.md) | Complete project file structure |
| [SENTRY_SOURCEMAP_VERIFICATION.md](./docs/SENTRY_SOURCEMAP_VERIFICATION.md) | Sentry source maps verification guide |

---

*Last updated: February 9, 2026*
