This document represents the finalized, actionable Product Requirements Document (PRD) for Sakuga Legends. It integrates the original vision with necessary risk mitigation, technical specificity, and improved user experience strategies.
________________
Product Requirements Document: Sakuga Legends
Version: 3.0 (Final)
Status: Approved for Development
Date: January 25, 2026
Author: Product Team
________________
1. Executive Summary


Sakuga Legends is a web platform dedicated to celebrating and cataloging the most talented key animators in the anime industry. Unlike general anime databases, this platform focuses specifically on the animator as the primary entity, serving as an authoritative resource for discovering style, lineage, and technique. The platform combines a high-fidelity video archive with "art gallery" aesthetics to treat animators with the prestige they deserve.


Problem Statement
Currently, information about key animators is fragmented across social media, image boards, and scattered wikis. Fans struggle to track career progressions or understand distinct styles, and there is no centralized, well-designed resource that treats animators as artists.


________________
2. Target Audience & Personas
Audience Segment
	Needs & Goals
	Critical User Journey
	Animation Enthusiasts
	Discover new animators and appreciate the craft.


	"I want to know who animated this specific explosion scene."
	Industry Professionals
	Research talent, find references, and network.


	"I need a reference for 'liquid' character acting."
	Students
	Study techniques and frame-by-frame timing.


	"I need to analyze the spacing in this run cycle."
	Content Creators
	Research for essays/videos; accurate attribution.


	"I need to verify if Yutaka Nakamura actually animated this cut."
	________________
3. Risk Analysis & Mitigation (Critical)
Risk Category
	Description
	Mitigation Strategy
	Copyright Liability
	Hosting copyrighted video clips invites DMCA takedowns.
	1. Strict Duration Limits: Clips capped at 45s.


2. Educational Context: Mandatory "Technique Description" field for uploads to argue Fair Use.


3. Compliance Tooling: Automated DMCA takedown request form.
	Bandwidth Costs
	High-quality video delivery is expensive at scale.
	1. Tiered Quality: 1080p for logged-in users only; 720p for guests.


2. Caching: Aggressive edge caching via Cloudflare.
	Data Integrity
	Misattribution of animation cuts (common in the community).
	1. Verification System: Clips marked "Verified" (via credits/books) vs. "Speculative."


2. Reputation: Only high-trust users can overwrite metadata.
	________________
4. Core Functional Features
4.1. The Animator Profile
The profile is the core entry point. It features:
* Biography & Timeline: Career trajectory and visual timeline of works.

* Influence Mapping: A visual graph showing "Mentors" and "Students" to trace stylistic lineage.

* Signature Works: A curated "Reel" of the animator's most defining sequences.

4.2. Sakuga Clip Database
A searchable archive of animation sequences.


   * Player Controls: Frame-by-frame stepping (essential for students), playback speed (0.25x - 2x), and loop region.
   * Metadata: Attribution (Key Animator), Correction (Animation Director), and Technique Tags (e.g., "Smear," "Impact Frames").

   * Quality: Adaptive bitrate streaming with high-quality playback.

4.3. Discovery & Exploration
      * Style Similarity: Algorithmic recommendations (e.g., "If you like X, try Y").

      * Studio Family Trees: Visualizing how studios spawned offshoots (e.g., Gainax $\rightarrow$ Trigger $\rightarrow$ Khara).

      * Rankings: Editorial and community lists like "Top 100 Sakuga Animators" or "Rising Stars".

4.4. Educational Resources
         * Technique Glossary: Definitions of terms like "Itano Circus" or "Obari Pose".

         * Breakdowns: Frame-by-frame analysis articles.

________________
5. Visual Design & UX
The design philosophy is "Cinematic" and "Gallery-Like".


            * Color Palette: Deep indigo/violet base (Dark Mode default) to reduce eye strain and make video colors pop.

            * Typography: Expressive display fonts (Playfair Display) for headers; clean sans-serif (DM Sans) for data.

            * Layout: Magazine-style, full-bleed imagery, asymmetric grids, and generous whitespace.

            * Motion: Subtle parallax and smooth page transitions.

________________
6. Technical Architecture
6.1. Tech Stack
Layer
	Technology
	Frontend
	Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion.


	Backend
	Next.js API Routes, PostgreSQL with Prisma ORM.


	Media
	Cloudflare R2 (Storage), Cloudflare Stream (Delivery).


	Search
	Meilisearch (Typo-tolerant, fast).


	Auth
	NextAuth.js (Social Providers).


	6.2. Data Schema (Prisma Specification)
This schema handles the complex "Many-to-Many" relationship between Animators and Clips.


Code snippet




// Core Entity: The Artist
model Animator {
 id          String   @id @default(cuid())
 name        String   // e.g. "Yutaka Nakamura"
 nativeName  String?  // e.g. "中村 豊"
 bio         String?  @db.Text
 attributions Attribution[]
 mentors     Relation[] @relation("MentorStudent")
}

// Core Entity: The Animation Sequence
model Clip {
 id          String   @id @default(cuid())
 title       String
 videoUrl    String   // Cloudflare Stream ID
 animeSource String
 tags        Tag[]
 attributions Attribution[]
}

// Join Table: Handles Roles & Verification
model Attribution {
 animatorId  String
 clipId      String
 role        Role     @default(KEY_ANIMATION)
 isVerified  Boolean  @default(false)
 source      String?  // URL to credit confirmation
 
 animator    Animator @relation(fields: [animatorId], references: [id])
 clip        Clip     @relation(fields: [clipId], references: [id])

 @@id([animatorId, clipId])
}

6.3. Performance Targets
               * Core Web Vitals: LCP < 2.5s, CLS < 0.1.

               * Video: Lazy loading players; preload only on hover.

________________
7. Development Roadmap
Phase 1: Foundation (Months 1-3)
                  * Focus: Architecture & Content Seeding.
                  * Tasks: Setup Next.js/Postgres. Build Animator Profile system. Implement Cloudflare Stream player. Seed 100+ top animators and 5,000 clips.

Phase 2: Discovery (Months 4-6)
                     * Focus: Search & Navigation.
                     * Tasks: Implement Meilisearch. Build Ranking system and "Rising Stars" algorithm. Develop Career Timeline visualization.

Phase 3: Community (Months 7-9)
                        * Focus: User Contributions.
                        * Tasks: Build User Upload Queue (Mod tools). Implement Favorites/Collections. Add Commenting system.

Phase 4: Education (Months 10-12)
                           * Focus: Context & Learning.
                           * Tasks: Technique Glossary. Educational Learning Paths. Public API for researchers.

________________
8. Success Metrics
Metric
	6-Month Target
	1-Year Target
	Monthly Active Users
	10,000


	50,000


	Clip Database Size
	5,000 clips


	20,000 clips


	Avg. Session Duration
	4+ minutes


	6+ minutes


	Contributor Count
	100


	500


	DMCA Response Time
	< 24 Hours
	< 12 Hours
	________________
