# Sakuga Legends - Frontend Implementation Plan (v2 - Refined)

## Overview

This plan outlines the frontend features to implement for the Sakuga Legends anime animation platform. The project already has a solid Phase 1 MVP with 20+ components, custom video player, search, and moderation UI.

---

## Feature Priority Matrix

| Feature | User Impact | Complexity | Priority |
|---------|-------------|------------|----------|
| Trending Clips | High | Low | **P1-A** |
| Mobile Touch Controls | High | Medium | **P1-A** |
| Technique Glossary + Inline Tooltips | High | Medium | **P1-B** |
| Influence Graph | High | High | **P1-B** |
| Studio Timeline | Medium | High | P1-C |
| Rankings | Medium | Medium | P1-C |
| Comments with Timestamps | High | Medium | P2-A |
| Export (Screenshot/GIF) | Medium | High | P2-B |
| Embed Code | Low | Low | P2-B |
| Follow Animators | Medium | High | P2-C |
| PWA Offline Support | Medium | Medium | P2-C |

---

## Phase 1A: Quick Wins

### 1. Trending Clips Section

**Files to create:**
```
lib/db/queries/trending.ts           # Trending algorithm
app/api/clips/trending/route.ts      # GET endpoint
lib/hooks/use-trending.ts            # React Query hook
components/clips/trending-section.tsx # Homepage section
app/(main)/trending/page.tsx         # Dedicated page
```

**Algorithm (Revised - Hacker News Style with Decay):**

The original formula `(viewCount × 0.3) + (favoriteCount × 0.5) + (recencyBonus × 0.2)` is flawed because unbounded view counts dominate. A 2015 clip with 1M views would always outrank new content.

**New Formula:**
```typescript
// Hacker News-style decay function
function calculateTrendingScore(clip: Clip): number {
  const hoursAge = (Date.now() - clip.createdAt.getTime()) / (1000 * 60 * 60)
  const gravity = 1.8 // Higher = faster decay

  // Logarithmic normalization prevents view count domination
  const points =
    Math.log10(Math.max(clip.viewCount, 1)) * 1 +
    clip.favoriteCount * 2 +
    clip.commentCount * 1.5

  return points / Math.pow(hoursAge + 2, gravity)
}

// Time window: clips from last 30 days, sorted by score
// Re-calculate scores hourly via cron job or on-demand with caching
```

**Why this works:**
- `log10(views)` compresses 1M views to ~6 points, 1000 views to ~3
- Fresh clips with 100 favorites can compete with old viral clips
- Gravity decay ensures content cycles naturally

**Integration:** Add to homepage between hero and features

---

### 2. Mobile Touch Controls (Revised)

**Problem with original swipe approach:**
- iOS Safari/Chrome Android: Edge swipes trigger browser back/forward navigation
- Imprecise: 24 swipes to move 1 second is frustrating

**Files to create/modify:**
```
lib/hooks/use-touch-controls.ts                  # Touch handler hook
components/clips/video-player/touch-overlay.tsx  # Touch zones
components/clips/video-player/scrub-indicator.tsx # Visual feedback
components/clips/video-player/video-player.tsx   # Modify
```

**New Touch Interaction Model (TikTok/Instagram style):**

```typescript
interface TouchZones {
  // Tap zones (like Instagram Stories)
  leftTap: () => void      // Rewind 1 second (or 5 frames)
  rightTap: () => void     // Forward 1 second (or 5 frames)
  centerTap: () => void    // Play/pause toggle
  doubleTap: () => void    // Like/favorite

  // Precision scrubbing (like iOS native video)
  longPressAndDrag: {
    onStart: () => void    // Pause playback, show frame counter
    onDrag: (deltaX: number) => void  // Scrub proportionally
    onEnd: () => void      // Resume or stay paused
  }
}
```

**Visual Feedback:**
- Tap left: Show "−5 frames" indicator with rewind icon
- Tap right: Show "+5 frames" indicator with forward icon
- Long press: Show frame counter overlay, dim video edges
- Drag: Show timestamp preview (like YouTube mobile scrubbing)

**Safe Zone Implementation:**
```typescript
// Avoid browser gesture areas
const EDGE_SAFE_ZONE = 20 // pixels from screen edge
const isInSafeZone = (touchX: number, screenWidth: number) => {
  return touchX > EDGE_SAFE_ZONE && touchX < screenWidth - EDGE_SAFE_ZONE
}
```

---

## Phase 1B: Educational Features

### 3. Technique Glossary + Inline Tooltips (Enhanced)

**Core critique addressed:** Users shouldn't leave the video player to understand terms.

**Files to create:**
```
app/(main)/glossary/page.tsx         # Browse terms
app/(main)/glossary/[slug]/page.tsx  # Term detail
app/api/glossary/route.ts            # GET list
app/api/glossary/[slug]/route.ts     # GET detail
lib/db/queries/glossary.ts           # Queries
lib/hooks/use-glossary.ts            # Hooks

# NEW: Inline tooltip system
components/glossary/
  ├── glossary-index.tsx             # A-Z navigation
  ├── term-card.tsx                  # Grid card
  ├── term-detail.tsx                # Full view
  ├── related-terms.tsx              # Linked terms
  ├── term-video-example.tsx         # Embedded clip
  ├── term-tooltip.tsx               # NEW: Hover/tap tooltip
  └── term-tag.tsx                   # NEW: Clickable tag under videos

components/clips/
  └── clip-tags.tsx                  # NEW: Tag bar with tooltip triggers
```

**Inline Tooltip Implementation:**

```typescript
// components/glossary/term-tag.tsx
interface TermTagProps {
  term: string  // e.g., "Yutapon Cube"
  slug: string
}

export function TermTag({ term, slug }: TermTagProps) {
  const { data: glossaryTerm } = useGlossaryTerm(slug)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-accent"
        >
          {term}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">{glossaryTerm?.term}</h4>
          <p className="text-sm text-muted-foreground">
            {glossaryTerm?.definition}
          </p>
          {glossaryTerm?.exampleClipId && (
            <VideoThumbnail clipId={glossaryTerm.exampleClipId} />
          )}
          <Link href={`/glossary/${slug}`} className="text-xs">
            Learn more →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

**Integration Points:**
1. Tag bar below video player showing clip's technique tags
2. Each tag opens popover with definition + mini video example
3. "Learn more" links to full glossary page
4. Mobile: Tap to open, tap outside to close

---

### 4. Influence Graph (Revised for Mobile + Clarity)

**Critiques addressed:**
- "Hairball" problem on mobile with 50+ connections
- Undirected graphs lose Senpai/Kohai context

**Files to create:**
```
components/graphs/
  ├── influence-graph.tsx            # Main component
  ├── graph-node.tsx                 # Custom node renderer
  ├── graph-controls.tsx             # Zoom/pan/reset/filter
  ├── graph-legend.tsx               # Relationship types
  └── graph-list-view.tsx            # NEW: Mobile fallback list
app/api/animators/[slug]/relations/route.ts
lib/db/queries/relations.ts          # Directed graph query
lib/hooks/use-influence-graph.ts
app/(main)/animators/[slug]/influence/page.tsx
```

**Directed Graph Data Structure:**
```typescript
interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface GraphLink {
  source: string
  target: string
  type: 'mentored_by' | 'mentor_to' | 'colleague' | 'influenced_by'
  // Direction matters: source → target
  // "mentored_by": source was mentored BY target
  // "mentor_to": source mentored target
}

// Query differentiates direction
const relations = await prisma.animatorRelation.findMany({
  where: { OR: [
    { sourceId: animatorId },  // Outgoing relations
    { targetId: animatorId },  // Incoming relations
  ]},
  select: {
    sourceId: true,
    targetId: true,
    relationType: true,
    source: { select: { name: true, slug: true, photoUrl: true } },
    target: { select: { name: true, slug: true, photoUrl: true } },
  }
})
```

**Pruning Strategy:**
```typescript
interface GraphOptions {
  maxNodes: number        // Default: 15 (mobile), 30 (desktop)
  showConnectionTypes: ('mentor' | 'colleague' | 'influenced')[]
  expandedNodeId?: string // Show all connections for this node
}

// Default: Show top 5 mentors + top 5 students + 5 closest colleagues
// "Show all" button expands to full graph
// On mobile: Default to list view, graph as opt-in
```

**Mobile Fallback - List View:**
```typescript
// components/graphs/graph-list-view.tsx
// Grouped list: "Mentored By", "Mentored", "Colleagues"
// Each item shows photo, name, # of shared works
// Tap to navigate to animator profile
```

**Accessibility:**
- `prefers-reduced-motion`: Disable physics simulation, show static layout
- Keyboard: Tab through nodes, Enter to select, Arrow keys to pan
- Screen reader: Announce "Yutaka Nakamura, mentored by Yoshinori Kanada, 3 shared works"

---

## Phase 1C: Discovery Features

### 5. Studio Timeline (Revised from "Family Tree")

**Critique addressed:** Anime studios have messy histories (splits, mergers, staff exodus). A rigid tree breaks with circular references.

**New Approach: Horizontal Timeline Visualization**

**Files to create:**
```
app/(main)/studios/page.tsx          # Browse studios
app/(main)/studios/[slug]/page.tsx   # Studio detail with timeline
app/api/studios/route.ts
app/api/studios/[slug]/route.ts
app/api/studios/[slug]/history/route.ts  # Timeline data
lib/db/queries/studios.ts
components/studios/
  ├── studio-card.tsx
  ├── studio-timeline.tsx            # RENAMED: Timeline viz
  ├── timeline-event.tsx             # Founded/split/merged events
  ├── studio-animators.tsx
  └── staff-flow-diagram.tsx         # Optional: Sankey-style flow
```

**Timeline Data Structure:**
```typescript
interface StudioTimelineEvent {
  id: string
  studioId: string
  year: number
  type: 'founded' | 'split' | 'merged' | 'acquired' | 'closed' | 'renamed'
  description: string
  relatedStudioId?: string  // For splits/mergers
  keyStaff?: string[]       // Notable people involved
}

// Example: Gainax → Trigger
[
  { year: 1984, type: 'founded', studioId: 'gainax', description: 'Founded by Hideaki Anno, et al.' },
  { year: 2011, type: 'split', studioId: 'gainax', relatedStudioId: 'trigger',
    description: 'Hiroyuki Imaishi and team leave to form Trigger', keyStaff: ['Imaishi', 'Sushio'] },
  { year: 2011, type: 'founded', studioId: 'trigger', description: 'Founded by ex-Gainax staff' },
]
```

**Visualization:**
- Y-axis: Studios (sorted by founding year)
- X-axis: Timeline (1970-present)
- Lines connect related events (splits show forking lines)
- Hover/tap event nodes for details
- Color coding: Founding (green), Split (yellow), Closure (red)

---

### 6. Rankings (Future-Proofed Schema)

**Critique addressed:** Add `studioId` now for future expansion.

**Schema (Updated):**
```prisma
model RankingList {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String        // "Top 100 Action Animators"
  description String?
  type        RankingType   // EDITORIAL | COMMUNITY
  category    RankingCategory  // ANIMATOR | CLIP | STUDIO | ANIME
  items       RankingItem[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum RankingCategory {
  ANIMATOR
  CLIP
  STUDIO
  ANIME
}

model RankingItem {
  id          String       @id @default(cuid())
  listId      String
  rank        Int
  // Polymorphic: exactly one should be set
  animatorId  String?
  clipId      String?
  studioId    String?      // NEW: Future-proofed
  animeId     String?      // NEW: Future-proofed
  votes       Int          @default(0)
  list        RankingList  @relation(fields: [listId], references: [id])
  animator    Animator?    @relation(fields: [animatorId], references: [id])
  clip        Clip?        @relation(fields: [clipId], references: [id])
  studio      Studio?      @relation(fields: [studioId], references: [id])
  anime       Anime?       @relation(fields: [animeId], references: [id])

  @@index([listId, rank])
}

model Vote {
  id          String      @id @default(cuid())
  userId      String
  itemId      String
  createdAt   DateTime    @default(now())
  user        User        @relation(fields: [userId], references: [id])
  item        RankingItem @relation(fields: [itemId], references: [id])

  @@unique([userId, itemId])  // One vote per user per item
}
```

**Files to create:**
```
app/(main)/rankings/page.tsx
app/(main)/rankings/[listId]/page.tsx
app/api/rankings/route.ts
app/api/rankings/[listId]/route.ts
app/api/rankings/[listId]/vote/route.ts
lib/db/queries/rankings.ts
components/rankings/
  ├── ranking-list.tsx
  ├── ranking-card.tsx
  ├── vote-button.tsx
  └── ranking-filters.tsx
```

---

## Phase 2A: Social Features

### 7. Comments with Deep-Linking Timestamps (Enhanced)

**Critique addressed:** Sakuga comments are often technical ("Look at frame 0:12"). Timestamps should be clickable.

**Files to create:**
```
components/comments/
  ├── comment-section.tsx
  ├── comment-list.tsx
  ├── comment-item.tsx               # Enhanced with timestamp parsing
  ├── comment-form.tsx
  ├── comment-skeleton.tsx
  └── timestamp-link.tsx             # NEW: Clickable timestamp
lib/utils/parse-timestamps.ts        # NEW: Regex parser
app/api/clips/[slug]/comments/route.ts
lib/db/queries/comments.ts
lib/hooks/use-comments.ts
```

**Timestamp Parsing Implementation:**
```typescript
// lib/utils/parse-timestamps.ts
const TIMESTAMP_REGEX = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g
// Matches: 0:12, 1:30, 01:30:45

export function parseTimestamps(text: string): ParsedComment {
  const parts: (string | TimestampLink)[] = []
  let lastIndex = 0

  for (const match of text.matchAll(TIMESTAMP_REGEX)) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Parse timestamp to seconds
    const [, hours, minutes, seconds] = match
    const totalSeconds =
      (parseInt(hours) * 60) +
      parseInt(minutes) +
      (seconds ? parseInt(seconds) : 0)

    parts.push({
      type: 'timestamp',
      display: match[0],
      seconds: totalSeconds,
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return { parts }
}
```

**Comment Item Rendering:**
```typescript
// components/comments/comment-item.tsx
function CommentItem({ comment, onSeekTo }: Props) {
  const parsed = parseTimestamps(comment.body)

  return (
    <div className="comment">
      <p>
        {parsed.parts.map((part, i) =>
          typeof part === 'string' ? (
            part
          ) : (
            <button
              key={i}
              onClick={() => onSeekTo(part.seconds)}
              className="text-accent hover:underline font-mono"
            >
              {part.display}
            </button>
          )
        )}
      </p>
    </div>
  )
}
```

**Integration:**
- `onSeekTo` prop passed from video player context
- Clicking timestamp scrolls to player (if out of view) and seeks
- Works on mobile with tap

---

## Phase 2B: Export Features (Revised)

### 8. Download Options - CORS & Performance Fixes

**Critical Issue Addressed:** CORS will block canvas capture if videos are on external CDN without proper headers.

**Pre-Implementation Checklist:**
```markdown
[ ] Verify Cloudflare R2/Stream sends: Access-Control-Allow-Origin: *
[ ] Verify <video> tag has: crossOrigin="anonymous"
[ ] Test canvas.toDataURL() doesn't throw SecurityError
[ ] If CDN headers can't be changed: Implement server-side fallback
```

**Files to create:**
```
lib/export/
  ├── screenshot.ts                  # Canvas capture with CORS check
  ├── gif-encoder.ts                 # REVISED: ffmpeg.wasm or server fallback
  ├── watermark.ts                   # Add branding
  └── server-export.ts               # NEW: Server-side FFmpeg fallback
components/clips/video-player/
  ├── export-menu.tsx
  └── export-progress.tsx
app/api/clips/[slug]/export/route.ts # Server-side export endpoint
```

**Screenshot Implementation with CORS Check:**
```typescript
// lib/export/screenshot.ts
export async function captureFrame(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0)

  try {
    // This throws if canvas is tainted by CORS
    const dataUrl = canvas.toDataURL('image/png')
    return addWatermark(dataUrl)
  } catch (error) {
    if (error.name === 'SecurityError') {
      // Fallback: Request server-side screenshot
      return requestServerScreenshot(video.currentTime)
    }
    throw error
  }
}
```

**GIF Export Strategy (Revised):**

Original plan used `gif.js` which is unmaintained and CPU-intensive.

**New approach:**
```typescript
// Option A: ffmpeg.wasm (client-side, heavy but powerful)
// - 25MB WASM download on first use
// - Full FFmpeg capabilities
// - Best for desktop with good bandwidth

// Option B: Server-side FFmpeg (recommended for mobile)
// - API endpoint: POST /api/clips/[slug]/export
// - Body: { startTime, endTime, format: 'gif' | 'webm' }
// - Server runs ffmpeg, returns presigned URL to result
// - Async job with progress polling

// Implementation: Detect device capability, choose approach
export async function exportGif(
  clipSlug: string,
  startTime: number,
  endTime: number
): Promise<string> {
  const duration = endTime - startTime

  // Constraints
  if (duration > 10) throw new Error('GIF limited to 10 seconds')
  if (duration > 5 && isMobile()) {
    // Mobile: Always use server
    return serverSideExport(clipSlug, startTime, endTime, 'gif')
  }

  // Desktop: Try client-side first
  try {
    return await clientSideGifEncode(clipSlug, startTime, endTime)
  } catch {
    return serverSideExport(clipSlug, startTime, endTime, 'gif')
  }
}
```

**Resolution Limiting:**
```typescript
// Prevent mobile browser crashes
const MAX_GIF_RESOLUTION = {
  mobile: { width: 480, height: 270 },   // 480p
  desktop: { width: 854, height: 480 },  // 480p (still reasonable)
}
```

---

### 9. Embed Code

**Files to create:**
```
app/embed/[slug]/page.tsx            # Minimal embed page
app/embed/layout.tsx                 # No navigation
components/clips/embed-modal.tsx     # Copy embed code
lib/utils/embed.ts
```

*(No changes from original plan)*

---

## Phase 2C: Notification Features

### 10. Follow Animators + Notifications

**Schema:**
```prisma
model Follow {
  id          String   @id @default(cuid())
  userId      String
  animatorId  String
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  animator    Animator @relation(fields: [animatorId], references: [id])

  @@unique([userId, animatorId])
  @@index([animatorId])  // For "who follows this animator" queries
}

model Notification {
  id          String           @id @default(cuid())
  userId      String
  type        NotificationType
  title       String
  body        String
  linkUrl     String?
  read        Boolean          @default(false)
  createdAt   DateTime         @default(now())
  user        User             @relation(fields: [userId], references: [id])

  @@index([userId, read, createdAt])
}

enum NotificationType {
  NEW_CLIP           // Animator you follow has new attributed clip
  CLIP_APPROVED      // Your submitted clip was approved
  COMMENT_REPLY      // Someone replied to your comment
  COLLECTION_SHARED  // Your collection was shared
}
```

**Files to create:**
```
app/api/user/follows/route.ts
app/api/user/follows/[animatorId]/route.ts
app/api/user/notifications/route.ts
app/api/user/notifications/[id]/route.ts
lib/db/queries/follows.ts
lib/db/queries/notifications.ts
lib/hooks/use-follows.ts
lib/hooks/use-notifications.ts
components/common/follow-button.tsx
components/notifications/
  ├── notification-bell.tsx
  ├── notification-panel.tsx
  └── notification-item.tsx
lib/inngest/functions/notify-followers.ts
```

---

### 11. PWA Offline Support

**Files to create:**
```
public/manifest.json
public/sw.js                         # Service worker
lib/pwa/register.ts
components/pwa/
  ├── install-prompt.tsx
  └── offline-indicator.tsx
```

**Caching strategy:**
- Cache-First: Glossary terms, static assets
- Network-First: Clip data, animator profiles
- Stale-While-Revalidate: Homepage content

---

## Dependencies (Revised)

```json
{
  "dependencies": {
    "react-force-graph-2d": "^1.x",   // Influence graph (verify React 18 strict mode compat)
    "@ffmpeg/ffmpeg": "^0.12.x",      // REVISED: Replace gif.js with ffmpeg.wasm
    "@ffmpeg/util": "^0.12.x",
    "workbox-window": "^7.x"          // PWA
  },
  "devDependencies": {
    "workbox-webpack-plugin": "^7.x"
  }
}
```

**Removed:** `gif.js` (unmaintained since 2017)
**Added:** `@ffmpeg/ffmpeg` (modern, powerful, actively maintained)

---

## Implementation Order (Unchanged)

| Sprint | Features |
|--------|----------|
| 1-2 | Trending Clips, Mobile Touch Controls |
| 3-4 | Technique Glossary + Tooltips, Influence Graph |
| 5-6 | Studio Timeline, Rankings |
| 7-8 | Comments with Timestamps, Follow Animators |
| 9-10 | Export (with CORS handling), Embed, PWA |

---

## Key Files to Reference

| Pattern | File |
|---------|------|
| React Query hooks | `lib/hooks/use-clips.ts` |
| Video player | `components/clips/video-player/video-player.tsx` |
| Zustand stores | `lib/stores/ui-store.ts` |
| API routes | `app/api/clips/route.ts` |
| Components | `components/clips/clip-card.tsx` |

---

## Pre-Implementation Checklist

Before starting development:

- [ ] Verify Cloudflare R2 CORS headers for export feature
- [ ] Test `react-force-graph-2d` in React 18 strict mode (dev double-render)
- [ ] Confirm Prisma schema can be extended (no breaking migrations)
- [ ] Review mobile Safari touch event handling (passive listeners)
- [ ] Set up ffmpeg.wasm CORS headers for SharedArrayBuffer requirement

---

## Verification Steps

After implementation of each feature:

1. Run `pnpm dev` and test feature manually
2. Verify mobile responsiveness (especially touch controls)
3. Test on iOS Safari + Chrome Android (gesture conflicts)
4. Check keyboard accessibility
5. Test with screen reader
6. Run `pnpm build` to ensure no build errors
7. Write/update tests as needed
