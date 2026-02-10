# Technical Debt Tracker

This document tracks known issues, blockers, and prioritized improvements for Sakuga Legends.

**Last reviewed:** February 10, 2026

---

## Priority Levels

| Level | Definition | Action |
|-------|------------|--------|
| **Critical** | Blocks development or deployment | Fix immediately |
| **High** | Degrades developer experience significantly | Fix within current sprint |
| **Medium** | Should be addressed but not blocking | Schedule for next sprint |
| **Low** | Nice to have, no urgency | Address when convenient |

---

## Critical Issues

### 1. Prisma Client Not Generated

**Status:** Unresolved
**Impact:** All 76 TypeScript errors trace back to this
**Affected:** Every file that imports from `@prisma/client`

**Problem:**
`pnpm db:generate` fails because `binaries.prisma.sh` is network-blocked. The Prisma CLI cannot download the required engine binaries.

**Error:**
```
Error: Failed to fetch the engine file at https://binaries.prisma.sh/...
403 Forbidden
```

**Consequences:**
- Main homepage (`/`) shows error
- All API routes that query database fail
- TypeScript types from Prisma unavailable
- Type-check (`pnpm type-check`) fails with 76 errors

**Workarounds:**
1. Use `/demo` route for UI preview (no DB required)
2. Manually create database schema with SQL

**Resolution Options:**
1. Resolve network restrictions for `binaries.prisma.sh`
2. Use Prisma engine mirror:
   ```bash
   export PRISMA_ENGINES_MIRROR=https://alternative-mirror.com
   npx prisma generate
   ```
3. Use checksum ignore (not recommended for production):
   ```bash
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
   ```

**References:**
- [docs/SETUP_STATUS.md](./SETUP_STATUS.md) — Detailed error log
- [PRD.md §13.1](../PRD.md) — Known issues section

---

## High Priority

### 2. Empty Test Directories

**Status:** Not started
**Impact:** No automated testing coverage

**Problem:**
Both `__tests__/` (Vitest unit tests) and `e2e/` (Playwright E2E tests) directories are empty scaffolding.

**Missing:**
- Unit tests for utility functions (`lib/utils/`)
- Unit tests for query functions (`lib/db/queries/`)
- Component tests for critical UI (`components/clips/video-player/`)
- E2E tests for core user flows (auth, upload, moderation)

**Resolution:**
1. Write unit tests for pure utilities first (highest ROI)
2. Add integration tests for database queries
3. Add E2E tests for critical paths:
   - Login flow
   - Clip upload + moderation approval
   - Video player frame stepping
   - Collection CRUD

**Estimated effort:** 2-3 days

### 3. No Seed Data

**Status:** Not started
**Impact:** Empty database on fresh setup

**Problem:**
`prisma/seed/index.ts` doesn't exist. Running `pnpm db:seed` does nothing.

**Missing:**
- Sample animators (with profiles, bios, career data)
- Sample clips (with attributions, tags)
- Sample anime series
- Glossary terms
- Demo user accounts

**Resolution:**
1. Create `prisma/seed/index.ts` with structured seed data
2. Add realistic sample data for all entities
3. Include edge cases (long bios, special characters, multiple attributions)

**Estimated effort:** 1 day

### 4. Schema Sync with PRD v5.1

**Status:** Pending review
**Impact:** Schema drift from specification

**Problem:**
Prisma schema needs updates to match PRD v5.1 requirements.

**Missing/Incorrect:**
- `Clip.commentCount` field missing
- `RelationType` enum not defined
- `AnimatorRelation` fields use `mentorId/studentId` instead of generic `sourceId/targetId`
- Some indexes from PRD not applied

**Resolution:**
1. Add `commentCount` to Clip model
2. Create `RelationType` enum (mentor, student, colleague, influenced_by)
3. Refactor AnimatorRelation for generic relationships
4. Audit indexes against PRD §5

**Estimated effort:** 2-3 hours (after Prisma client is working)

---

## Medium Priority

### 5. TypeScript Strict Mode Violations

**Status:** Blocked by #1
**Impact:** 76 type errors reported

**Problem:**
All 76 TypeScript errors are downstream of missing Prisma types. Once Prisma client generates, most will resolve automatically.

**Remaining after Prisma fix:**
- Some `map`/`filter` callbacks may have implicit `any`
- NextAuth adapter type mismatch (low priority)

**Resolution:**
1. Fix Prisma client generation (#1)
2. Run `pnpm type-check`
3. Fix any remaining errors manually

### 6. Missing Cmd+K Command Palette

**Status:** Not implemented
**Impact:** Feature incomplete per PRD

**Problem:**
Global search should have a keyboard-accessible command palette (`Cmd+K` / `Ctrl+K`). Currently only the search page exists.

**Resolution:**
1. Add command palette component using Radix Dialog
2. Wire to global keyboard shortcut
3. Connect to Meilisearch for instant results

**Estimated effort:** 4-6 hours

### 7. Missing Inline Technique Tooltips

**Status:** Not implemented
**Impact:** Feature incomplete per PRD

**Problem:**
Technique tags below video player should show popover tooltips with term definitions. Currently just static tags.

**Resolution:**
1. Add tooltip popover to `term-tag.tsx`
2. Fetch term definition on hover/tap
3. Include thumbnail of example clip

**Estimated effort:** 3-4 hours

---

## Low Priority

### 8. Missing SEO Optimizations

**Status:** Not implemented
**Impact:** Suboptimal search engine visibility

**Missing:**
- Dynamic meta tags for animator/clip pages
- Open Graph images
- JSON-LD structured data (Person, VideoObject)
- Auto-generated sitemap

**Resolution:**
- Add `generateMetadata` to dynamic pages
- Create OG image generation API route
- Add JSON-LD to page layouts
- Configure next-sitemap

### 9. Missing Security Headers

**Status:** Not implemented
**Impact:** Security best practices not followed

**Missing:**
- CSP (Content Security Policy) headers
- CSRF protection tokens
- Rate limiting via Redis

**Resolution:**
- Add CSP headers in middleware
- Implement CSRF tokens for mutations
- Set up Redis-based rate limiting (100 req/min anon, 1000 req/min auth)

### 10. Missing Accessibility Audit

**Status:** Not started
**Impact:** WCAG 2.1 AA compliance unknown

**Missing:**
- Screen reader testing
- Keyboard navigation audit
- Color contrast verification
- Focus indicator review

**Resolution:**
- Run automated audit (axe-core)
- Manual testing with screen reader
- Fix identified issues

---

## Resolved Issues

### ~~Font Optimization Network Block~~ (Fixed 2026-01-30)

**Resolution:** Disabled font optimization in `next.config.js` to bypass Google Fonts download issues.

```javascript
// next.config.js
{
  optimizeFonts: false
}
```

### ~~Missing React Query Devtools~~ (Fixed 2026-01-30)

**Resolution:** Added `@tanstack/react-query-devtools` to devDependencies.

---

## Dependencies to Verify

These dependencies should be installed but may need version verification:

| Package | Expected | Purpose |
|---------|----------|---------|
| `prisma` | ^5.22.0 | ORM + schema management |
| `@prisma/client` | ^5.22.0 | Database client |
| `next-auth` | ^5.0.0-beta.25 | Authentication |
| `@tanstack/react-query` | ^5.x | Server state management |
| `zustand` | ^5.x | Client state management |
| `zod` | ^3.x | Validation |
| `hls.js` | ^1.x | Video streaming |

Run `pnpm list` to verify installed versions match package.json.

---

## Adding New Items

When adding technical debt items:

1. Assign appropriate priority level
2. Describe the problem clearly
3. Explain the impact on development/users
4. Suggest resolution steps
5. Estimate effort if possible
6. Reference related files or PRD sections

---

## Related Documentation

- [SETUP_STATUS.md](./SETUP_STATUS.md) — Initial setup session report
- [ORGANIZATION.md](./ORGANIZATION.md) — Code structure guide
- [CLAUDE.md](../CLAUDE.md) — Project overview
- [PRD.md](../PRD.md) — Product requirements

---

*Last updated: February 10, 2026*
