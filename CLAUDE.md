# CLAUDE.md — Sakuga Legends

## Project Overview

Sakuga Legends is a Next.js 14 web platform celebrating anime key animators. It includes a clip database, frame-by-frame video analysis tools, influence graphs (mentor/student visualization), community rankings, and an animation technique glossary.

**Status:** Phase 1 code is complete. Database is not yet connected (Prisma client generation blocked by network restriction on `binaries.prisma.sh`). The `/demo` page works without DB.

---

## Tech Stack

| Layer         | Technology                                   |
|---------------|----------------------------------------------|
| Framework     | Next.js 14 (App Router)                      |
| Language      | TypeScript (strict mode)                     |
| Styling       | Tailwind CSS (dark-mode-first, `class` strategy) |
| Database      | PostgreSQL 15 + Prisma ORM 5.22              |
| Search        | Meilisearch v1.6                             |
| Auth          | NextAuth.js v5 (beta-25) — Google, Discord, Twitter |
| Media         | Cloudflare R2 (storage) + Cloudflare Stream (video) |
| Jobs          | Inngest                                      |
| State (client)| Zustand 5 (stores), React Query 5 (server state) |
| Animations    | Framer Motion 11                             |
| Validation    | Zod                                          |
| Package Mgr   | **pnpm** (do NOT use npm or yarn)            |

---

## Commands

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint (next/core-web-vitals)
pnpm type-check       # tsc --noEmit
pnpm test             # Vitest unit tests
pnpm test:ui          # Vitest with browser UI
pnpm test:e2e         # Playwright E2E tests

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to DB (no migration)
pnpm db:migrate       # Prisma migrate dev
pnpm db:seed          # Run seed script (tsx prisma/seed/index.ts)
pnpm db:studio        # Prisma Studio GUI

# Docker (Postgres + Meilisearch + Redis)
docker-compose up -d
```

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group (login)
│   ├── (main)/             # Main layout group (header + footer)
│   │   ├── animators/      # Animator listing + [slug] detail + influence
│   │   ├── clips/          # Clip listing + [slug] detail
│   │   ├── collections/    # User collections
│   │   ├── favorites/      # User favorites
│   │   ├── glossary/       # Technique glossary + [slug] term
│   │   ├── moderation/     # Mod dashboard + clip queue
│   │   ├── rankings/       # Ranking lists + [slug] detail
│   │   ├── search/         # Full-text search
│   │   ├── trending/       # Trending clips
│   │   └── upload/         # Clip submission
│   ├── api/                # API route handlers
│   ├── demo/               # Standalone demo page (no DB required)
│   ├── layout.tsx          # Root layout (fonts, metadata, Providers)
│   └── globals.css         # Tailwind base styles
│
├── components/             # Feature-based React components
│   ├── animators/          # Animator card, grid, header, timeline
│   ├── clips/              # Clip card, grid, video-player/
│   ├── collections/        # Collection CRUD modals + cards
│   ├── common/             # Shared components (favorite button)
│   ├── error/              # Error boundary
│   ├── favorites/          # Favorites tab interface
│   ├── glossary/           # Glossary index, term cards, tags
│   ├── graphs/             # Influence graph (D3-style), relations list
│   ├── home/               # Featured animator hero, recent additions
│   ├── layout/             # Header + Footer
│   ├── moderation/         # Mod queue table, review modal, stats
│   ├── providers/          # SessionProvider + QueryClientProvider
│   ├── rankings/           # Ranking cards, filters, vote button
│   ├── search/             # Search command, filters, hit cards
│   ├── ui/                 # Primitives (button, card, dialog, input, etc.)
│   └── upload/             # Upload form, video dropzone, progress
│
├── lib/                    # Business logic
│   ├── api/                # Fetch client (api.get/post/etc), error helpers
│   ├── auth/               # NextAuth config + session utilities
│   ├── db/                 # Prisma client singleton + query modules
│   │   └── queries/        # Per-entity query functions (10 files)
│   ├── hooks/              # React Query hooks (data) + utility hooks
│   ├── search/             # Meilisearch client + search hooks
│   ├── stores/             # Zustand stores (ui, search, player)
│   ├── utils/              # cn(), format helpers, slug
│   └── validations/        # Zod schemas (animator, clip, common)
│
├── config/                 # App-wide constants
│   ├── constants.ts        # Video limits, pagination, trust system, enums
│   ├── navigation.ts       # Nav items (main, user, moderator, footer)
│   ├── routes.ts           # Type-safe route map (ROUTES object)
│   └── site.ts             # Site name, description, URLs, keywords
│
├── types/                  # TypeScript type definitions
│   ├── index.ts            # Common types + re-exports from Prisma
│   ├── animator.ts         # Animator-specific types
│   ├── clip.ts             # Clip-specific types
│   └── api.ts              # API response types + error codes
│
├── prisma/
│   ├── schema.prisma       # Full database schema (18 models)
│   └── seed/               # Seed data scripts (empty, needs writing)
│
├── __tests__/              # Vitest unit tests (empty, needs writing)
├── e2e/                    # Playwright E2E tests (empty, needs writing)
├── docs/                   # Archived documentation
│   └── SETUP_STATUS.md     # Initial setup session report
│
├── FILEMAP.md              # Detailed ~192-file map
├── PRD.md                  # Product requirements document
├── IMPLEMENTATION_PLAN.md  # Phase 1 build plan
├── FRONTEND_PLAN.md        # Frontend feature roadmap
└── README.md               # Project overview + setup guide
```

---

## Architecture Patterns

### Import Alias
All imports use `@/` which maps to the project root (`"@/*": ["./*"]` in tsconfig).

### API Layer
- **Server:** Route handlers in `app/api/` use `withErrorHandler()` wrapper from `lib/api/errors.ts`. Errors returned via `errors.notFound()`, `errors.unauthorized()`, etc.
- **Client:** `lib/api/client.ts` exports `api.get()`, `api.post()`, etc. Throws `ApiClientError` on non-2xx responses.
- **Hooks:** `lib/hooks/use-*.ts` wrap API calls in React Query's `useQuery`/`useMutation`.

### State Management
- **Server state:** React Query (`@tanstack/react-query`) — all data fetching goes through hooks.
- **Client state:** Zustand stores in `lib/stores/` — `useUIStore`, `useSearchStore`, `usePlayerStore`.
- **Query client:** Created in `components/providers/index.tsx` with 1-min stale time, 5-min GC, no refetch on focus.

### Auth
- NextAuth v5 with Prisma adapter. Providers: Google, Discord, Twitter.
- Session extended with `role` (UserRole enum) and `trustScore` (int).
- Auth utilities in `lib/auth/utils.ts`. Config in `lib/auth/config.ts`.
- Login page at `/login`. Auth API at `/api/auth/[...nextauth]`.

### Database
- Prisma singleton in `lib/db/prisma.ts` (global caching in dev).
- Query functions organized by entity in `lib/db/queries/` (animators, clips, collections, favorites, featured, glossary, moderation, rankings, relations, trending).
- 18 Prisma models. Key entities: Animator, Clip, Anime, Studio, Attribution, Tag, GlossaryTerm, RankingList, User.
- Enums: Role, VerificationStatus, UserRole, SubmissionStatus, RankingType, RankingCategory.

### Styling
- Dark-mode-first design (`html` has `class="dark"`).
- Custom color tokens: `background`, `surface`, `border`, `foreground`, `accent` (purple #8B5CF6).
- Semantic colors: `success`, `error`, `warning`, `info`, `verified`, `speculative`, `disputed`.
- Fonts: DM Sans (body), Playfair Display (headings), JetBrains Mono (code).
- `cn()` utility from `lib/utils/cn.ts` (clsx + tailwind-merge) for conditional classes.

### Validation
- Zod schemas in `lib/validations/` used for both client-side and API route validation.
- API routes validate with Zod, errors auto-caught by `withErrorHandler()`.

---

## Key Domain Concepts

- **Sakuga** — Particularly well-animated sequences in anime, often credited to specific key animators.
- **Attribution** — Links an Animator to a Clip with a Role and VerificationStatus (Verified, Speculative, Disputed).
- **Trust Score** — Users earn/lose points for contributions. Thresholds: New (0–10), Contributor (11–50), Trusted (51–200), Expert (201–500).
- **Fair Use** — Clips capped at 45 seconds, must include `techniqueDescription` explaining educational value.
- **Influence Graph** — Mentor/student/colleague relationships between animators, visualized as a network graph.

---

## Known Issues & Blockers

1. **Prisma client not generated** — `pnpm db:generate` fails because `binaries.prisma.sh` is network-blocked. All 76 TypeScript errors trace back to missing `@prisma/client` types.
2. **No seed data** — `prisma/seed/index.ts` doesn't exist yet. The `__tests__/` and `e2e/` dirs are empty scaffolding.
3. **No node_modules** — Dependencies haven't been installed (`pnpm install` not yet run).

---

## Coding Conventions

- **TypeScript strict mode** — no implicit any, no unchecked index access.
- **Imports** — Always use `@/` alias. Barrel exports via `index.ts` in component/lib subdirs.
- **Components** — Feature-based folders under `components/`. `'use client'` directive only where needed.
- **File naming** — kebab-case for all files (`animator-card.tsx`, `use-clips.ts`).
- **Route pages** — Server components by default. Client-only pages split into `page.tsx` (server) + `page-client.tsx` (client).
- **API routes** — Always wrap handlers with `withErrorHandler()`. Return `{ success: true, data: ... }` on success.
- **CSS** — Tailwind utility classes. No CSS modules. Use `cn()` for conditional classes.
- **Constants** — Never hardcode magic values. All limits, labels, enum mappings live in `config/constants.ts`.
