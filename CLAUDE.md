# Stress Killer

First-person browser stress-relief game: vent on a cartoon boss until your stress meter empties. Three.js + TypeScript + Vite. The full design/technical plan lives in `docs/PLAN.md` — follow its phases and keep its tone rule: comic cartoon violence only, generic cartoon boss, never a real person.

## Logging rules (mandatory, every session)

After making any change to the project, before ending the turn:

1. **`docs/CHANGELOG.md`** — append what changed under the current version heading (create a new heading when the version bumps). Newest entries first.
2. **`docs/VERSION.md`** — bump when appropriate and add a row: MINOR when a PLAN.md phase milestone completes, PATCH for fixes/tweaks. Keep `version` in `package.json` in sync.

## Commands

- `npm run dev` — dev server on http://localhost:5173
- `npm run build` — typecheck (tsc) + production build; must pass before a change counts as done
- `node scripts/screenshot.mjs <outdir>` — headless Playwright verification: loads the dev server, slaps the boss, reports console errors, saves screenshots. Use it to visually verify changes.

## Structure

`src/main.ts` game loop and wiring · `src/scene/` office room · `src/boss/` character, faces, reaction state machine · `src/interaction/` raycast input · `src/fx/` particles/decals/shake/hit-pause · `src/audio/` synthesized WebAudio SFX · `src/ui/` HUD/stress meter.
