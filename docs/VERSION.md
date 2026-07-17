# Version History

**Current version: 0.2.0** (kept in sync with `package.json`)

## Versioning scheme (owner-approved)

Format: `BIG_UPDATE.BIG_FEATURE.SMALL_FEATURE` (e.g., `1.2.3`)

| Level | Example | Who decides | What it means |
|-------|---------|-------------|---------------|
| **Big update** | `1`, `2`, `3` | **Ben approves explicitly** | A release players would call "a new version of the game" |
| **Big feature** | `1.1`, `1.2` | **Ben approves explicitly** | A new player-facing system that changes how you play |
| **Small feature** | `1.1.1`, `1.1.2` | automatic (default) | Everything else — fixes, polish, content, tweaks, docs |

**Rule: every change defaults to a SMALL feature bump.** Claude never promotes a change to big feature or big update on its own — it may *propose* the promotion with evidence against the criteria below, and only bumps after Ben approves in the conversation. Big update `1` = first public release; until then the big-update number stays `0`.

## Criteria to qualify (what Claude must show before asking for approval)

**Big feature candidate (x.N) — must meet ALL of:**
1. Adds or completes a *player-facing system* — a new verb or mechanic that changes how the game is played (e.g., throwing physics, tool bar, ragdoll, the real Mixamo boss, mobile controls). Content variations (a new sound, face, prop, particle) do NOT qualify.
2. Corresponds to a PLAN.md phase milestone or an approved addition to the plan.
3. Verified: `npm run build` clean + headless screenshot run with no console errors + actually played/playable end-to-end.
4. Changelog entry written; Ben can see it working (played it or shown screenshots) before approving.

**Big update candidate (N.0) — must meet ALL of:**
1. Bundles the big features of a milestone into something a player would experience as a new game version (e.g., `1.0` = first public deployed release with PLAN.md Phase 6 done; `2.0` = a major overhaul like real character + ragdoll + full tool arsenal).
2. No known critical bugs; runs at 60fps on a mid-range machine.
3. Deployed / shareable build available (itch.io or Vercel link).
4. Ben has personally played it and given explicit approval.

## History

| Version | Date | Phase (PLAN.md) | Summary |
|---------|------------|-----------------|---------|
| 0.2.0 | 2026-07-18 | Phase 1 complete | **Big feature (approved by Ben):** real Mixamo boss with 13 animation clips replaces placeholder; FBX→GLB pipeline (69.7 MB → 1.8 MB); bone-riding hitboxes; clip-based reaction state machine. Ben notes it needs a round of fixes — to land as 0.2.x patches. |
| 0.1.0 | 2026-07-17 | Phases 0–2 complete (+ parts of 3) | First playable slice: office scene, placeholder boss with reactions/faces/dizzy state, fully juiced slap, stress meter, victory screen. Verified headlessly. Retroactively counted as big feature 0.1 (accepted by Ben in session). |
