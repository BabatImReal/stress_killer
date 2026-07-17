# Changelog

Every work session appends an entry here: what changed, newest first.

## [0.2.1] — 2026-07-18

### Fixed
- Stumble no longer slides the boss backward through the wall: hips X/Z are locked to the first frame for all clips at load (root motion stripped, vertical motion kept for falls). Verified: hip drift during a full stumble is now <3 cm (was ~1 m).
- Idle "dancing": the downloaded Idle clip now plays at half speed, reading as calm weight-shifting instead of a groove. (Optional better fix later: download a calmer "Standing Idle" from Mixamo and re-run `node tools/run-convert.mjs`.)
- Added `tools/drift-test.mjs` — deterministic mixer-driven check for root-motion drift.

## [0.2.0] — 2026-07-18 (approved as big feature by Ben; shipped as 0.1.1, promoted same day)

### Added
- **Real Mixamo boss character** (Ch33, chosen by Ben) replaces the blocky placeholder: 13 animation clips (idle, 5 taunt variants, head/body/side hit reactions, stumble, dizzy, knockout, get-up) on one skeleton, crossfading via `AnimationMixer`.
- Asset pipeline: `tools/convert.html` + `tools/convert.ts` + `tools/run-convert.mjs` — browser-based FBX→GLB conversion driven headlessly by Playwright; `gltf-transform` optimization (meshopt + 1024px webp) shrank 69.7 MB → **1.8 MB** (`public/models/boss.glb`).
- Hitboxes now ride the real skeleton bones (head/spine/arms/legs), so hit zones track him through every animation.
- Boss state machine rewritten clip-based: per-zone reaction clips with speed scaling by force, heavy hits trigger Stumble Backwards, dizzy plays Dizzy Idle, victory plays Knocked Out (clamped), "Vent again" plays Getting Up; taunts pick randomly from 5 clips.
- Debug handle `window.__game` and `tools/probe.mjs` (headless mixer-state inspector).

### Fixed
- Boss no longer fades in from T-pose on load (idle starts with zero fade).
- Hit decals are world-sized on cm-scale rig bones (world-scale compensation in `Effects.decal`).

### Removed
- Procedural placeholder boss (box body, canvas faces, spring animations) — superseded by the rigged character.

### Verified
- `npm run build` clean; headless run: no console errors, idle pose correct, hit reactions/stumble/decals/stars/combo all firing.

## [0.1.0] — 2026-07-17

### Docs (post-release)
- 2026-07-18: added `assets_src/mixamo/README.md` — download checklist for the real boss character (PLAN.md §2.1).
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
