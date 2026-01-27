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
│   ├── FRONTEND_PLAN.md          # Frontend feature roadmap
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
│   │   ├── page.tsx              # Homepage (hero, trending, recent)
│   │   │
│   │   ├── animators/
│   │   │   ├── page.tsx          # Browse all animators
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # Animator profile
│   │   │       ├── loading.tsx   # Skeleton loading state
│   │   │       └── influence/
│   │   │           └── page.tsx  # Influence graph page
│   │   │
│   │   ├── clips/
│   │   │   ├── page.tsx          # Browse all clips
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # Clip detail + player
│   │   │       └── loading.tsx   # Skeleton loading state
│   │   │
│   │   ├── trending/
│   │   │   └── page.tsx          # Trending clips page
│   │   │
│   │   ├── rankings/
│   │   │   ├── page.tsx          # Browse ranking lists
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Ranking detail + voting
│   │   │
│   │   ├── glossary/
│   │   │   ├── page.tsx          # Animation terminology index
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Term detail page
│   │   │
│   │   ├── collections/
│   │   │   ├── page.tsx          # User collections list
│   │   │   ├── page-client.tsx   # Client component
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Collection detail
│   │   │
│   │   ├── favorites/
│   │   │   ├── page.tsx          # User favorites
│   │   │   └── page-client.tsx   # Client component
│   │   │
│   │   ├── search/
│   │   │   ├── page.tsx          # Global search page
│   │   │   └── page-client.tsx   # Client component
│   │   │
│   │   ├── upload/
│   │   │   ├── page.tsx          # Clip submission page
│   │   │   └── page-client.tsx   # Client component
│   │   │
│   │   └── moderation/
│   │       ├── page.tsx          # Moderation dashboard
│   │       └── clips/
│   │           ├── page.tsx      # Clip moderation queue
│   │           └── page-client.tsx # Client component
│   │
│   └── api/                      # 🔌 API Routes
│       │
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # NextAuth handler
│       │
│       ├── featured-animator/
│       │   └── route.ts          # GET featured animator
│       │
│       ├── animators/
│       │   ├── route.ts          # GET list, POST create
│       │   └── [slug]/
│       │       ├── route.ts      # GET/PATCH animator
│       │       ├── clips/
│       │       │   └── route.ts  # GET animator's clips
│       │       ├── timeline/
│       │       │   └── route.ts  # GET career timeline
│       │       └── relations/
│       │           └── route.ts  # GET mentor/student relations
│       │
│       ├── clips/
│       │   ├── route.ts          # GET list, POST submit
│       │   ├── trending/
│       │   │   └── route.ts      # GET trending clips
│       │   ├── upload-url/
│       │   │   └── route.ts      # GET presigned upload URL
│       │   └── [slug]/
│       │       ├── route.ts      # GET/PATCH clip
│       │       └── favorite/
│       │           └── route.ts  # POST toggle favorite
│       │
│       ├── rankings/
│       │   ├── route.ts          # GET list ranking lists
│       │   └── [slug]/
│       │       ├── route.ts      # GET ranking detail
│       │       └── vote/
│       │           └── route.ts  # POST toggle vote
│       │
│       ├── glossary/
│       │   ├── route.ts          # GET glossary terms
│       │   └── [slug]/
│       │       └── route.ts      # GET term detail
│       │
│       ├── search/
│       │   └── route.ts          # GET search (Meilisearch proxy)
│       │
│       ├── user/
│       │   ├── collections/
│       │   │   ├── route.ts      # GET/POST collections
│       │   │   └── [id]/
│       │   │       ├── route.ts  # GET/PATCH/DELETE collection
│       │   │       └── clips/
│       │   │           ├── route.ts      # POST add clip
│       │   │           └── [clipId]/
│       │   │               └── route.ts  # DELETE remove clip
│       │   └── favorites/
│       │       ├── clips/
│       │       │   └── route.ts  # GET favorite clips
│       │       └── animators/
│       │           └── route.ts  # GET favorite animators
│       │
│       └── moderation/
│           ├── stats/
│           │   └── route.ts      # GET moderation stats
│           └── clips/
│               ├── route.ts      # GET pending clips
│               └── [id]/
│                   └── route.ts  # PATCH approve/reject
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
│   │   ├── combobox.tsx          # Searchable select
│   │   ├── dialog.tsx            # Modal dialogs
│   │   ├── input.tsx             # Form input
│   │   ├── select.tsx            # Select dropdown
│   │   ├── skeleton.tsx          # Loading skeletons
│   │   ├── tabs.tsx              # Tab navigation
│   │   ├── textarea.tsx          # Multi-line input
│   │   └── toast.tsx             # Toast notifications
│   │
│   ├── layout/                   # 📐 Layout Components
│   │   ├── header.tsx            # Navigation header
│   │   └── footer.tsx            # Site footer
│   │
│   ├── home/                     # 🏠 Homepage Components
│   │   ├── featured-animator-hero.tsx  # Featured animator section
│   │   └── recent-additions-section.tsx # Recent clips section
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
│   │   ├── trending-section.tsx  # Homepage trending section
│   │   │
│   │   └── video-player/         # 🎥 Custom Video Player
│   │       ├── index.ts          # Exports
│   │       ├── video-player.tsx  # Main HLS player
│   │       ├── player-context.tsx# State management
│   │       ├── player-controls.tsx# Play/pause/progress
│   │       ├── frame-stepper.tsx # Frame-by-frame (,/.)
│   │       ├── playback-speed.tsx# 0.25x - 2x speed
│   │       └── touch-overlay.tsx # Mobile touch controls
│   │
│   ├── rankings/                 # 🏆 Rankings Components
│   │   ├── index.ts              # Exports
│   │   ├── ranking-card.tsx      # List preview card
│   │   ├── ranking-grid.tsx      # Card grid layout
│   │   ├── ranking-list.tsx      # Full list display
│   │   ├── ranking-item.tsx      # Individual item
│   │   ├── ranking-filters.tsx   # Type/category filters
│   │   └── vote-button.tsx       # Voting UI
│   │
│   ├── glossary/                 # 📖 Glossary Components
│   │   ├── index.ts              # Exports
│   │   ├── glossary-index.tsx    # A-Z index navigation
│   │   ├── term-card.tsx         # Term display card
│   │   └── term-tag.tsx          # Inline term tag
│   │
│   ├── collections/              # 📁 Collection Components
│   │   ├── index.ts              # Exports
│   │   ├── collection-card.tsx   # Collection preview
│   │   ├── collection-grid.tsx   # Card grid layout
│   │   ├── create-collection-modal.tsx # Create dialog
│   │   └── add-to-collection-modal.tsx # Add clip dialog
│   │
│   ├── favorites/                # ❤️ Favorites Components
│   │   ├── index.ts              # Exports
│   │   └── favorites-tabs.tsx    # Clips/Animators tabs
│   │
│   ├── search/                   # 🔍 Search Components
│   │   ├── index.ts              # Exports
│   │   ├── search-command.tsx    # Command palette (Cmd+K)
│   │   ├── search-filters.tsx    # Filter sidebar
│   │   └── search-hit-card.tsx   # Search result card
│   │
│   ├── upload/                   # 📤 Upload Components
│   │   ├── index.ts              # Exports
│   │   ├── clip-form.tsx         # Submission form
│   │   ├── video-dropzone.tsx    # Drag-drop upload
│   │   ├── animator-attribution-field.tsx # Animator picker
│   │   └── upload-progress.tsx   # Progress indicator
│   │
│   ├── moderation/               # 🛡️ Moderation Components
│   │   ├── index.ts              # Exports
│   │   ├── moderation-queue-table.tsx # Pending clips table
│   │   ├── moderation-review-modal.tsx # Review dialog
│   │   └── moderation-stats.tsx  # Dashboard stats
│   │
│   ├── graphs/                   # 📊 Graph Components
│   │   ├── index.ts              # Exports
│   │   ├── influence-graph.tsx   # D3 force graph
│   │   ├── influence-section.tsx # Graph + controls
│   │   └── relations-list.tsx    # Mentors/students list
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
│   │   ├── use-collections.ts    # Collection data hooks
│   │   ├── use-favorite.ts       # Favorite mutation hook
│   │   ├── use-favorites.ts      # User favorites hooks
│   │   ├── use-featured-animator.ts # Featured animator hook
│   │   ├── use-glossary.ts       # Glossary data hooks
│   │   ├── use-influence-graph.ts # Influence graph hooks
│   │   ├── use-moderation.ts     # Moderation data hooks
│   │   ├── use-rankings.ts       # Rankings data hooks
│   │   ├── use-recent-clips.ts   # Recent clips hook
│   │   ├── use-trending.ts       # Trending clips hooks
│   │   ├── use-upload.ts         # Upload mutation hooks
│   │   ├── use-debounce.ts       # Debounce utility
│   │   ├── use-local-storage.ts  # Persistent state
│   │   ├── use-media-query.ts    # Responsive breakpoints
│   │   └── use-touch-controls.ts # Touch gesture handling
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
│   │       ├── clips.ts          # Clip CRUD queries
│   │       ├── collections.ts    # Collection queries
│   │       ├── favorites.ts      # Favorites queries
│   │       ├── featured.ts       # Featured animator query
│   │       ├── glossary.ts       # Glossary queries
│   │       ├── moderation.ts     # Moderation queries
│   │       ├── rankings.ts       # Rankings queries
│   │       ├── relations.ts      # Animator relations queries
│   │       └── trending.ts       # Trending algorithm
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
| `app/` | 53 | Pages, layouts, API routes, error pages |
| `components/` | 73 | React components + providers |
| `lib/` | 42 | Utilities, hooks, stores, services |
| `config/` | 4 | Configuration files |
| `types/` | 4 | TypeScript definitions |
| `prisma/` | 1 | Database schema |
| Root | 9 | Config files |
| Docs | 5 | Documentation |
| **Total** | **~191** | |

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
# Featured
GET  /api/featured-animator       # Get featured animator of the week

# Animators
GET  /api/animators               # List animators
POST /api/animators               # Create animator
GET  /api/animators/:slug         # Get animator
PATCH /api/animators/:slug        # Update animator
GET  /api/animators/:slug/clips   # Get animator's clips
GET  /api/animators/:slug/timeline # Get career timeline
GET  /api/animators/:slug/relations # Get mentor/student relations

# Clips
GET  /api/clips                   # List clips
POST /api/clips                   # Submit clip
GET  /api/clips/trending          # Get trending clips
GET  /api/clips/upload-url        # Get presigned upload URL
GET  /api/clips/:slug             # Get clip
PATCH /api/clips/:slug            # Update clip
POST /api/clips/:slug/favorite    # Toggle favorite
GET  /api/clips/:slug/favorite    # Check if favorited

# Rankings
GET  /api/rankings                # List ranking lists
GET  /api/rankings/:slug          # Get ranking detail
POST /api/rankings/:slug/vote     # Toggle vote

# Glossary
GET  /api/glossary                # List glossary terms
GET  /api/glossary/:slug          # Get term detail

# Search
GET  /api/search                  # Global search (Meilisearch)

# User Data
GET  /api/user/collections        # List user collections
POST /api/user/collections        # Create collection
GET  /api/user/collections/:id    # Get collection
PATCH /api/user/collections/:id   # Update collection
DELETE /api/user/collections/:id  # Delete collection
POST /api/user/collections/:id/clips # Add clip to collection
DELETE /api/user/collections/:id/clips/:clipId # Remove clip
GET  /api/user/favorites/clips    # Get favorite clips
GET  /api/user/favorites/animators # Get favorite animators

# Moderation
GET  /api/moderation/stats        # Get moderation stats
GET  /api/moderation/clips        # Get pending clips
PATCH /api/moderation/clips/:id   # Approve/reject clip

# Auth
POST /api/auth/[...nextauth]      # NextAuth handlers
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

**Animators:**
- `useAnimators` - List with filters
- `useAnimatorsInfinite` - Infinite scroll
- `useAnimator` - Single animator

**Clips:**
- `useClips` - List with filters
- `useClipsInfinite` - Infinite scroll
- `useClip` - Single clip
- `useRecentClips` - Recent additions
- `useFavoriteClip` - Optimistic mutations

**Trending:**
- `useTrending` - Trending with pagination
- `useHomepageTrending` - Homepage trending
- `useTrendingInfinite` - Infinite scroll

**Featured:**
- `useFeaturedAnimator` - Featured animator of the week

**Rankings:**
- `useRankingLists` - List ranking lists
- `useFeaturedRankings` - Homepage featured
- `useRankingDetail` - Single ranking
- `useVote` - Vote mutation

**Glossary:**
- `useGlossaryTerms` - List terms
- `useGlossaryTerm` - Single term
- `useGlossaryIndex` - A-Z index

**Collections:**
- `useUserCollections` - User's collections
- `useCollection` - Single collection

**Favorites:**
- `useFavoriteClips` - User's favorite clips
- `useFavoriteAnimators` - User's favorite animators

**Graphs:**
- `useInfluenceGraph` - Animator influence network
- `useAnimatorRelations` - Mentor/student data

**Moderation:**
- `useModerationStats` - Dashboard stats
- `usePendingClips` - Moderation queue
- `useModerateClip` - Approve/reject mutation

### Search Hooks (`lib/search/`)
- **useSearch** - Generic search
- **useAnimatorSearch** - Animator search
- **useClipSearch** - Clip search
- **useGlobalSearch** - Multi-index search
