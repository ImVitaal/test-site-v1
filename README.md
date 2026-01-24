# Product Requirements Document: Sakuga Legends

**Version:** 4.0
**Status:** Approved for Development
**Date:** January 24, 2026
**Author:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Market Analysis](#2-problem-statement--market-analysis)
3. [Target Audience & User Personas](#3-target-audience--user-personas)
4. [User Stories & Acceptance Criteria](#4-user-stories--acceptance-criteria)
5. [Core Functional Features](#5-core-functional-features)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Visual Design & UX](#7-visual-design--ux)
8. [Technical Architecture](#8-technical-architecture)
9. [API Specification](#9-api-specification)
10. [Content Moderation & Community Guidelines](#10-content-moderation--community-guidelines)
11. [Monetization Strategy](#11-monetization-strategy)
12. [Risk Analysis & Mitigation](#12-risk-analysis--mitigation)
13. [Development Roadmap](#13-development-roadmap)
14. [Success Metrics & KPIs](#14-success-metrics--kpis)
15. [Appendix](#15-appendix)

---

## 1. Executive Summary

**Sakuga Legends** is a web platform dedicated to celebrating and cataloging the most talented key animators in the anime industry. Unlike general anime databases (MyAnimeList, AniList), this platform focuses specifically on the **animator as the primary entity**, serving as an authoritative resource for discovering style, lineage, and technique.

The platform combines a high-fidelity video archive with "art gallery" aesthetics to treat animators with the prestige they deserve.

### Vision Statement

> "To become the definitive global resource for animation craft appreciation, where every frame tells a story and every artist receives recognition."

### Key Differentiators

| Feature | Sakuga Legends | Sakugabooru | MAL/AniList |
|---------|----------------|-------------|-------------|
| Primary Focus | Animators | Clips | Anime Series |
| Career Tracking | Full Timeline | None | None |
| Mentor/Student Mapping | Yes | No | No |
| Educational Content | Technique Glossary | Tags Only | None |
| Video Quality | Adaptive 1080p | Variable | N/A |
| Verification System | Source-backed | Community Tags | N/A |

---

## 2. Problem Statement & Market Analysis

### Problem Statement

Currently, information about key animators is **fragmented** across social media, image boards (Sakugabooru), and scattered wikis. Fans struggle to:

- Track career progressions across studios and decades
- Understand distinct animation styles and techniques
- Find verified attribution for specific scenes
- Discover new animators based on stylistic preferences

There is **no centralized, well-designed resource** that treats animators as artists deserving of dedicated profiles and scholarly attention.

### Market Analysis

#### Market Size
- Global anime market: $31.23B (2023), projected $62.7B by 2032
- Anime streaming subscribers: 300M+ globally
- Sakugabooru monthly visitors: ~500K
- Animation YouTube essays: 10M+ views on top videos

#### Competitive Landscape

| Competitor | Strengths | Weaknesses |
|------------|-----------|------------|
| **Sakugabooru** | Large clip database, active community | Poor UX, no animator profiles, no verification |
| **AniDB** | Comprehensive credits | Outdated UI, no video content |
| **Wikipedia** | Authority | Limited animator coverage, no media |
| **Twitter/X** | Real-time, community-driven | Ephemeral, no organization |

#### Opportunity
A 2024 survey of 2,000 anime fans found:
- 78% want to learn more about animators
- 65% have difficulty finding animator information
- 82% would use a dedicated platform

---

## 3. Target Audience & User Personas

### Primary Personas

#### Persona 1: The Sakuga Enthusiast ("Maya")
- **Demographics:** 22, college student, USA
- **Behavior:** Watches anime 15+ hrs/week, active on anime Twitter
- **Goals:** Discover new animators, build appreciation for craft
- **Pain Points:** Can't find who animated favorite scenes
- **Journey:** "I just saw an incredible fight scene. Who animated it?"

#### Persona 2: The Industry Professional ("Takeshi")
- **Demographics:** 35, animation director, Japan
- **Behavior:** Uses references for work, networks with peers
- **Goals:** Research talent, find visual references
- **Pain Points:** No organized reference library for styles
- **Journey:** "I need examples of 'liquid' character acting for my team."

#### Persona 3: The Animation Student ("Alex")
- **Demographics:** 19, art school student, France
- **Behavior:** Studies frame-by-frame, practices daily
- **Goals:** Learn techniques, understand timing/spacing
- **Pain Points:** Hard to study clips systematically
- **Journey:** "I want to analyze the spacing in this run cycle frame-by-frame."

#### Persona 4: The Content Creator ("Sarah")
- **Demographics:** 28, YouTube essayist, UK
- **Behavior:** Creates analysis videos, needs accurate info
- **Goals:** Verify attribution, find high-quality clips
- **Pain Points:** Misattribution is rampant
- **Journey:** "I need to confirm if Yutaka Nakamura animated this cut before I publish."

### Secondary Personas
- **Casual Fans:** Browse trending content, share clips
- **Researchers/Academics:** Study animation history
- **Studio Recruiters:** Scout talent

---

## 4. User Stories & Acceptance Criteria

### Epic 1: Animator Discovery

#### US-1.1: Browse Animator Profiles
> As an animation enthusiast, I want to browse animator profiles so that I can discover new artists.

**Acceptance Criteria:**
- [ ] Profile displays name (English + native script)
- [ ] Biography section with career summary
- [ ] Visual timeline of works (min 5 entries)
- [ ] Profile photo or representative artwork
- [ ] Social media links (Twitter, Pixiv, etc.)
- [ ] Page loads in < 2 seconds

#### US-1.2: View Animator's Signature Works
> As a fan, I want to see an animator's best work so that I can appreciate their style.

**Acceptance Criteria:**
- [ ] Curated "Signature Reel" of top 5-10 clips
- [ ] Clips playable inline without navigation
- [ ] Each clip shows anime source and year
- [ ] Auto-advances to next clip (toggleable)

#### US-1.3: Explore Mentor/Student Relationships
> As a student, I want to see who taught whom so that I can trace stylistic lineage.

**Acceptance Criteria:**
- [ ] Interactive graph visualization
- [ ] Click node to navigate to animator profile
- [ ] Relationship type labeled (Mentor, Colleague, Student)
- [ ] Graph is zoomable and pannable

### Epic 2: Clip Database

#### US-2.1: Search for Clips
> As a user, I want to search clips by technique, animator, or anime so that I can find specific content.

**Acceptance Criteria:**
- [ ] Search supports: animator name, anime title, technique tag
- [ ] Typo-tolerant (Meilisearch)
- [ ] Results return in < 200ms
- [ ] Filters: year range, studio, verification status
- [ ] Sort by: relevance, date added, popularity

#### US-2.2: Frame-by-Frame Playback
> As a student, I want to step through clips frame-by-frame so that I can study timing.

**Acceptance Criteria:**
- [ ] Keyboard shortcuts: `,` (back) and `.` (forward)
- [ ] Frame counter displayed (e.g., "Frame 12/48")
- [ ] Playback speeds: 0.25x, 0.5x, 1x, 1.5x, 2x
- [ ] Loop region selection (A-B loop)
- [ ] Works on mobile with touch gestures

#### US-2.3: View Clip Attribution
> As a researcher, I want to see verified attribution so that I can trust the data.

**Acceptance Criteria:**
- [ ] Shows: Key Animator, Animation Director, Source anime
- [ ] Verification badge (Verified/Speculative)
- [ ] If verified, source link (credits, artbook, interview)
- [ ] "Suggest Edit" button for corrections

### Epic 3: User Contributions

#### US-3.1: Submit New Clips
> As a contributor, I want to upload clips so that I can expand the database.

**Acceptance Criteria:**
- [ ] Upload accepts: MP4, WebM (max 45 seconds, 100MB)
- [ ] Required fields: anime source, suspected animator
- [ ] Optional: technique tags, timestamp in episode
- [ ] Mandatory "Technique Description" for Fair Use compliance
- [ ] Submission enters moderation queue

#### US-3.2: Create Collections
> As a user, I want to organize clips into collections so that I can curate content.

**Acceptance Criteria:**
- [ ] Create named collection with description
- [ ] Add/remove clips from any clip page
- [ ] Collections can be public or private
- [ ] Shareable URL for public collections

### Epic 4: Education

#### US-4.1: Browse Technique Glossary
> As a beginner, I want to learn animation terminology so that I can understand discussions.

**Acceptance Criteria:**
- [ ] Alphabetical index of terms
- [ ] Each term has: definition, video example, related terms
- [ ] Terms linkable (e.g., `/glossary/smear`)
- [ ] Search within glossary

---

## 5. Core Functional Features

### 5.1 Animator Profile System

| Component | Description | Priority |
|-----------|-------------|----------|
| **Header** | Name, photo, quick stats (works count, active years) | P0 |
| **Biography** | Rich text with career narrative | P0 |
| **Career Timeline** | Visual horizontal timeline of notable works | P0 |
| **Influence Graph** | Interactive mentor/student visualization | P1 |
| **Signature Reel** | Auto-playing carousel of top clips | P0 |
| **Full Filmography** | Paginated table of all attributed works | P1 |
| **External Links** | Twitter, Wikipedia, Pixiv, personal site | P1 |

### 5.2 Sakuga Clip Database

| Component | Description | Priority |
|-----------|-------------|----------|
| **Video Player** | Custom player with frame controls | P0 |
| **Metadata Panel** | Attribution, tags, verification status | P0 |
| **Related Clips** | Same animator, same anime, similar style | P1 |
| **Download Options** | GIF export (watermarked), screenshot | P2 |
| **Embed Code** | Iframe for external sites | P2 |

### 5.3 Discovery & Exploration

| Feature | Description | Priority |
|---------|-------------|----------|
| **Global Search** | Unified search across animators, clips, anime | P0 |
| **Style Similarity** | ML-powered "If you like X, try Y" | P2 |
| **Studio Family Trees** | Interactive studio lineage (Gainax → Trigger) | P1 |
| **Rankings** | Top 100 lists (editorial + community-voted) | P1 |
| **Trending** | Popular clips this week | P1 |
| **Rising Stars** | Algorithm-surfaced new talent | P2 |

### 5.4 Educational Resources

| Feature | Description | Priority |
|---------|-------------|----------|
| **Technique Glossary** | 100+ terms with video examples | P1 |
| **Frame Breakdowns** | Editorial analysis articles | P2 |
| **Learning Paths** | Structured courses (e.g., "Understanding Timing") | P3 |

### 5.5 Social Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Favorites** | Save clips and animators | P0 |
| **Collections** | User-curated playlists | P1 |
| **Comments** | Discussion on clips (moderated) | P2 |
| **Sharing** | Twitter/Discord/Reddit share buttons | P1 |
| **Follow Animators** | Get notified of new attributed clips | P2 |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Lighthouse |
| **Time to First Byte (TTFB)** | < 600ms | WebPageTest |
| **Search Response Time** | < 200ms | p95 server logs |
| **Video Start Time** | < 1s | Custom analytics |

### 6.2 Scalability

| Dimension | Initial | 1-Year Target |
|-----------|---------|---------------|
| **Concurrent Users** | 500 | 10,000 |
| **Database Size** | 10GB | 500GB |
| **Video Storage** | 500GB | 20TB |
| **API Requests/day** | 100K | 10M |

**Architecture Approach:**
- Horizontal scaling via Vercel serverless
- Database read replicas for query distribution
- CDN edge caching for static assets and video
- Queue-based processing for uploads

### 6.3 Security

| Requirement | Implementation |
|-------------|----------------|
| **Authentication** | NextAuth.js with OAuth (Google, Discord, Twitter) |
| **Authorization** | Role-based (User, Contributor, Moderator, Admin) |
| **Data Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **Input Validation** | Zod schemas on all API endpoints |
| **Rate Limiting** | 100 req/min anonymous, 1000 req/min authenticated |
| **CSRF Protection** | SameSite cookies + CSRF tokens |
| **Content Security Policy** | Strict CSP headers |

### 6.4 Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | Full site navigable via keyboard |
| **Screen Readers** | Semantic HTML, ARIA labels |
| **Color Contrast** | Min 4.5:1 ratio for text |
| **Focus Indicators** | Visible focus rings |
| **Video Captions** | Support for subtitles/descriptions |
| **Reduced Motion** | Respect `prefers-reduced-motion` |

### 6.5 Internationalization (i18n)

| Priority | Languages |
|----------|-----------|
| **Phase 1** | English, Japanese |
| **Phase 2** | Chinese (Simplified), Korean |
| **Phase 3** | Spanish, French, Portuguese |

**Implementation:**
- next-intl for string management
- Native name fields for all entities
- RTL support architecture (for future Arabic)
- Date/number formatting per locale

### 6.6 SEO Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Server-Side Rendering** | Next.js App Router with SSR |
| **Meta Tags** | Dynamic title, description, OG images |
| **Structured Data** | JSON-LD for Person (animators), VideoObject (clips) |
| **Sitemap** | Auto-generated, submitted to Google |
| **Canonical URLs** | Prevent duplicate content |
| **Page Speed** | Core Web Vitals optimization |

### 6.7 Mobile & PWA

| Requirement | Implementation |
|-------------|----------------|
| **Responsive Design** | Mobile-first, breakpoints at 640/768/1024/1280px |
| **Touch Gestures** | Swipe for frame-step, pinch-zoom on graphs |
| **Offline Support** | Service worker caches glossary, recent views |
| **Install Prompt** | PWA manifest for home screen install |
| **Push Notifications** | Optional alerts for followed animators |

---

## 7. Visual Design & UX

### 7.1 Design Philosophy

> "Cinematic, Gallery-Like, Respectful"

The platform should feel like visiting an art museum, not a database. Animation is art, and the UI should reflect that prestige.

### 7.2 Color System

```
Primary Palette (Dark Mode Default):
├── Background:     #0D0D14 (Deep Space)
├── Surface:        #161622 (Elevated)
├── Surface Hover:  #1E1E2E (Interactive)
├── Border:         #2A2A3C (Subtle)
├── Text Primary:   #F4F4F5 (High Contrast)
├── Text Secondary: #A1A1AA (Muted)
├── Accent:         #8B5CF6 (Violet)
├── Accent Hover:   #A78BFA (Violet Light)
└── Success/Error:  #22C55E / #EF4444

Light Mode (Toggle Available):
├── Background:     #FAFAFA
├── Surface:        #FFFFFF
├── Text Primary:   #18181B
└── Accent:         #7C3AED
```

### 7.3 Typography

| Use Case | Font | Weight | Size |
|----------|------|--------|------|
| **Display Headers** | Playfair Display | 700 | 48-72px |
| **Section Headers** | DM Sans | 600 | 24-32px |
| **Body Text** | DM Sans | 400 | 16px |
| **Captions/Labels** | DM Sans | 500 | 12-14px |
| **Code/Data** | JetBrains Mono | 400 | 14px |

### 7.4 Layout Principles

- **Magazine-style grids:** Asymmetric, editorial feel
- **Full-bleed imagery:** Hero sections use edge-to-edge visuals
- **Generous whitespace:** Min 24px between sections
- **Card-based content:** Consistent elevation and radius (12px)
- **Sticky navigation:** Header + sidebar remain accessible

### 7.5 Motion Design

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| **Page Transitions** | Fade + slight slide | 300ms | ease-out |
| **Card Hover** | Subtle lift + shadow | 200ms | ease-in-out |
| **Modal Open** | Scale from 95% + fade | 250ms | spring |
| **Loading States** | Skeleton shimmer | Infinite | linear |
| **Graph Interactions** | Smooth pan/zoom | 150ms | ease-out |

**Accessibility:** All animations respect `prefers-reduced-motion`.

### 7.6 Key Page Wireframes

#### Homepage
```
┌─────────────────────────────────────────────────┐
│  [Logo]              [Search]        [Sign In]  │
├─────────────────────────────────────────────────┤
│                                                 │
│   ╔═══════════════════════════════════════╗    │
│   ║  FEATURED ANIMATOR OF THE WEEK        ║    │
│   ║  [Full-width hero with video bg]      ║    │
│   ╚═══════════════════════════════════════╝    │
│                                                 │
│   TRENDING CLIPS                                │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│   │     │ │     │ │     │ │     │ │     │     │
│   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
│                                                 │
│   RISING STARS          │  RECENT ADDITIONS    │
│   ┌───────────────┐     │  ┌───────────────┐   │
│   │               │     │  │               │   │
│   └───────────────┘     │  └───────────────┘   │
└─────────────────────────────────────────────────┘
```

#### Animator Profile
```
┌─────────────────────────────────────────────────┐
│  [← Back]    [Search]              [Sign In]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────┐  YUTAKA NAKAMURA  中村 豊           │
│  │ Photo  │  Key Animator · Active 1990-Present │
│  └────────┘  [Twitter] [Pixiv]                  │
│                                                 │
│  ════════════════════════════════════════════   │
│  │1990    │1995    │2000    │2005    │2010 │   │
│  ════════════════════════════════════════════   │
│  [Career Timeline with clickable nodes]         │
│                                                 │
│  SIGNATURE WORKS                                │
│  ╔═══════════════════════════════════════════╗  │
│  ║  [Video Player - Auto-playing Reel]       ║  │
│  ╚═══════════════════════════════════════════╝  │
│                                                 │
│  BIOGRAPHY                                      │
│  Lorem ipsum dolor sit amet...                  │
│                                                 │
│  INFLUENCE MAP         │  ALL WORKS (247)       │
│  ┌──────────────────┐  │  ┌──────────────────┐  │
│  │  [Graph Visual]  │  │  │  [Paginated Table]│  │
│  └──────────────────┘  │  └──────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 8. Technical Architecture

### 8.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
│    [Web Browser]    [Mobile PWA]    [Embed Iframe]             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EDGE LAYER (Cloudflare)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    CDN      │  │     WAF     │  │ DDoS Protect│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER (Vercel)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Next.js 14 (App Router)                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │  │
│  │  │   Pages    │  │ API Routes │  │  Server    │          │  │
│  │  │   (SSR)    │  │ (REST/tRPC)│  │  Actions   │          │  │
│  │  └────────────┘  └────────────┘  └────────────┘          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────────┐
│    PostgreSQL     │ │  Meilisearch  │ │   Cloudflare R2/Stream│
│    (Neon/Supabase)│ │   (Search)    │ │   (Media Storage)     │
│                   │ │               │ │                       │
│ - Animators       │ │ - Animators   │ │ - Video clips (HLS)   │
│ - Clips           │ │ - Clips       │ │ - Thumbnails          │
│ - Users           │ │ - Anime       │ │ - Profile images      │
│ - Attributions    │ │ - Tags        │ │                       │
└───────────────────┘ └───────────────┘ └───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS (Inngest)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Video    │  │   Search   │  │Notification│                │
│  │ Processing │  │   Indexing │  │   Sending  │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ (App Router) | SSR, API routes, excellent DX |
| **Language** | TypeScript | Type safety, better tooling |
| **Styling** | Tailwind CSS + CSS Modules | Utility-first, scoped styles |
| **Animation** | Framer Motion | Declarative, performant |
| **State** | Zustand + React Query | Simple global + server state |
| **Database** | PostgreSQL (Neon) | Relational integrity, JSON support |
| **ORM** | Prisma | Type-safe queries, migrations |
| **Search** | Meilisearch | Typo-tolerant, fast, self-hostable |
| **Auth** | NextAuth.js v5 | OAuth providers, session management |
| **Media Storage** | Cloudflare R2 | S3-compatible, no egress fees |
| **Video Delivery** | Cloudflare Stream | Adaptive bitrate, global CDN |
| **Hosting** | Vercel | Edge functions, preview deploys |
| **Background Jobs** | Inngest | Event-driven, retries, observability |
| **Analytics** | Plausible | Privacy-focused, lightweight |
| **Error Tracking** | Sentry | Real-time errors, performance |

### 8.3 Data Schema (Complete Prisma)

```prisma
// ============================================
// ENUMS
// ============================================

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
  VERIFIED      // Confirmed via credits/books
  SPECULATIVE   // Community attribution
  DISPUTED      // Conflicting claims
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
}

// ============================================
// CORE ENTITIES
// ============================================

model Animator {
  id            String    @id @default(cuid())
  slug          String    @unique // URL-friendly identifier
  name          String    // English name
  nativeName    String?   // Japanese/native script
  bio           String?   @db.Text
  birthDate     DateTime?
  deathDate     DateTime?
  photoUrl      String?
  twitterHandle String?
  pixivId       String?
  websiteUrl    String?

  // Relationships
  attributions  Attribution[]
  mentors       AnimatorRelation[] @relation("StudentRelation")
  students      AnimatorRelation[] @relation("MentorRelation")
  studioHistory StudioHistory[]
  favorites     Favorite[]

  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String?   // User ID

  @@index([name])
  @@index([slug])
}

model AnimatorRelation {
  id          String   @id @default(cuid())
  mentorId    String
  studentId   String
  relationType String  @default("mentor") // mentor, colleague, influenced_by
  startYear   Int?
  endYear     Int?

  mentor      Animator @relation("MentorRelation", fields: [mentorId], references: [id], onDelete: Cascade)
  student     Animator @relation("StudentRelation", fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([mentorId, studentId])
}

model Studio {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  nativeName  String?
  founded     Int?
  dissolved   Int?
  parentId    String?  // For studio family trees
  logoUrl     String?

  parent      Studio?  @relation("StudioFamily", fields: [parentId], references: [id])
  children    Studio[] @relation("StudioFamily")
  clips       Clip[]
  history     StudioHistory[]

  @@index([name])
}

model StudioHistory {
  id          String   @id @default(cuid())
  animatorId  String
  studioId    String
  startYear   Int
  endYear     Int?
  position    String?  // e.g., "Staff Animator", "Freelance"

  animator    Animator @relation(fields: [animatorId], references: [id], onDelete: Cascade)
  studio      Studio   @relation(fields: [studioId], references: [id], onDelete: Cascade)

  @@unique([animatorId, studioId, startYear])
}

// ============================================
// CLIP SYSTEM
// ============================================

model Clip {
  id                String   @id @default(cuid())
  slug              String   @unique
  title             String   // Descriptive title
  videoUrl          String   // Cloudflare Stream ID
  thumbnailUrl      String?
  duration          Int      // Seconds (max 45)

  // Source information
  animeId           String
  anime             Anime    @relation(fields: [animeId], references: [id])
  episodeNumber     Int?
  timestampStart    String?  // e.g., "12:34"

  // Fair Use compliance
  techniqueDescription String @db.Text // Required for uploads

  // Relationships
  attributions      Attribution[]
  tags              ClipTag[]
  collections       CollectionClip[]
  favorites         Favorite[]
  comments          Comment[]

  // Engagement
  viewCount         Int      @default(0)
  favoriteCount     Int      @default(0)

  // Moderation
  studioId          String?
  studio            Studio?  @relation(fields: [studioId], references: [id])
  submittedBy       String?  // User ID
  submissionStatus  SubmissionStatus @default(PENDING)
  moderatedBy       String?
  moderatedAt       DateTime?

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([animeId])
  @@index([submissionStatus])
}

model Anime {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String   // English title
  nativeTitle   String?  // Japanese title
  romajiTitle   String?  // Romanized
  year          Int
  season        String?  // spring, summer, fall, winter
  coverUrl      String?
  malId         Int?     // MyAnimeList ID for linking

  clips         Clip[]

  @@index([title])
  @@index([year])
}

model Attribution {
  id              String   @id @default(cuid())
  animatorId      String
  clipId          String
  role            Role     @default(KEY_ANIMATION)

  // Verification
  verificationStatus VerificationStatus @default(SPECULATIVE)
  sourceUrl       String?  // Link to credits/proof
  sourceNote      String?  // e.g., "Staff credits at 23:45"
  verifiedBy      String?  // Moderator user ID
  verifiedAt      DateTime?

  animator        Animator @relation(fields: [animatorId], references: [id], onDelete: Cascade)
  clip            Clip     @relation(fields: [clipId], references: [id], onDelete: Cascade)

  @@unique([animatorId, clipId, role])
  @@index([verificationStatus])
}

// ============================================
// TAGGING SYSTEM
// ============================================

model Tag {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String   // e.g., "Smear"
  category    String   // technique, style, content
  description String?  @db.Text
  exampleClipId String? // Featured example

  clips       ClipTag[]

  @@index([category])
}

model ClipTag {
  clipId      String
  tagId       String

  clip        Clip @relation(fields: [clipId], references: [id], onDelete: Cascade)
  tag         Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([clipId, tagId])
}

// ============================================
// USER SYSTEM
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          UserRole  @default(USER)

  // Trust system
  trustScore    Int       @default(0)
  contributionCount Int   @default(0)

  // Relationships
  favorites     Favorite[]
  collections   Collection[]
  comments      Comment[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Favorite {
  id          String   @id @default(cuid())
  userId      String
  animatorId  String?
  clipId      String?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  animator    Animator? @relation(fields: [animatorId], references: [id], onDelete: Cascade)
  clip        Clip?    @relation(fields: [clipId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@unique([userId, animatorId])
  @@unique([userId, clipId])
}

model Collection {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  isPublic    Boolean  @default(true)
  slug        String   @unique

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  clips       CollectionClip[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CollectionClip {
  collectionId String
  clipId       String
  order        Int      @default(0)

  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  clip         Clip       @relation(fields: [clipId], references: [id], onDelete: Cascade)

  @@id([collectionId, clipId])
}

model Comment {
  id          String   @id @default(cuid())
  userId      String
  clipId      String
  content     String   @db.Text

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  clip        Clip     @relation(fields: [clipId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([clipId])
}

// ============================================
// EDUCATIONAL CONTENT
// ============================================

model GlossaryTerm {
  id          String   @id @default(cuid())
  slug        String   @unique
  term        String   // e.g., "Itano Circus"
  definition  String   @db.Text
  exampleClipId String?
  relatedTerms String[] // Array of slugs

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([term])
}
```

### 8.4 Performance Optimization Strategy

| Area | Strategy |
|------|----------|
| **SSR/SSG** | Static generation for animator profiles; ISR with 1-hour revalidation |
| **Images** | Next.js Image with automatic WebP/AVIF, lazy loading |
| **Video** | Lazy load player; preload on hover; adaptive bitrate |
| **Database** | Connection pooling (PgBouncer); indexed queries; pagination |
| **Caching** | Cloudflare edge cache; Redis for session/rate limiting |
| **Bundle** | Dynamic imports; route-based code splitting |
| **Fonts** | `next/font` with subset; swap display |

---

## 9. API Specification

### 9.1 REST API Endpoints

#### Animators

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/animators` | List animators (paginated) |
| GET | `/api/animators/:slug` | Get animator by slug |
| GET | `/api/animators/:slug/clips` | Get animator's clips |
| GET | `/api/animators/:slug/timeline` | Get career timeline |
| GET | `/api/animators/:slug/relations` | Get mentor/student graph |
| POST | `/api/animators` | Create animator (Mod+) |
| PATCH | `/api/animators/:slug` | Update animator (Mod+) |

#### Clips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clips` | List clips (paginated, filterable) |
| GET | `/api/clips/:slug` | Get clip by slug |
| GET | `/api/clips/:slug/related` | Get related clips |
| POST | `/api/clips` | Submit new clip (Auth) |
| PATCH | `/api/clips/:slug` | Update clip metadata (Mod+) |
| POST | `/api/clips/:slug/favorite` | Toggle favorite (Auth) |

#### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Unified search (q, type, filters) |
| GET | `/api/search/suggest` | Autocomplete suggestions |

#### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| GET | `/api/user/favorites` | Get user's favorites |
| GET | `/api/user/collections` | Get user's collections |
| POST | `/api/user/collections` | Create collection |

### 9.2 Example Response

```json
// GET /api/animators/yutaka-nakamura
{
  "id": "clx123abc",
  "slug": "yutaka-nakamura",
  "name": "Yutaka Nakamura",
  "nativeName": "中村 豊",
  "bio": "Renowned action animator known for...",
  "photoUrl": "https://cdn.sakugalegends.com/animators/nakamura.jpg",
  "twitterHandle": "nakamura_yutaka",
  "stats": {
    "totalClips": 247,
    "verifiedClips": 189,
    "activeYears": "1990-present",
    "favoriteCount": 12453
  },
  "signatureClips": [
    {
      "id": "clx456def",
      "slug": "sword-of-the-stranger-final-fight",
      "title": "Sword of the Stranger - Final Fight",
      "thumbnailUrl": "https://cdn.sakugalegends.com/thumbs/456.jpg",
      "duration": 42
    }
  ],
  "links": {
    "self": "/api/animators/yutaka-nakamura",
    "clips": "/api/animators/yutaka-nakamura/clips",
    "timeline": "/api/animators/yutaka-nakamura/timeline"
  }
}
```

### 9.3 Error Response Format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Animator not found",
    "details": {
      "slug": "unknown-animator"
    }
  }
}
```

### 9.4 Rate Limits

| Tier | Limit | Window |
|------|-------|--------|
| Anonymous | 100 requests | 1 minute |
| Authenticated | 1,000 requests | 1 minute |
| Contributor | 2,000 requests | 1 minute |
| API Key (future) | 10,000 requests | 1 minute |

---

## 10. Content Moderation & Community Guidelines

### 10.1 Content Policies

#### Allowed Content
- Animation clips from commercially released anime
- Clips with clear educational/analytical purpose
- Properly attributed content

#### Prohibited Content
- Full episodes or movies
- Clips exceeding 45 seconds
- Content from unreleased/leaked material
- Non-anime content (live-action, Western animation)
- Explicit sexual content (hentai)
- Content promoting hate or violence

### 10.2 Moderation Workflow

```
User Upload
    │
    ▼
┌─────────────────┐
│ Automated Check │
│ - Duration ≤45s │
│ - File size OK  │
│ - Duplicate?    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   PASS      FAIL → Auto-reject with reason
    │
    ▼
┌─────────────────┐
│ Moderation Queue│
│ (Human Review)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
 APPROVE    REJECT → Notify user with reason
    │
    ▼
Published + Indexed
```

### 10.3 Trust & Reputation System

| Level | Trust Score | Capabilities |
|-------|-------------|--------------|
| **New User** | 0-10 | View, favorite, create collections |
| **Contributor** | 11-50 | Submit clips (requires moderation) |
| **Trusted** | 51-200 | Submit clips (auto-approve), edit tags |
| **Expert** | 201-500 | Override attribution (flagged for review) |
| **Moderator** | Staff | Full moderation powers |

**Earning Trust:**
- Approved clip submission: +5
- Verified attribution accepted: +10
- Correction accepted: +3
- Reported content removed: +2

**Losing Trust:**
- Submission rejected: -2
- False/spam report: -5
- Community guideline violation: -20 to -100

### 10.4 DMCA Compliance

1. **Designated Agent:** Registered with U.S. Copyright Office
2. **Takedown Form:** `/dmca` with required fields
3. **Response Time:** < 24 hours (target < 12 hours)
4. **Counter-Notice:** Process for disputing claims
5. **Repeat Infringer Policy:** Account termination after 3 strikes

---

## 11. Monetization Strategy

### 11.1 Revenue Streams

| Stream | Timeline | Description |
|--------|----------|-------------|
| **Freemium** | Phase 2 | Premium features for subscribers |
| **Merchandise** | Phase 3 | Licensed animator prints, apparel |
| **API Access** | Phase 4 | Paid tier for commercial use |
| **Sponsorships** | Phase 2+ | Studio/event partnerships |

### 11.2 Freemium Model

#### Free Tier
- Browse all content
- 720p video quality
- Basic search
- 3 collections max
- Ads on clip pages

#### Premium ($5/month or $48/year)
- 1080p video quality
- Advanced search filters
- Unlimited collections
- Ad-free experience
- Early access to features
- Download clips (watermarked)
- Discord role

### 11.3 Ethical Considerations

- **Never paywall educational content** (glossary, breakdowns)
- **Animator profiles always free**
- Consider **revenue sharing** with animators in future (complex legally)
- Transparent about data usage

---

## 12. Risk Analysis & Mitigation

### 12.1 Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Copyright Claims** | High | High | 45s limit, educational framing, DMCA process |
| **Misattribution** | High | Medium | Verification system, trust levels |
| **Bandwidth Costs** | Medium | High | Tiered quality, aggressive caching |
| **Data Loss** | Low | Critical | Daily backups, multi-region storage |
| **DDoS Attack** | Medium | Medium | Cloudflare protection, rate limiting |
| **Community Toxicity** | Medium | Medium | Moderation tools, reporting system |
| **Key Person Risk** | Medium | Medium | Documentation, knowledge sharing |

### 12.2 Copyright Strategy Deep Dive

**Fair Use Argument (U.S.):**
1. **Purpose:** Educational/critical (technique analysis)
2. **Nature:** Published creative works
3. **Amount:** <45s clips (small portion)
4. **Market Effect:** Arguably promotional

**Compliance Measures:**
- Every clip requires "Technique Description" field
- No full scenes - only isolated cuts
- No download of original quality
- DMCA agent registered
- Proactive takedown of full episodes

### 12.3 Contingency Plans

| Scenario | Response |
|----------|----------|
| Major studio sends mass takedowns | Comply immediately; pivot to image-only for that studio |
| Database corrupted | Restore from point-in-time backup; max 1-hour data loss |
| Cloudflare Stream pricing increases | Evaluate Bunny Stream or self-hosted HLS |
| Key animator objects to profile | Add opt-out mechanism; remove on request |

---

## 13. Development Roadmap

### Phase 1: Foundation (Months 1-3)

**Goal:** Launchable MVP with core functionality

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 1-2 | Infrastructure | Next.js setup, Prisma schema, Auth, CI/CD |
| 3-4 | Animator System | Profile pages, timeline, basic CRUD |
| 5-6 | Clip System | Upload, player, attribution, moderation queue |

**Exit Criteria:**
- [ ] 100 animator profiles seeded
- [ ] 5,000 clips uploaded and attributed
- [ ] Video player with frame-stepping
- [ ] Basic search (Meilisearch)
- [ ] Moderation queue functional

### Phase 2: Discovery (Months 4-6)

**Goal:** Make content discoverable and engaging

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 7-8 | Search & Filters | Advanced search, filters, autocomplete |
| 9-10 | Rankings & Trending | Editorial lists, algorithmic trending |
| 11-12 | Career Timeline | Interactive timeline visualization |

**Exit Criteria:**
- [ ] Search <200ms p95
- [ ] Trending algorithm live
- [ ] "Rising Stars" feature
- [ ] Studio family tree visualization

### Phase 3: Community (Months 7-9)

**Goal:** Enable user contributions and engagement

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 13-14 | User Profiles | Dashboard, favorites, contribution history |
| 15-16 | Collections | Create, share, embed collections |
| 17-18 | Social | Comments, sharing, notifications |

**Exit Criteria:**
- [ ] User upload flow complete
- [ ] Trust/reputation system
- [ ] Collections shareable
- [ ] Comment system with moderation

### Phase 4: Education & Scale (Months 10-12)

**Goal:** Become the definitive educational resource

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 19-20 | Glossary | 100+ terms with examples |
| 21-22 | Learning Paths | Structured courses |
| 23-24 | API & Scale | Public API, performance optimization |

**Exit Criteria:**
- [ ] Technique glossary with 100 terms
- [ ] 3 learning paths published
- [ ] Public API with documentation
- [ ] 50K MAU capacity tested

---

## 14. Success Metrics & KPIs

### 14.1 North Star Metric

> **Monthly Active Contributors (users who submit or verify content)**

### 14.2 Key Performance Indicators

| Category | Metric | 3-Month | 6-Month | 12-Month |
|----------|--------|---------|---------|----------|
| **Growth** | MAU | 2,500 | 10,000 | 50,000 |
| **Growth** | Registered Users | 500 | 3,000 | 20,000 |
| **Content** | Total Clips | 5,000 | 10,000 | 25,000 |
| **Content** | Verified Attributions | 60% | 70% | 80% |
| **Engagement** | Avg. Session Duration | 3 min | 4 min | 6 min |
| **Engagement** | Pages per Session | 4 | 6 | 8 |
| **Community** | Monthly Contributors | 20 | 100 | 500 |
| **Quality** | DMCA Response Time | <48h | <24h | <12h |
| **Quality** | Uptime | 99% | 99.5% | 99.9% |
| **Technical** | LCP | <3s | <2.5s | <2s |

### 14.3 Analytics Implementation

**Tools:**
- **Plausible:** Page views, referrers, geography (privacy-focused)
- **Custom Events:** Clip plays, searches, favorites (PostHog)
- **Error Tracking:** Sentry for frontend/backend errors

**Key Events to Track:**
- `clip_played` - With animator, anime, duration watched
- `search_performed` - Query, filters, results count
- `animator_viewed` - Which profiles are popular
- `clip_submitted` - Funnel: start → complete → approved
- `collection_created` - Engagement depth

---

## 15. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Sakuga** | Japanese term for "animation"; in fan context, refers to high-quality animation sequences |
| **Key Animation** | The primary drawings that define movement; created by key animators |
| **In-between** | Frames drawn between key frames to create smooth motion |
| **Cut** | A single continuous shot in animation production |
| **Smear** | Distorted frame used to convey fast motion |
| **Impact Frame** | High-contrast frame (often white/black) emphasizing hits |

### B. Competitive Feature Matrix

| Feature | Sakuga Legends | Sakugabooru | AniDB | MAL |
|---------|----------------|-------------|-------|-----|
| Animator Profiles | ★★★ | ☆ | ★★ | ☆ |
| Video Clips | ★★★ | ★★★ | ☆ | ☆ |
| Frame-by-Frame | ★★★ | ★ | ☆ | ☆ |
| Search Quality | ★★★ | ★ | ★★ | ★★ |
| Mobile Experience | ★★★ | ★ | ★ | ★★ |
| Verification | ★★★ | ★ | ★★ | ★★ |
| Educational Content | ★★★ | ☆ | ☆ | ☆ |

### C. Reference Links

- [Sakugabooru](https://sakugabooru.com) - Existing clip database
- [AniDB](https://anidb.net) - Comprehensive anime database
- [Sakuga Wiki](https://sakuga.fandom.com) - Community wiki
- [Animation Obsessive](https://animationobsessive.substack.com) - Newsletter (tone reference)

### D. Open Questions

1. **Animator consent:** Should we have opt-out for living animators?
2. **Revenue sharing:** Is it feasible to share premium revenue with animators?
3. **Fan translations:** How to handle multiple language bios?
4. **AI attribution:** Can we build auto-attribution from style analysis?

---

*Document maintained by Product Team. Last updated: January 24, 2026.*
