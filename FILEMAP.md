# Sakuga Legends - Project File Map

```
sakuga-legends/
│
├── 📄 Root Configuration
│   ├── .env.example              # Environment variables template
│   ├── .eslintrc.json            # ESLint configuration
│   ├── .gitignore                # Git ignore rules
│   ├── docker-compose.yml        # Local Postgres + Meilisearch
│   ├── next.config.js            # Next.js configuration
│   ├── package.json              # Dependencies & scripts
│   ├── postcss.config.js         # PostCSS for Tailwind
│   ├── tailwind.config.ts        # Tailwind design tokens
│   └── tsconfig.json             # TypeScript configuration
│
├── 📚 Documentation
│   ├── FILEMAP.md                # This file
│   ├── IMPLEMENTATION_PLAN.md    # Phase 1 MVP build plan
│   ├── PRD.md                    # Product Requirements (v4.0)
│   └── README.md                 # Project overview
│
├── 🗄️ prisma/
│   └── schema.prisma             # Database schema (15+ models)
│
├── 📁 app/                       # Next.js 14 App Router
│   │
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── globals.css               # Global styles + Tailwind
│   ├── error.tsx                 # Error page (500)
│   ├── not-found.tsx             # Not found page (404)
│   ├── global-error.tsx          # Root error boundary
│   │
│   ├── (auth)/                   # 🔐 Authentication Routes
│   │   ├── layout.tsx            # Centered card layout
│   │   └── login/
│   │       └── page.tsx          # OAuth sign-in page
│   │
│   ├── (main)/                   # 🏠 Main Application Routes
│   │   ├── layout.tsx            # Header + Footer wrapper
│   │   ├── page.tsx              # Homepage (hero, features)
│   │   │
│   │   ├── animators/
│   │   │   ├── page.tsx          # Browse all animators
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # Animator profile
│   │   │       └── loading.tsx   # Skeleton loading state
│   │   │
│   │   └── clips/
│   │       ├── page.tsx          # Browse all clips
│   │       └── [slug]/
│   │           ├── page.tsx      # Clip detail + player
│   │           └── loading.tsx   # Skeleton loading state
│   │
│   └── api/                      # 🔌 API Routes
│       │
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # NextAuth handler
│       │
│       ├── animators/
│       │   ├── route.ts          # GET list, POST create
│       │   └── [slug]/
│       │       ├── route.ts      # GET/PATCH animator
│       │       ├── clips/
│       │       │   └── route.ts  # GET animator's clips
│       │       └── timeline/
│       │           └── route.ts  # GET career timeline
│       │
│       ├── clips/
│       │   ├── route.ts          # GET list, POST submit
│       │   └── [slug]/
│       │       ├── route.ts      # GET/PATCH clip
│       │       └── favorite/
│       │           └── route.ts  # POST toggle favorite
│       │
│       └── search/
│           └── route.ts          # GET search (Meilisearch proxy)
│
├── 📦 components/                # React Components
│   │
│   ├── providers/                # 🔗 Client Providers
│   │   └── index.tsx             # React Query + Session
│   │
│   ├── error/                    # ⚠️ Error Handling
│   │   ├── index.ts              # Exports
│   │   └── error-boundary.tsx    # React error boundary
│   │
│   ├── ui/                       # 🎨 Base UI Primitives
│   │   ├── badge.tsx             # Status badges
│   │   ├── button.tsx            # Button variants
│   │   ├── card.tsx              # Card container
│   │   ├── input.tsx             # Form input
│   │   └── skeleton.tsx          # Loading skeletons
│   │
│   ├── layout/                   # 📐 Layout Components
│   │   ├── header.tsx            # Navigation header
│   │   └── footer.tsx            # Site footer
│   │
│   ├── animators/                # 👤 Animator Components
│   │   ├── animator-card.tsx     # Grid card
│   │   ├── animator-grid.tsx     # Card grid layout
│   │   ├── animator-header.tsx   # Profile header
│   │   └── career-timeline.tsx   # Horizontal timeline
│   │
│   ├── clips/                    # 🎬 Clip Components
│   │   ├── attribution-panel.tsx # Animator credits
│   │   ├── clip-card.tsx         # Thumbnail card
│   │   ├── clip-grid.tsx         # Card grid layout
│   │   │
│   │   └── video-player/         # 🎥 Custom Video Player
│   │       ├── index.ts          # Exports
│   │       ├── video-player.tsx  # Main HLS player
│   │       ├── player-context.tsx# State management
│   │       ├── player-controls.tsx# Play/pause/progress
│   │       ├── frame-stepper.tsx # Frame-by-frame (,/.)
│   │       └── playback-speed.tsx# 0.25x - 2x speed
│   │
│   └── common/                   # 🔧 Shared Components
│       └── favorite-button.tsx   # Heart toggle (React Query)
│
├── 📚 lib/                       # Utilities & Services
│   │
│   ├── api/                      # 🌐 API Client
│   │   ├── index.ts              # Exports
│   │   ├── client.ts             # Typed fetch wrapper
│   │   ├── endpoints.ts          # API endpoint definitions
│   │   └── errors.ts             # Error response utilities
│   │
│   ├── hooks/                    # 🪝 Custom Hooks
│   │   ├── index.ts              # Exports
│   │   ├── use-animators.ts      # Animator data hooks
│   │   ├── use-clips.ts          # Clip data hooks
│   │   ├── use-favorite.ts       # Favorite mutation hook
│   │   ├── use-debounce.ts       # Debounce utility
│   │   ├── use-media-query.ts    # Responsive breakpoints
│   │   └── use-local-storage.ts  # Persistent state
│   │
│   ├── stores/                   # 🗃️ Zustand Stores
│   │   ├── index.ts              # Exports
│   │   ├── create-store.ts       # Store factory
│   │   ├── ui-store.ts           # UI state (modals, toasts)
│   │   ├── search-store.ts       # Filter state (persisted)
│   │   └── player-store.ts       # Player prefs (persisted)
│   │
│   ├── search/                   # 🔍 Search (Meilisearch)
│   │   ├── index.ts              # Exports
│   │   ├── client.ts             # Meilisearch client
│   │   └── hooks.ts              # Search hooks
│   │
│   ├── auth/                     # 🔐 Authentication
│   │   ├── config.ts             # NextAuth configuration
│   │   └── utils.ts              # getSession, requireAuth
│   │
│   ├── db/                       # 🗄️ Database
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── utils.ts              # Pagination helpers
│   │   └── queries/
│   │       ├── animators.ts      # Animator CRUD queries
│   │       └── clips.ts          # Clip CRUD queries
│   │
│   ├── utils/                    # 🛠️ Utilities
│   │   ├── cn.ts                 # clsx + tailwind-merge
│   │   ├── format.ts             # Date/number formatting
│   │   └── slug.ts               # URL slug generation
│   │
│   └── validations/              # ✅ Zod Schemas
│       ├── common.ts             # Base schemas
│       ├── animator.ts           # Animator validation
│       └── clip.ts               # Clip validation
│
├── ⚙️ config/                    # App Configuration
│   ├── constants.ts              # App constants
│   ├── navigation.ts             # Nav structure
│   ├── routes.ts                 # Type-safe route paths
│   └── site.ts                   # Site metadata
│
└── 📝 types/                     # TypeScript Types
    ├── index.ts                  # Re-exports + utilities
    ├── api.ts                    # API response types
    ├── animator.ts               # Animator types
    └── clip.ts                   # Clip types
```

## File Count Summary

| Directory | Files | Description |
|-----------|-------|-------------|
| `app/` | 21 | Pages, layouts, API routes, error pages |
| `components/` | 20 | React components + providers |
| `lib/` | 24 | Utilities, hooks, stores, services |
| `config/` | 4 | Configuration files |
| `types/` | 4 | TypeScript definitions |
| `prisma/` | 1 | Database schema |
| Root | 9 | Config files |
| Docs | 4 | Documentation |
| **Total** | **87** | |

## Key Entry Points

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, fonts, providers |
| `app/(main)/page.tsx` | Homepage |
| `components/providers/index.tsx` | React Query + Session setup |
| `lib/db/prisma.ts` | Database connection |
| `lib/auth/config.ts` | Authentication setup |
| `lib/stores/index.ts` | Global state management |
| `lib/hooks/index.ts` | Data fetching hooks |
| `prisma/schema.prisma` | Data models |
| `tailwind.config.ts` | Design system |

## API Endpoints

```
GET  /api/animators              # List animators
POST /api/animators              # Create animator
GET  /api/animators/:slug        # Get animator
PATCH /api/animators/:slug       # Update animator
GET  /api/animators/:slug/clips  # Get animator's clips
GET  /api/animators/:slug/timeline # Get career timeline

GET  /api/clips                  # List clips
POST /api/clips                  # Submit clip
GET  /api/clips/:slug            # Get clip
PATCH /api/clips/:slug           # Update clip
POST /api/clips/:slug/favorite   # Toggle favorite
GET  /api/clips/:slug/favorite   # Check if favorited

GET  /api/search                 # Global search (Meilisearch)

POST /api/auth/[...nextauth]     # NextAuth handlers
```

## Client-Side Infrastructure

### Providers (`components/providers/`)
- **QueryClientProvider** - React Query for data caching
- **SessionProvider** - NextAuth session state

### Zustand Stores (`lib/stores/`)
- **useUIStore** - Sidebar, modals, toasts
- **useSearchStore** - Filter state (persisted)
- **usePlayerStore** - Video preferences (persisted)

### Data Hooks (`lib/hooks/`)
- **useAnimators** - List with filters
- **useAnimatorsInfinite** - Infinite scroll
- **useAnimator** - Single animator
- **useClips** - List with filters
- **useClipsInfinite** - Infinite scroll
- **useClip** - Single clip
- **useFavoriteClip** - Optimistic mutations

### Search Hooks (`lib/search/`)
- **useSearch** - Generic search
- **useAnimatorSearch** - Animator search
- **useClipSearch** - Clip search
- **useGlobalSearch** - Multi-index search
