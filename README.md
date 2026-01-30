# Sakuga Legends

Web platform celebrating anime key animators with clip database, frame-by-frame analysis tools, and educational content.

## Project Status

**Phase 1: COMPLETE** - Core platform is fully functional

### Implemented Features
- Animator profiles with career timelines and signature reels
- Clip database with custom video player
- Frame-by-frame controls (keyboard: `,`/`.` keys, mobile: tap zones)
- Technique Glossary with video examples
- Influence Graph (mentor/student visualization)
- Rankings with community voting
- Trending clips (Hacker News-style algorithm)
- User authentication (Google, Discord, Twitter)
- Moderation queue for clip submissions

### Planned for Phase 2
- [ ] Comments with clickable timestamps
- [ ] Export (screenshot/GIF with watermark)
- [ ] Follow animators + notifications
- [ ] Studio Timeline visualization
- [ ] PWA offline support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma |
| Search | Meilisearch |
| Auth | NextAuth.js v5 |
| Media | Cloudflare R2/Stream |
| Jobs | Inngest |

## Getting Started

### Prerequisites
- Node.js 18+
- npm/pnpm
- PostgreSQL (or Docker for local setup)
- Optional: Docker (for Meilisearch)

### Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Start PostgreSQL
# Option A: Docker
docker-compose up -d
# Option B: Local PostgreSQL service
sudo systemctl start postgresql

# 4. Set up database
npm run db:generate  # Generate Prisma client
npm run db:push      # Create schema

# 5. Start dev server
npm run dev
```

### Demo Page

If you encounter Prisma client generation issues, you can still view the UI design:

```bash
npm run dev
# Visit http://localhost:3000/demo
```

The demo page showcases the complete Sakuga Legends interface without requiring database access.

## Documentation
- [PRD.md](./PRD.md) - Product requirements
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Technical implementation
- [FRONTEND_PLAN.md](./FRONTEND_PLAN.md) - Frontend feature roadmap
- [FILEMAP.md](./FILEMAP.md) - Project structure
