# Sakuga Legends — Product Requirements Document

**Version:** 5.1  
**Date:** February 7, 2026  
**Status:** Active  
**Replaces:** PRD v4.0, IMPLEMENTATION_PLAN.md, FRONTEND_PLAN.md

### Changelog

| Version | Date | Changes |
|---|---|---|
| 5.1 | 2026-02-07 | Tech lead review: fixed schema bugs (User missing NextAuth relations, Clip missing commentCount, RankingEntry missing FK note, AnimatorRelation→generic sourceId/targetId), aligned API spec with actual codebase, corrected perf targets (FID→INP), added Featured Animator to feature matrix, fixed roadmap/priority phase inconsistencies, separated installed vs planned deps, added Comment indexes, added RelationType enum, added Clip.createdAt index, added changelog |
| 5.0 | 2026-02-07 | Consolidated PRD v4.0 + IMPLEMENTATION_PLAN.md + FRONTEND_PLAN.md into single document. Dropped personas, market analysis, risk analysis, KPIs. Added mobile app (P3), donation-based monetization. Re-scoped all phases from scratch. |

---

## Table of Contents

1. [Vision & Overview](#1-vision--overview)
2. [Core Features](#2-core-features)
3. [Feature Specifications](#3-feature-specifications)
4. [Technical Architecture](#4-technical-architecture)
5. [Database Schema](#5-database-schema)
6. [API Specification](#6-api-specification)
7. [Design System](#7-design-system)
8. [File Structure](#8-file-structure)
9. [Code Patterns & Conventions](#9-code-patterns--conventions)
10. [Content Moderation](#10-content-moderation)
11. [Monetization](#11-monetization)
12. [Development Roadmap](#12-development-roadmap)
13. [Known Issues](#13-known-issues)

---

## 1. Vision & Overview

**Sakuga Legends** is a web platform dedicated to celebrating and cataloging anime key animators. The animator is the primary entity — not the anime series, not the studio. The platform combines a high-fidelity video archive with art-gallery aesthetics to treat animators with the prestige they deserve.

### Vision Statement

> "To become the definitive global resource for animation craft appreciation, where every frame tells a story and every artist receives recognition."

### What Makes This Different

| | Sakuga Legends | Sakugabooru | MAL/AniList |
|---|---|---|---|
| Primary entity | **Animators** | Clips | Anime series |
| Career tracking | Full timeline | None | None |
| Mentor/student mapping | Yes | No | No |
| Educational content | Technique glossary | Tags only | None |
| Video quality | Adaptive 1080p | Variable | N/A |
| Verification system | Source-backed | Community tags | N/A |

### Domain Concepts

- **Sakuga** — Well-animated sequences in anime credited to specific key animators
- **Attribution** — Links an Animator to a Clip with a Role and VerificationStatus, backed by source proof
- **Trust Score** — User reputation earned through approved contributions
- **Fair Use** — Clips max 45 seconds, must include a technique description for educational value
- **Influence Graph** — Directed mentor/student/colleague network between animators

---

## 2. Core Features

### Feature Matrix

| Feature | Description | Priority | Phase |
|---|---|---|---|
| **Animator Profiles** | Name (English + native), bio, career timeline, signature reel, external links | P0 | 1 |
| **Clip Database** | Video clips ≤45s with attribution, tags, verification status | P0 | 1 |
| **Custom Video Player** | HLS playback, frame-by-frame stepping, playback speed, A-B loop | P0 | 1 |
| **Global Search** | Typo-tolerant unified search across animators, clips, anime (Meilisearch) | P0 | 1 |
| **Favorites & Collections** | Save clips/animators; create named, shareable collections | P0 | 1 |
| **Authentication** | OAuth via Google, Discord, Twitter (NextAuth v5) | P0 | 1 |
| **Moderation Queue** | Human review of clip submissions with approve/reject workflow | P0 | 1 |
| **Featured Animator** | Rotating featured animator on homepage with hero section | P0 | 1 |
| **Trending Clips** | Hacker News-style decay algorithm surfacing recent popular clips | P1 | 1 |
| **Rankings** | Editorial + community-voted top animator/clip lists | P1 | 1 |
| **Technique Glossary** | A-Z animation terms with definitions, video examples, inline tooltips | P1 | 1 |
| **Influence Graph** | Interactive directed graph of mentor/student/colleague relationships | P1 | 1 |
| **Mobile Touch Controls** | Tap zones, long-press scrubbing, safe-zone handling | P1 | 1 |
| **Studio Timeline** | Interactive visualization of animator careers across studios | P2 | 2 |
| **Timestamped Comments** | Discussion on clips with optional timestamp markers | P2 | 2 |
| **Follow Animators** | Follow animators and receive notifications for new attributed clips | P2 | 2 |
| **Mobile App** | React Native app for iOS and Android | P3 | 3 |

---

## 3. Feature Specifications

### 3.1 Animator Profile System

**Components:** Header (name, photo, stats), Biography (rich text), Career Timeline (horizontal, clickable nodes), Signature Reel (auto-playing top clips), Influence Graph, Full Filmography (paginated), External Links (Twitter, Pixiv, website).

Profile pages are server-rendered with ISR (1-hour revalidation). Each animator has a unique slug used in URLs (`/animators/yutaka-nakamura`).

### 3.2 Featured Animator

Rotating hero section on the homepage (`/`) showcasing one animator with a large banner, bio excerpt, and top clips. Served by `GET /api/featured-animator`. Selection can be editorial (manual) or algorithmic (e.g., recent high-quality verified attribution).

**Components:** `components/home/featured-animator-hero.tsx`, `lib/hooks/use-featured-animator.ts`, `lib/db/queries/featured.ts`.

### 3.3 Video Player

Custom player built on HLS.js with Cloudflare Stream delivery.

**Controls:**
- Frame stepping: `,` (back) and `.` (forward) at 24fps (41.67ms/frame)
- Playback speeds: 0.25x, 0.5x, 1x, 1.5x, 2x
- A-B loop region selection
- Frame counter display ("Frame 12/48")

**Mobile touch model (TikTok/Instagram style):**
- Left tap: rewind 5 frames
- Right tap: forward 5 frames
- Center tap: play/pause
- Double tap: favorite
- Long press + drag: precision scrubbing with frame counter overlay
- Edge safe zones (20px) to avoid browser gesture conflicts

**Component structure:** `components/clips/video-player/` — `video-player.tsx` (main), `player-context.tsx` (state), `player-controls.tsx`, `frame-stepper.tsx`, `playback-speed.tsx`, `touch-overlay.tsx`.

### 3.4 Trending Algorithm

Hacker News-style decay function:

```
score = (log10(max(views, 1)) + favorites×2 + comments×1.5) / (hoursAge + 2)^1.8
```

Time window: clips from last 30 days. Scores recalculated hourly via cron or on-demand with caching. Log normalization prevents old viral clips from permanently dominating.

**Why this works:** `log10(views)` compresses 1M views to ~6 points and 1000 views to ~3. Fresh clips with 100 favorites can compete with old viral clips. Gravity decay ensures content cycles naturally.

### 3.5 Technique Glossary

Standalone glossary pages (`/glossary`, `/glossary/[slug]`) with A-Z navigation. Each term has a definition, video example, and related terms.

**Inline tooltips:** Technique tags below the video player (`components/glossary/term-tag.tsx`) are clickable popovers showing the term definition and a thumbnail of the example clip. Links to full glossary page. Mobile: tap to open, tap outside to close.

**Components:** `components/glossary/` — `glossary-index.tsx` (A-Z nav), `term-card.tsx` (grid card), `term-tag.tsx` (clickable tag with popover).

### 3.6 Influence Graph

Interactive directed graph in `components/graphs/`. Nodes are animators (with photos), edges are labeled relationships (mentor, colleague, influenced_by).

**Implementation:** Force-directed layout. Components: `influence-graph.tsx` (rendering), `influence-section.tsx` (graph + controls), `relations-list.tsx` (mobile fallback list).

**Pruning:** Default 15 nodes on mobile, 30 on desktop. Shows top 5 mentors + top 5 students + 5 closest colleagues. "Show all" button expands to full graph. Mobile defaults to list view with graph as opt-in.

**Accessibility:** `prefers-reduced-motion` disables physics simulation (static layout). Keyboard: Tab through nodes, Enter to select, Arrow keys to pan. Screen reader: announce "Yutaka Nakamura, mentored by Yoshinori Kanada, 3 shared works".

### 3.7 Studio Timeline (Phase 2)

Interactive visualization showing an animator's career path across studios with dates, positions, and notable works at each studio. Built on the StudioHistory model.

**Routes:** `/studios` (browse), `/studios/[slug]` (detail with timeline).
**Components:** `components/studios/` — `studio-card.tsx`, `studio-timeline.tsx`, `timeline-event.tsx`.

### 3.8 Timestamped Comments (Phase 2)

Comments on clips with optional timestamp markers (e.g., "at 0:12 — the smear here is incredible"). Clicking a timestamp jumps the player to that point. Comments support threading via `parentId`. Comments require authentication and are subject to moderation.

### 3.9 Follow Animators + Notifications (Phase 2)

Users can follow animators to receive notifications when new clips are attributed. Notification delivery via Inngest background job (`notify-followers.ts`) triggered when a clip attribution is approved.

**API:** `POST /api/user/follows/:animatorId` (toggle follow), `GET /api/user/notifications` (inbox), `PATCH /api/user/notifications/:id` (mark read).

### 3.10 Mobile App (Phase 3)

React Native app for iOS and Android sharing the same API backend. Core features: browse animators/clips, video player with frame stepping, search, favorites, notifications via push. Design system tokens shared with web via a common config.

---

## 4. Technical Architecture

### 4.1 Tech Stack — Currently Installed

Versions pinned from `package.json`:

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.21 |
| Language | TypeScript (strict mode) | 5.7.2 |
| Styling | Tailwind CSS (dark-mode-first, `class` strategy) | 3.4.17 |
| Database | PostgreSQL 15 + Prisma ORM | 5.22.0 |
| Search | Meilisearch client | 0.44.1 (client) / v1.6 (server image) |
| Auth | NextAuth.js v5 beta + @auth/prisma-adapter | 5.0.0-beta.25 |
| Media Storage | Cloudflare R2 via @aws-sdk/client-s3 | 3.705.0 |
| Video Playback | hls.js | 1.5.18 |
| Client State | Zustand | 5.0.2 |
| Server State | @tanstack/react-query | 5.62.7 |
| Animations | Framer Motion | 11.15.0 |
| Validation | Zod | 3.24.1 |
| Icons | lucide-react | 0.468.0 |
| Utilities | clsx, tailwind-merge, date-fns, slugify | various |
| Testing | Vitest + @testing-library/react + Playwright | 2.1.8 / 16.1.0 / 1.49.1 |
| Package Manager | **pnpm** (never npm/yarn) | — |

### 4.2 Tech Stack — Planned (Not Yet Installed)

| Layer | Technology | Phase |
|---|---|---|
| Background Jobs | Inngest (event-driven, retries) | 2 |
| Analytics | Plausible (privacy-focused) | 2 |
| Error Tracking | Sentry | 2 |
| i18n | next-intl | 3 |
| Mobile | React Native | 3 |
| Hosting | Vercel | 1 (deployment pending) |

### 4.3 Infrastructure Services

```
Clients (Web Browser, Mobile App)
         │
         ▼
Edge Layer (Cloudflare CDN + WAF + DDoS)
         │
         ▼
Application Layer (Vercel)
├── Next.js 14 App Router
│   ├── Pages (SSR/ISR)
│   ├── API Routes (REST)
│   └── Server Components
│
├── PostgreSQL (Prisma ORM)
├── Meilisearch (full-text search)
├── NextAuth v5 (OAuth)
├── Cloudflare R2 (images/thumbnails)
├── Cloudflare Stream (video HLS)
├── Redis (rate limiting, caching)
└── Inngest (background jobs) — Phase 2
    ├── process-video.ts (transcode)
    ├── index-content.ts (search sync)
    ├── notify-followers.ts (notifications)
    └── send-notification.ts
```

**Local development:** `docker-compose up -d` runs PostgreSQL 15, Meilisearch v1.6, and Redis 7.

### 4.4 Performance Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |
| TTFB (Time to First Byte) | < 600ms |
| Search response (p95) | < 200ms |
| Video start (time to first frame) | < 1s |

### 4.5 Performance Strategy

| Area | Approach |
|---|---|
| SSR/SSG | Static gen for profiles; ISR 1-hour revalidation |
| Images | Next.js Image with WebP/AVIF, lazy loading |
| Video | Lazy load player; preload on hover; adaptive bitrate |
| Database | Connection pooling (PgBouncer); indexed queries; pagination |
| Caching | Cloudflare edge cache; Redis for sessions/rate limiting |
| Bundle | Dynamic imports; route-based code splitting |
| Fonts | `next/font` with subset; swap display |

### 4.6 Security

| Requirement | Implementation |
|---|---|
| Authentication | NextAuth.js OAuth (Google, Discord, Twitter) |
| Authorization | Role-based (User, Contributor, Moderator, Admin) |
| Encryption | TLS 1.3 in transit, AES-256 at rest |
| Input Validation | Zod schemas on all API endpoints |
| Rate Limiting | 100 req/min anon, 1000 req/min auth (via Redis) |
| CSRF | SameSite cookies + CSRF tokens |
| CSP | Strict Content Security Policy headers |

### 4.7 Accessibility (WCAG 2.1 AA)

Full keyboard navigation, semantic HTML with ARIA labels, min 4.5:1 color contrast, visible focus rings, video caption support, `prefers-reduced-motion` respected.

### 4.8 SEO

Server-side rendering, dynamic meta tags + OG images, JSON-LD structured data (Person for animators, VideoObject for clips), auto-generated sitemap, canonical URLs.

### 4.9 Internationalization (Phase 3)

Phase 3 scope: English + Japanese first, then Chinese (Simplified) + Korean. Implementation via `next-intl`. Native name fields already exist on Animator, Anime, and Studio models. Locale-aware date/number formatting.

---

## 5. Database Schema

### 5.1 Enums

```prisma
enum Role {
  KEY_ANIMATION
  SECOND_KEY_ANIMATION
  ANIMATION_DIRECTOR
  CHIEF_ANIMATION_DIRECTOR
  CHARACTER_DESIGN
  MECHANICAL_ANIMATION
  EFFECTS_ANIMATION
}

enum VerificationStatus {
  VERIFIED
  SPECULATIVE
  DISPUTED
}

enum UserRole {
  USER
  CONTRIBUTOR
  MODERATOR
  ADMIN
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

enum NotificationType {
  NEW_CLIP
  CLIP_APPROVED
  COMMENT_REPLY
}

enum RelationType {
  MENTOR
  COLLEAGUE
  INFLUENCED_BY
}
```

### 5.2 Core Models

```prisma
model Animator {
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String
  nativeName    String?
  bio           String?   @db.Text
  birthDate     DateTime?
  deathDate     DateTime?
  photoUrl      String?
  twitterHandle String?
  pixivId       String?
  websiteUrl    String?

  attributions      Attribution[]
  outgoingRelations AnimatorRelation[] @relation("SourceAnimator")
  incomingRelations AnimatorRelation[] @relation("TargetAnimator")
  studioHistory     StudioHistory[]
  favorites         Favorite[]
  followers         Follow[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String?

  @@index([name])
  @@index([slug])
}

model AnimatorRelation {
  id           String       @id @default(cuid())
  sourceId     String
  targetId     String
  relationType RelationType @default(MENTOR)
  startYear    Int?
  endYear      Int?

  source       Animator @relation("SourceAnimator", fields: [sourceId], references: [id], onDelete: Cascade)
  target       Animator @relation("TargetAnimator", fields: [targetId], references: [id], onDelete: Cascade)

  @@unique([sourceId, targetId, relationType])
  @@index([targetId])
}
```

**AnimatorRelation semantics:** Direction is `source → target`:
- `MENTOR`: source is the mentor, target is the student
- `INFLUENCED_BY`: source was influenced by target
- `COLLEAGUE`: direction is arbitrary (use `sourceId < targetId` convention to avoid duplicates)

```prisma
model Studio {
  id         String   @id @default(cuid())
  slug       String   @unique
  name       String
  nativeName String?
  founded    Int?
  dissolved  Int?
  parentId   String?
  logoUrl    String?

  parent     Studio?  @relation("StudioFamily", fields: [parentId], references: [id])
  children   Studio[] @relation("StudioFamily")
  clips      Clip[]
  history    StudioHistory[]

  @@index([name])
}

model StudioHistory {
  id         String   @id @default(cuid())
  animatorId String
  studioId   String
  startYear  Int
  endYear    Int?
  position   String?

  animator   Animator @relation(fields: [animatorId], references: [id], onDelete: Cascade)
  studio     Studio   @relation(fields: [studioId], references: [id], onDelete: Cascade)

  @@unique([animatorId, studioId, startYear])
}
```

### 5.3 Clip System

```prisma
model Clip {
  id                   String   @id @default(cuid())
  slug                 String   @unique
  title                String
  videoUrl             String   // Cloudflare Stream ID
  thumbnailUrl         String?
  duration             Int      // seconds (max 45)

  animeId              String
  anime                Anime    @relation(fields: [animeId], references: [id])
  episodeNumber        Int?
  timestampStart       String?

  techniqueDescription String   @db.Text // Required — fair use compliance

  attributions         Attribution[]
  tags                 ClipTag[]
  collections          CollectionClip[]
  favorites            Favorite[]
  comments             Comment[]

  viewCount            Int      @default(0)
  favoriteCount        Int      @default(0)
  commentCount         Int      @default(0)

  studioId             String?
  studio               Studio?  @relation(fields: [studioId], references: [id])
  submittedBy          String?
  submissionStatus     SubmissionStatus @default(PENDING)
  moderatedBy          String?
  moderatedAt          DateTime?

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([animeId])
  @@index([submissionStatus])
  @@index([createdAt])
}

model Anime {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  nativeTitle String?
  romajiTitle String?
  year        Int
  season      String?
  coverUrl    String?
  malId       Int?

  clips       Clip[]

  @@index([title])
  @@index([year])
}

model Attribution {
  id                 String             @id @default(cuid())
  animatorId         String
  clipId             String
  role               Role               @default(KEY_ANIMATION)

  verificationStatus VerificationStatus @default(SPECULATIVE)
  sourceUrl          String?
  sourceNote         String?
  verifiedBy         String?
  verifiedAt         DateTime?

  animator           Animator @relation(fields: [animatorId], references: [id], onDelete: Cascade)
  clip               Clip     @relation(fields: [clipId], references: [id], onDelete: Cascade)

  @@unique([animatorId, clipId, role])
  @@index([verificationStatus])
}
```

### 5.4 Tagging

```prisma
model Tag {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  category      String   // technique, style, content
  description   String?  @db.Text
  exampleClipId String?
  clips         ClipTag[]
  @@index([category])
}

model ClipTag {
  clipId String
  tagId  String
  clip   Clip @relation(fields: [clipId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([clipId, tagId])
}
```

### 5.5 User System

```prisma
model User {
  id                String         @id @default(cuid())
  email             String         @unique
  name              String?
  image             String?
  role              UserRole       @default(USER)
  trustScore        Int            @default(0)
  contributionCount Int            @default(0)

  accounts          Account[]
  sessions          Session[]
  favorites         Favorite[]
  collections       Collection[]
  comments          Comment[]
  follows           Follow[]
  notifications     Notification[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Favorite {
  id         String    @id @default(cuid())
  userId     String
  animatorId String?
  clipId     String?
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  animator   Animator? @relation(fields: [animatorId], references: [id], onDelete: Cascade)
  clip       Clip?     @relation(fields: [clipId], references: [id], onDelete: Cascade)
  createdAt  DateTime  @default(now())
  @@unique([userId, animatorId])
  @@unique([userId, clipId])
}

model Collection {
  id          String           @id @default(cuid())
  userId      String
  name        String
  description String?
  isPublic    Boolean          @default(true)
  slug        String           @unique
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  clips       CollectionClip[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model CollectionClip {
  collectionId String
  clipId       String
  order        Int        @default(0)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  clip         Clip       @relation(fields: [clipId], references: [id], onDelete: Cascade)
  @@id([collectionId, clipId])
}

model Comment {
  id        String    @id @default(cuid())
  userId    String
  clipId    String
  content   String    @db.Text
  timestamp Float?    // Optional video timestamp in seconds
  parentId  String?   // For reply threads
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  clip      Clip      @relation(fields: [clipId], references: [id], onDelete: Cascade)
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  @@index([clipId, createdAt])
  @@index([parentId])
}

model Follow {
  id         String   @id @default(cuid())
  userId     String
  animatorId String
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  animator   Animator @relation(fields: [animatorId], references: [id], onDelete: Cascade)
  @@unique([userId, animatorId])
  @@index([animatorId])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  linkUrl   String?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, read, createdAt])
}
```

### 5.6 Educational Content

```prisma
model GlossaryTerm {
  id            String   @id @default(cuid())
  slug          String   @unique
  term          String
  definition    String   @db.Text
  exampleClipId String?
  relatedTerms  String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([term])
}
```

### 5.7 Rankings

```prisma
model RankingList {
  id          String         @id @default(cuid())
  slug        String         @unique
  title       String
  description String?        @db.Text
  type        String         // editorial, community
  isActive    Boolean        @default(true)
  entries     RankingEntry[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model RankingEntry {
  id         String      @id @default(cuid())
  listId     String
  animatorId String?
  clipId     String?
  rank       Int
  score      Float       @default(0)
  list       RankingList @relation(fields: [listId], references: [id], onDelete: Cascade)
  @@index([listId, rank])
}
```

**Note on RankingEntry:** `animatorId` and `clipId` are intentionally soft references (no FK constraint) to allow flexibility — entries can reference animators or clips and the display layer resolves these via separate queries. If stronger integrity is needed later, add explicit relations.

### 5.8 NextAuth Models

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

### 5.9 Model Summary

| Model | Purpose |
|---|---|
| Animator | Key animators with bio, native name, slug |
| AnimatorRelation | Directed graph: mentor/colleague/influenced_by (source → target) |
| Studio | Animation studios with parent relationships |
| StudioHistory | Animator career at studios |
| Clip | Video clips (max 45s) with viewCount, favoriteCount, commentCount |
| Anime | Source anime series |
| Attribution | Links Animator ↔ Clip with Role + VerificationStatus |
| Tag, ClipTag | Technique/style tagging |
| User | Auth + role + trustScore + NextAuth relations (accounts, sessions) |
| Favorite | User bookmarks (animators + clips) |
| Collection, CollectionClip | User-curated playlists |
| Comment | Discussion on clips (timestamps + threading) |
| Follow | Animator subscriptions |
| Notification | User notification inbox |
| GlossaryTerm | Animation technique definitions |
| RankingList, RankingEntry | Editorial + community rankings |
| Account, Session, VerificationToken | NextAuth models |

---

## 6. API Specification

### 6.1 Response Format

All responses follow a consistent envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Success with pagination
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150, "hasNext": true } }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Animator not found", "details": {} } }
```

### 6.2 Endpoints — Currently Implemented

These endpoints exist in the codebase (verified against FILEMAP):

#### Featured

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/featured-animator` | — | Get featured animator of the week |

#### Animators

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/animators` | — | List animators (paginated, sortable) |
| POST | `/api/animators` | Mod+ | Create animator |
| GET | `/api/animators/:slug` | — | Get animator by slug |
| PATCH | `/api/animators/:slug` | Mod+ | Update animator |
| GET | `/api/animators/:slug/clips` | — | Get animator's clips |
| GET | `/api/animators/:slug/timeline` | — | Get career timeline |
| GET | `/api/animators/:slug/relations` | — | Get influence graph data |

#### Clips

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/clips` | — | List clips (paginated, filterable) |
| POST | `/api/clips` | Auth | Submit new clip |
| GET | `/api/clips/trending` | — | Get trending clips |
| GET | `/api/clips/upload-url` | Auth | Get presigned upload URL (Cloudflare R2) |
| GET | `/api/clips/:slug` | — | Get clip by slug |
| PATCH | `/api/clips/:slug` | Mod+ | Update clip metadata |
| POST | `/api/clips/:slug/favorite` | Auth | Toggle favorite |
| GET | `/api/clips/:slug/favorite` | Auth | Check if favorited |

#### Rankings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/rankings` | — | List ranking lists |
| GET | `/api/rankings/:slug` | — | Get ranking with entries |
| POST | `/api/rankings/:slug/vote` | Auth | Submit/toggle vote |

#### Glossary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/glossary` | — | List glossary terms |
| GET | `/api/glossary/:slug` | — | Get term detail |

#### Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/search` | — | Unified search (q, type, filters) via Meilisearch |

#### User Data

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/user/collections` | Auth | List user's collections |
| POST | `/api/user/collections` | Auth | Create collection |
| GET | `/api/user/collections/:id` | Auth | Get collection detail |
| PATCH | `/api/user/collections/:id` | Auth | Update collection |
| DELETE | `/api/user/collections/:id` | Auth | Delete collection |
| POST | `/api/user/collections/:id/clips` | Auth | Add clip to collection |
| DELETE | `/api/user/collections/:id/clips/:clipId` | Auth | Remove clip from collection |
| GET | `/api/user/favorites/clips` | Auth | Get favorite clips |
| GET | `/api/user/favorites/animators` | Auth | Get favorite animators |

#### Moderation

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/moderation/stats` | Mod+ | Get moderation dashboard stats |
| GET | `/api/moderation/clips` | Mod+ | Get pending clip submissions |
| PATCH | `/api/moderation/clips/:id` | Mod+ | Approve/reject clip |

#### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| * | `/api/auth/[...nextauth]` | — | NextAuth handlers (login, callback, signout) |

### 6.3 Endpoints — Planned (Phase 2+)

| Method | Endpoint | Auth | Phase | Description |
|---|---|---|---|---|
| GET | `/api/clips/:slug/comments` | — | 2 | Get clip comments |
| POST | `/api/clips/:slug/comments` | Auth | 2 | Post comment |
| DELETE | `/api/comments/:id` | Auth/Mod | 2 | Delete comment |
| GET | `/api/user/follows` | Auth | 2 | User's followed animators |
| POST | `/api/user/follows/:animatorId` | Auth | 2 | Toggle follow |
| GET | `/api/user/notifications` | Auth | 2 | User's notifications |
| PATCH | `/api/user/notifications/:id` | Auth | 2 | Mark notification as read |
| GET | `/api/studios` | — | 2 | List studios |
| GET | `/api/studios/:slug` | — | 2 | Get studio detail |
| GET | `/api/studios/:slug/history` | — | 2 | Get studio timeline data |
| GET | `/api/search/suggest` | — | 2 | Autocomplete suggestions |
| GET | `/api/clips/:slug/related` | — | 2 | Get related clips |
| GET | `/api/user/profile` | Auth | 2 | Current user profile |

### 6.4 Rate Limits

| Tier | Limit | Window |
|---|---|---|
| Anonymous | 100 requests | 1 minute |
| Authenticated | 1,000 requests | 1 minute |
| Contributor | 2,000 requests | 1 minute |

### 6.5 Query Parameters (Standard)

All list endpoints support:

```
?page=1&limit=20&sortBy=name&sortOrder=asc&q=search+term
```

Validated via Zod schemas in `lib/validations/`.

---

## 7. Design System

### 7.1 Philosophy

> "Cinematic, Gallery-Like, Respectful"

The platform should feel like visiting an art museum, not a database.

### 7.2 Colors

Defined in `tailwind.config.ts`:

```
Dark Mode (Default):
├── Background:     #0D0D14
├── Surface:        #161622
├── Surface Hover:  #1E1E2E
├── Border:         #2A2A3C
├── Text Primary:   #F4F4F5  (foreground)
├── Text Secondary: #A1A1AA  (foreground-muted)
├── Accent:         #8B5CF6  (Violet)
├── Accent Hover:   #A78BFA
├── Accent Dark:    #7C3AED
├── Success:        #22C55E
├── Error:          #EF4444
├── Warning:        #F59E0B
├── Info:           #3B82F6
└── Semantic (verification status):
    ├── Verified:    #22C55E (Green)
    ├── Speculative: #F59E0B (Amber)
    └── Disputed:    #EF4444 (Red)

Light Mode:
├── Background:     #FAFAFA
├── Surface:        #FFFFFF
├── Text Primary:   #18181B
├── Border:         #E4E4E7
└── Accent:         #7C3AED
```

### 7.3 Typography

Defined in `tailwind.config.ts` with custom `fontSize` tokens:

| Use | Font | Tailwind Class |
|---|---|---|
| Display headers | Playfair Display (700) | `font-display text-display-lg/md/sm` |
| Section headers | DM Sans (600) | `font-sans text-heading-lg/md/sm` |
| Body | DM Sans (400) | `font-sans text-body-lg/md/sm` |
| Captions/labels | DM Sans (500) | `font-sans text-caption` |
| Code/data | JetBrains Mono (400) | `font-mono` |

Font loading via `next/font` with subsetting and `swap` display. CSS variables: `--font-playfair`, `--font-dm-sans`, `--font-jetbrains`.

### 7.4 Layout

- Magazine-style asymmetric grids
- Full-bleed hero imagery
- Generous whitespace (min 24px between sections)
- Card-based content (`rounded-card` = 12px, `rounded-button` = 8px)
- Sticky header navigation
- Mobile-first breakpoints: 640 / 768 / 1024 / 1280px

### 7.5 Motion

Defined in `tailwind.config.ts` keyframes:

| Element | Animation | Duration |
|---|---|---|
| Page transitions | `animate-fade-in` | 300ms ease-out |
| Slide up (cards) | `animate-slide-up` | 300ms ease-out |
| Modal open | `animate-scale-in` | 250ms ease-out |
| Loading skeletons | `animate-shimmer` | 2s linear infinite |
| Card hover | `shadow-card → shadow-card-hover` | via transition |
| Accent glow | `shadow-glow` | — |

All animations respect `prefers-reduced-motion`.

---

## 8. File Structure

```
app/                          # Next.js App Router
├── (auth)/                   # Auth route group (/login)
├── (main)/                   # Main layout (header + footer)
│   ├── animators/            # Listing + [slug] detail + influence
│   ├── clips/                # Listing + [slug] detail
│   ├── collections/          # User collections
│   ├── favorites/            # User favorites
│   ├── glossary/             # Technique glossary + [slug]
│   ├── moderation/           # Mod dashboard + clip queue
│   ├── rankings/             # Ranking lists + [slug]
│   ├── search/               # Full-text search
│   ├── trending/             # Trending clips
│   └── upload/               # Clip submission
├── api/                      # API route handlers (see Section 6)
└── demo/                     # Standalone demo (works without DB)

components/                   # Feature-based React components
├── ui/                       # Primitives (badge, button, card, combobox, dialog,
│                             #   input, select, skeleton, tabs, textarea, toast)
├── animators/                # animator-card, animator-grid, animator-header, career-timeline
├── clips/                    # clip-card, clip-grid, attribution-panel, trending-section
│   └── video-player/         # video-player, player-context, player-controls,
│                             #   frame-stepper, playback-speed, touch-overlay
├── collections/              # collection-card, collection-grid, create/add modals
├── common/                   # favorite-button (shared across entities)
├── error/                    # error-boundary
├── glossary/                 # glossary-index, term-card, term-tag (tooltip popover)
├── graphs/                   # influence-graph, influence-section, relations-list
├── home/                     # featured-animator-hero, recent-additions-section
├── layout/                   # header, footer
├── moderation/               # moderation-queue-table, moderation-review-modal, moderation-stats
├── providers/                # SessionProvider + QueryClientProvider wrapper
├── rankings/                 # ranking-card, ranking-grid, ranking-list, ranking-item,
│                             #   ranking-filters, vote-button
├── search/                   # search-command (Cmd+K), search-filters, search-hit-card
└── upload/                   # clip-form, video-dropzone, animator-attribution-field, upload-progress

lib/                          # Business logic
├── api/                      # client.ts (typed fetch), errors.ts (withErrorHandler), endpoints.ts
├── auth/                     # config.ts (NextAuth), utils.ts (getSession, requireAuth)
├── db/                       # prisma.ts (singleton), utils.ts (pagination helpers)
│   └── queries/              # animators.ts, clips.ts, collections.ts, favorites.ts,
│                             #   featured.ts, glossary.ts, moderation.ts, rankings.ts,
│                             #   relations.ts, trending.ts
├── hooks/                    # React Query hooks per entity (use-animators, use-clips,
│                             #   use-collections, use-favorite, use-favorites, use-featured-animator,
│                             #   use-glossary, use-influence-graph, use-moderation, use-rankings,
│                             #   use-recent-clips, use-trending, use-upload,
│                             #   use-debounce, use-local-storage, use-media-query, use-touch-controls)
├── search/                   # client.ts (Meilisearch), hooks.ts (useSearch, useGlobalSearch)
├── stores/                   # create-store.ts (factory), ui-store.ts, search-store.ts, player-store.ts
├── utils/                    # cn.ts (clsx + tailwind-merge), format.ts, slug.ts
└── validations/              # common.ts, animator.ts, clip.ts (Zod schemas)

config/                       # constants.ts, routes.ts, navigation.ts, site.ts
types/                        # index.ts, animator.ts, clip.ts, api.ts
prisma/
├── schema.prisma             # Database schema (see Section 5)
└── seed/
    └── index.ts              # Seed data entry point (pnpm db:seed)
```

**File count:** ~192 files across app (54), components (73), lib (42), config (4), types (4), prisma (1), root configs (9), docs (5).

---

## 9. Code Patterns & Conventions

### 9.1 Critical Rules

1. **pnpm only** — never npm or yarn
2. **`@/` import alias** for all imports
3. **kebab-case** file naming (`animator-card.tsx`, `use-clips.ts`)
4. **Server components by default** — `'use client'` only where needed
5. **`withErrorHandler()`** on all API routes
6. **Consistent API response**: `{ success: true, data }` or `{ success: false, error: { code, message } }`
7. **`cn()`** for all conditional Tailwind classes (clsx + tailwind-merge)
8. **No magic values** — use `config/constants.ts`
9. **Dark-mode-first** design
10. **TypeScript strict** — no implicit any, no unchecked index access
11. **Feature-based** component folders under `components/`
12. **Query key factories** for React Query cache management

### 9.2 API Client

```typescript
import { api } from '@/lib/api'

api.get<AnimatorListResponse>('/animators', { page: 1, limit: 20 })
api.post<ClipResponse>('/clips', { title: '...', videoUrl: '...' })
api.patch<T>(endpoint, body)
api.put<T>(endpoint, body)
api.delete<T>(endpoint)

// Throws ApiClientError on non-2xx
class ApiClientError extends Error {
  code: string      // ERROR_CODES enum
  status: number    // HTTP status
  details?: Record<string, unknown>
}
```

### 9.3 API Endpoints Helper

```typescript
import { API_ENDPOINTS } from '@/lib/api'

API_ENDPOINTS.animators.list           // '/animators'
API_ENDPOINTS.animators.detail(slug)   // '/animators/{slug}'
API_ENDPOINTS.animators.clips(slug)    // '/animators/{slug}/clips'
API_ENDPOINTS.clips.trending           // '/clips/trending'
API_ENDPOINTS.search.global            // '/search'
API_ENDPOINTS.user.favorites           // '/user/favorites'
```

### 9.4 Error Handling

```typescript
import { errors, withErrorHandler } from '@/lib/api/errors'

errors.notFound('Animator')     // 404
errors.unauthorized()           // 401
errors.forbidden()              // 403
errors.validation(zodError)     // 400 + flattened Zod errors
errors.badRequest('Invalid')    // 400
errors.internal(error)          // 500 (logs to console)
errors.duplicate('Clip')        // 409
errors.rateLimited()            // 429

export const GET = withErrorHandler(async (request) => {
  // Auto-catches ZodError → errors.validation(), other Error → errors.internal()
  return NextResponse.json({ success: true, data: result })
})
```

### 9.5 React Query Hooks

```typescript
// Query key factory (lib/hooks/use-animators.ts)
export const animatorKeys = {
  all: ['animators'] as const,
  lists: () => [...animatorKeys.all, 'list'] as const,
  list: (params) => [...animatorKeys.lists(), params] as const,
  details: () => [...animatorKeys.all, 'detail'] as const,
  detail: (slug) => [...animatorKeys.details(), slug] as const,
}

// Standard hook
export function useAnimators(params = {}) {
  return useQuery({
    queryKey: animatorKeys.list(params),
    queryFn: () => api.get<AnimatorListResponse>(API_ENDPOINTS.animators.list, params),
  })
}

// Infinite scroll
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

// Detail with select + enabled guard
export function useAnimator(slug: string | undefined) {
  return useQuery({
    queryKey: animatorKeys.detail(slug!),
    queryFn: () => api.get<AnimatorDetailResponse>(API_ENDPOINTS.animators.detail(slug!)),
    select: (data) => data.data,
    enabled: !!slug,
  })
}
```

### 9.6 Zustand Stores

```typescript
import { createStore, createPersistedStore } from '@/lib/stores/create-store'

// createStore(name, initializer) — devtools + subscribeWithSelector
// createPersistedStore(name, initializer) — adds localStorage persistence

export const useUIStore = createStore<UIState>('ui-store', (set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  toasts: [],
  addToast: (message, type) => set((s) => ({
    toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }],
  })),
}))

// Other stores: useSearchStore (persisted), usePlayerStore (persisted)
```

### 9.7 Routes

```typescript
import { ROUTES } from '@/config/routes'

ROUTES.home                              // '/'
ROUTES.animators.list                    // '/animators'
ROUTES.animators.detail('hayao-miyazaki') // '/animators/hayao-miyazaki'
ROUTES.clips.detail('akira-bike')         // '/clips/akira-bike'
ROUTES.moderation.dashboard              // '/moderation'
```

### 9.8 Validation

```typescript
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

### 9.9 Commands

```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm type-check       # tsc --noEmit
pnpm test             # Vitest unit tests
pnpm test:ui          # Vitest with UI
pnpm test:e2e         # Playwright E2E

pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema (no migration)
pnpm db:migrate       # Prisma migrate dev
pnpm db:seed          # Run seed script (tsx prisma/seed/index.ts)
pnpm db:studio        # Prisma Studio GUI

docker-compose up -d  # Postgres + Meilisearch + Redis
```

### 9.10 Environment Variables

**Current (required):**
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
REDIS_URL
```

**Phase 2 additions:**
```
INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
SENTRY_DSN
PLAUSIBLE_DOMAIN
```

---

## 10. Content Moderation

### 10.1 Content Policy

**Allowed:** Animation clips from commercially released anime, ≤45 seconds, with clear educational/analytical purpose and proper attribution.

**Prohibited:** Full episodes/movies, clips >45s, unreleased/leaked material, non-anime content, explicit sexual content, hate/violence content.

### 10.2 Moderation Workflow

```
User Upload
    │
    ▼
Automated Check (duration ≤45s, file size, duplicate detection)
    │
    ├── FAIL → Auto-reject with reason
    │
    ▼
Moderation Queue (human review)
    │
    ├── REJECT → Notify user with reason
    │
    ▼
APPROVE → Published + Indexed + Followers Notified
```

### 10.3 Trust & Reputation

| Level | Score | Capabilities |
|---|---|---|
| New User | 0–10 | View, favorite, create collections |
| Contributor | 11–50 | Submit clips (requires moderation) |
| Trusted | 51–200 | Submit clips (auto-approve), edit tags |
| Expert | 201–500 | Override attribution (flagged for review) |
| Moderator | Staff | Full moderation powers |

**Earning:** Approved submission +5, verified attribution +10, correction accepted +3.  
**Losing:** Rejected submission −2, false report −5, guideline violation −20 to −100.

### 10.4 DMCA Compliance

Registered DMCA agent. Takedown form at `/dmca`. Target response time <24 hours. Counter-notice process available. Repeat infringer policy: account termination after 3 strikes.

---

## 11. Monetization

### 11.1 Model: Donation/Tip-Based

The platform is free for all users. Revenue comes from voluntary donations.

**Channels:**
- Ko-fi or Buy Me a Coffee integration on the site
- Patreon for recurring supporters with perks (e.g., early access to features, supporter badge, Discord role)
- One-time donations via Stripe

### 11.2 Ethical Guidelines

- **Never paywall content** — all animators, clips, glossary, and search remain free
- **Supporter perks are cosmetic** — badges, Discord roles, early feature access
- **No ads** — the gallery aesthetic is paramount
- **Transparent spending** — public breakdown of server costs vs donations

---

## 12. Development Roadmap

### Phase 1: Foundation & Core

**Goal:** Fully functional platform with core features working end-to-end.

| Area | Deliverables |
|---|---|
| Infrastructure | Next.js 14 setup, Prisma schema, NextAuth, Docker (Postgres + Meilisearch + Redis) |
| Animator System | Profile pages, career timeline, CRUD, seed data, featured animator hero |
| Clip System | Upload flow (presigned URL → R2 → Stream), video player (frame stepping, playback speed, A-B loop), attribution, moderation queue |
| Search | Meilisearch integration, unified search, Cmd+K command palette |
| Discovery | Trending clips (decay algorithm), rankings (editorial + community) |
| Education | Technique glossary with inline tooltips (popover tags) |
| Social | Favorites, collections, influence graph (with mobile list fallback) |
| Mobile UX | Touch controls (tap zones, long-press scrub, safe zones) |

### Phase 2: Community & Engagement

**Goal:** Deepen engagement, add social features, and harden infrastructure.

| Area | Deliverables |
|---|---|
| Studio Timeline | Interactive career visualization across studios |
| Comments | Timestamped comments with threading |
| Follow + Notifications | Follow animators, notification inbox, Inngest background delivery |
| Infrastructure | Inngest integration, Sentry error tracking, Plausible analytics |
| API Expansion | Studio endpoints, autocomplete, related clips, user profile |
| Seed Data | Comprehensive seed data for animators, clips, anime |

### Phase 3: Scale & Expand

**Goal:** Grow the platform and expand to native mobile.

| Area | Deliverables |
|---|---|
| Mobile App | React Native app (iOS + Android) sharing API backend |
| i18n | Japanese language support (next-intl), then Chinese + Korean |
| Performance | Edge caching, database read replicas, bundle optimization |
| Community Growth | Contributor onboarding, public API docs |

---

## 13. Known Issues

### 13.1 Prisma Client Generation Blocker (Critical)

The Prisma client cannot currently be generated due to `binaries.prisma.sh` being network-blocked, resulting in 76 TypeScript errors across the codebase. This must be resolved before any development work can proceed.

**Workarounds:**
1. Manually download the Prisma engine binaries and set `PRISMA_ENGINES_MIRROR` env var
2. Use a network environment where `binaries.prisma.sh` is accessible
3. Consider switching to a local Prisma engines cache

### 13.2 Schema Sync Required

The Prisma schema in the codebase may not include all fields documented in this PRD (e.g., `commentCount` on Clip, `RelationType` enum, renamed AnimatorRelation fields from `mentorId/studentId` to `sourceId/targetId`). After resolving the Prisma blocker, run a schema diff and apply migrations.

### 13.3 Uninstalled Dependencies

Several tech stack items referenced in this PRD are not yet in `package.json` and should be installed when their respective phases begin: Inngest (Phase 2), Sentry (Phase 2), Plausible (Phase 2), next-intl (Phase 3), React Native (Phase 3).

---

*Document maintained by Product Team. Last updated: February 7, 2026.*
