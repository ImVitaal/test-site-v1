# Documentation Index

Welcome to the Sakuga Legends documentation. This folder contains guides, status reports, and reference materials for the project.

---

## Documentation Map

### In This Folder (`docs/`)

| Document | Description |
|----------|-------------|
| [ORGANIZATION.md](./ORGANIZATION.md) | Code structure, folder conventions, naming rules |
| [TECH_DEBT.md](./TECH_DEBT.md) | Known issues, blockers, prioritized improvements |
| [SETUP_STATUS.md](./SETUP_STATUS.md) | Initial setup session report (2026-01-30) |
| [SENTRY_SOURCEMAP_VERIFICATION.md](./SENTRY_SOURCEMAP_VERIFICATION.md) | Sentry source maps verification guide |

### Root-Level Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](../CLAUDE.md) | Project overview, tech stack, coding conventions |
| [PRD.md](../PRD.md) | Product Requirements Document (v5.1) — single source of truth |
| [README.md](../README.md) | Project overview, quick start, phase status |

---

## Quick Links by Topic

### Getting Started

1. Read [CLAUDE.md](../CLAUDE.md) for project overview and tech stack
2. Check [README.md](../README.md) for setup instructions
3. Review [SETUP_STATUS.md](./SETUP_STATUS.md) for known setup issues

### Understanding the Codebase

1. [ORGANIZATION.md](./ORGANIZATION.md) — folder structure and naming
2. [CLAUDE.md](../CLAUDE.md) — architecture patterns and conventions
3. [PRD.md](../PRD.md) — feature specifications and database schema

### Current Blockers

1. [TECH_DEBT.md](./TECH_DEBT.md) — prioritized list of issues
2. [SETUP_STATUS.md](./SETUP_STATUS.md) — Prisma client generation failure details

### Error Tracking

1. [SENTRY_SOURCEMAP_VERIFICATION.md](./SENTRY_SOURCEMAP_VERIFICATION.md) — verify Sentry is working

---

## Document Purposes

### CLAUDE.md (Project Baseline)

The primary reference for AI assistants and new developers. Contains:
- Project overview and current status
- Tech stack table
- Available commands
- Project structure
- Architecture patterns
- Coding conventions

**When to reference:** Starting any development session, understanding conventions.

### PRD.md (Product Specification)

The single source of truth for what we're building. Contains:
- Vision and core features
- Detailed feature specifications
- Database schema (all 18 models)
- API specification
- Design system tokens
- Development roadmap
- Known issues

**When to reference:** Implementing features, understanding requirements, checking specifications.

### ORGANIZATION.md (Code Guide)

Developer guide for navigating and contributing to the codebase. Contains:
- Folder responsibilities
- Naming conventions
- Test organization strategy
- Component patterns
- Import conventions

**When to reference:** Adding new files, organizing code, understanding structure.

### TECH_DEBT.md (Issue Tracker)

Tracks all known technical issues that need resolution. Contains:
- Critical blockers
- Prioritized improvement list
- Resolution steps
- Estimated effort

**When to reference:** Planning work, understanding current state, finding issues to fix.

### SETUP_STATUS.md (Session Report)

Detailed report from initial setup session. Contains:
- What was accomplished
- Current errors and workarounds
- Environment configuration
- Next steps

**When to reference:** Troubleshooting setup, understanding current state.

---

## Maintenance

### Keeping Docs Current

- **CLAUDE.md:** Update when tech stack or conventions change
- **PRD.md:** Update when features or specifications change
- **ORGANIZATION.md:** Update when folder structure changes
- **TECH_DEBT.md:** Update when issues are found or resolved
- **SETUP_STATUS.md:** Append new session reports as needed

### Adding New Documentation

1. Create new `.md` file in this folder
2. Add entry to this README's documentation map
3. Cross-reference from related documents

---

## Not in Documentation

Some reference materials live in the codebase itself:

- **Config files:** `config/constants.ts`, `config/routes.ts`
- **Type definitions:** `types/index.ts`, `types/api.ts`
- **Schema:** `prisma/schema.prisma`

---

*Last updated: February 10, 2026*
