# Changelog

Every work session appends an entry here: what changed, newest first.

## [0.1.0] — 2026-07-17

### Docs (same day, post-release)
- Added `docs/CHANGELOG.md` and `docs/VERSION.md` logging system, plus `CLAUDE.md` with mandatory logging rules.
- Defined owner-approved versioning scheme: big update / big feature bumps require Ben's explicit approval; everything defaults to a small-feature bump. Approval criteria documented in `docs/VERSION.md`.

### Added
- Project scaffold: Vite + TypeScript + Three.js (`package.json`, `tsconfig.json`, `index.html`).
- Design & technical plan in `docs/PLAN.md` (vision, art direction, boss pipeline, interaction system, milestones).
- Office scene (`src/scene/room.ts`): floor/walls/ceiling, sunset window with city view, "KPI IS LIFE" poster, wall clock at 7:05pm, bookshelf, plant, player desk with monitor ("KPI ↓" screen), keyboard, mug, papers, stapler. Warm directional light + soft shadows.
- Placeholder boss (`src/boss/Boss.ts`): blocky suit-and-tie character with glasses; spring-driven procedural reactions; per-zone hitboxes (head/torso/arms/legs); 5 canvas-drawn swappable faces (smug/angry/pain/dizzy/ko); state machine idle → hit → dizzy → ko; taunt animation when the player idles.
- Interaction (`src/interaction/pointer.ts`): raycast slap on click/tap, hover cursor, mouse-look (limited yaw/pitch).
- Juice (`src/fx/effects.ts`): star particle bursts, fading red hit decals, camera shake, hit-pause slow-mo, floating "+N relief" text, confetti.
- Audio (`src/audio/sfx.ts`): fully synthesized WebAudio SFX — slap, body thump, grunt, meter tick, victory fanfare. No audio assets.
- HUD (`src/ui/hud.ts` + `index.html`): draining stress meter, combo counter, hint, "STRESS KILLED!" victory screen with stats and restart.
- Verification tooling: `scripts/screenshot.mjs` (Playwright headless run — console error check + gameplay screenshots).

### Verified
- `npm run build` passes with zero TypeScript errors.
- Headless Chromium run: game renders, 15 automated slaps produce reactions/combo/dizzy state, no console errors.

### Known issues
- Ceiling renders too dark.
- Boss is the placeholder model — Mixamo rigged character upgrade pending (needs Adobe login, see PLAN.md §2.1).
