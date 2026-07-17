# Stress Killer — Design & Technical Plan

**One-line pitch:** Had a bad day? Open a link, and vent on a cartoon boss until your stress meter hits zero.

**Stack:** Three.js + TypeScript + Vite · Rapier (physics) · Howler.js (audio) · Mixamo (character & animations) · deploy to itch.io / Vercel

**Reference games:** Kick the Buddy, Whack Your Boss, Beat the Boss, Talking Tom

**Golden rule:** cartoon comic violence only (dizzy stars, bandages, flying papers). Generic cartoon boss — never a real person, never realistic gore.

---

## 1. The Background (Office Environment)

### 1.1 Art direction

- **Style:** low-poly, stylized cartoon. Flat colors with soft gradients, rounded shapes, slightly oversized props (comic proportions). Think *Job Simulator* / Kenney-asset look.
- **Why this style:** it's achievable without an artist, free assets in this style are abundant and consistent with each other, it runs at 60fps on any laptop or phone, and cartoonish visuals keep the violence funny instead of dark.
- **Palette:** warm neutral office (beige/wood desk, soft blue-grey walls) so the boss (dark suit, red tie) pops as the focal point. Late-afternoon warm light = "end of a long workday" mood.

### 1.2 Scene composition

- **Player position:** seated at their own desk, first-person camera at ~1.2m (seated eye height).
- **The boss stands on the other side of the player's desk**, ~2m away, dead center — he is always the focus, like he just walked over to pressure you about KPIs.
- **Camera:** fixed position with limited mouse-look (±30° yaw, ±15° pitch) plus subtle idle sway. No walking — removes all navigation complexity and keeps 100% of attention on the boss.
- **Set dressing (back to front):** window with simple city skyline backdrop → wall with clock + motivational poster (parody: "KPI IS LIFE") → bookshelf and plant → boss's space → player's desk in the foreground with monitor, keyboard, stapler, coffee mug, paper stack (these double as throwable ammo — see §3).

### 1.3 How it gets built

| Phase | Approach |
|---|---|
| v0.1 | Code-only geometry: floor/wall planes, box-based desk and shelf, `RoomEnvironment`-style lighting. Zero asset hunting — playable in a day. |
| v0.2 | Swap in free CC0 low-poly props: **Kenney Furniture Kit**, **Quaternius office packs** (both CC0, glTF format, consistent style). |
| Later | Post-processing polish: vignette, slight bloom on the window, contact shadows. |

### 1.4 Lighting & performance

- **Lights:** one hemisphere light (soft ambient, sky/ground tint) + one warm directional light through the window with PCF soft shadows (1024px shadow map, tight frustum around the boss). That's all — cheap and pretty.
- **Budget:** < 100k triangles total, < 20 draw calls for the room (merge static props), single 60fps `requestAnimationFrame` loop. Target: runs on a mid-range phone.

---

## 2. The Boss Model (how it's made)

### 2.1 Pipeline decision: Mixamo (no modeling, no rigging, no animating by hand)

We do **not** draw or sculpt the character ourselves. Pipeline:

1. **Character:** pick a business-suit character from [Mixamo](https://www.mixamo.com)'s free library (auto-rigged, free for game use). Alternative if we want a more cartoonish body: take a CC0 suit character from **Quaternius "Ultimate Modular Men"**, upload it to Mixamo, and its auto-rigger rigs it in minutes.
2. **Animations:** download from Mixamo's library, all on the same skeleton ("without skin" option, so one shared mesh + many animation clips):
   - `Idle`, `Idle Angry`, `Arms Crossed` (default loop — he taps his foot, checks his watch, pressures you)
   - `Taunt`, `Pointing` (used when the player is idle — he provokes you)
   - `Head Hit`, `Body Hit`, `Stomach Hit` (light reactions)
   - `Stumble Backwards`, `Stagger` (heavy reactions)
   - `Dizzy`, `Falling`, `Getting Up` (knockdown cycle)
3. **Convert:** FBX → glTF/GLB via Blender (batch script) or `FBX2glTF`. GLB with Draco compression → one ~2–4 MB file.
4. **Load:** `GLTFLoader` + `AnimationMixer`; all clips cross-fade on the shared skeleton.

### 2.2 Face & expressions (the personality layer)

Mixamo characters have no facial blendshapes, so we use the classic cartoon trick — **texture-swap faces**:

- A small plane (or a second UV region on the head texture) carries the face.
- We draw ~6 flat cartoon faces (simple enough to make ourselves or generate): `smug`, `angry`, `shocked`, `pain`, `dizzy (spiral eyes)`, `KO (X X eyes)`.
- Swapping a texture takes one line and reads *instantly* — this is where the character's comedy comes from, more than the 3D model itself.

### 2.3 Damage representation (comic, reversible)

Damage never uses blood — it uses **state layers** that stack and then heal:

1. **Instant marks:** red hand-print / bruise decals at the exact hit point (Three.js `DecalGeometry`), fading out over ~10s.
2. **Dishevelment stages** driven by accumulated damage: tie flips over shoulder → glasses knocked off (a physics prop that falls!) → hair messed up (mesh swap) → suit texture swaps clean → rumpled → torn.
3. **Comic accessories:** bandage/plaster decals appear at high damage, orbiting stars/birds particle above the head when dizzy.
4. **Recovery:** everything reverses over time or on reset — no permanent fail state, he always comes back smug.

### 2.4 Ragdoll (Phase 5 — the big payoff feature)

- Build a **physics skeleton** in Rapier: ~11 rigid bodies (head, chest, pelvis, 2× upper/lower arm, 2× upper/lower leg) connected by spherical/revolute joints with cartoon-loose limits.
- Normal state: bodies are *kinematic*, following the animation bones each frame.
- On a heavy hit: switch bodies to *dynamic*, apply impulse at the hit point → he flies/crumples with real physics.
- Recovery: after bodies settle, lerp bones from ragdoll pose back into the `Getting Up` animation (~0.5s blend). This anim↔ragdoll blend is the hardest single piece of the project, which is why it's isolated in its own late phase — the game is already fun before it.

---

## 3. The Interaction System (the heart of the game)

### 3.1 Input & hit detection

- **Pointer events** (mouse + touch unified). A `Raycaster` fires from the camera through the cursor.
- The boss carries **invisible per-bone hitboxes** (capsules parented to skeleton bones): `head`, `torso`, `leftArm`, `rightArm`, `legs`. The raycast hits a capsule → we know the body part, exact 3D point, and surface normal.
- Each body part has its own reaction table (§3.3) — hitting the head is not the same as poking the belly. This per-zone specificity is what makes it feel like *interacting with a character* rather than clicking a mesh.

### 3.2 Action verbs (in build order)

| Verb | Input | Mechanics |
|---|---|---|
| **Slap** (v0.1) | click/tap on the boss | raycast → zone reaction, force scales with a quick "wind-up" (hold duration up to 0.4s) |
| **Poke & shove** | press-and-drag on him | continuous small reactions; drag direction pushes him — he leans/steps back |
| **Grab & throw props** | click-hold a desk object, flick, release | object becomes kinematic under cursor; release velocity = cursor velocity → Rapier ballistic flight → collision with a hitbox triggers impact (tomato splats, stapler bonks, paper ball bounces off) |
| **Tool bar** | number keys / bottom HUD | swaps the "hand" for tools; each tool is data, not code (§3.5) |
| **Grab the boss** (ragdoll phase) | click-hold on a limb | drag him around by an arm, fling him — Kick-the-Buddy signature move |

### 3.3 The boss reaction state machine

```
IDLE ──light hit──▶ HIT_REACT ──▶ IDLE
 │ ▲                  (per-zone clip: head=Head Hit, torso=Body Hit…)
 │ └──after 8s idle── TAUNT  ("still scared of me?" — provokes the player)
 │
 ├─heavy hit─▶ STAGGER ─▶ IDLE
 ├─damage > T1─▶ DIZZY (spiral eyes, stars, wobble loop, extra-vulnerable)
 └─damage > T2─▶ KNOCKDOWN (ragdoll / Falling clip) ─▶ GETUP ─▶ IDLE (damage partially reset)
```

- **Interrupt rules:** a new hit always interrupts a reaction (crossfade 0.1s) — the boss must *never* feel unresponsive; queuing animations is the classic mistake that kills this genre.
- Light vs heavy is decided by impact force (wind-up time, tool mass × throw speed).
- **Anti-repetition:** every zone has 2–3 reaction clips + randomized playback speed (0.9–1.1×) so mashing never looks robotic.

### 3.4 The juice checklist — every hit fires ALL of these

This list is the actual game. Each item is small; together they make a click feel like a hit:

1. Reaction animation starts **within 1 frame** (crossfade, no queue)
2. Impact **SFX** from a pool of 4–5 variants, randomized ±15% pitch (Howler)
3. **Particle burst** at the hit point (stars/sweat drops, ~10 sprites, 0.5s)
4. **Decal** (red mark) at the hit point, fades over ~10s
5. **Hit-pause:** freeze the world 50–80 ms on heavy hits (classic fighting-game trick — free "impact weight")
6. **Camera shake** scaled to force (0.05–0.2 units, 0.2s decay)
7. Face texture swap (`smug → pain`, back after 0.6s)
8. Floating **combo text** ("+12 relief!", combo counter for rapid varied hits)
9. **Stress meter drains** (§3.6) with a satisfying tick sound

Build one slap with all 9 → the game already works. Everything after is content.

### 3.5 Tools as data

Each tool is a config object — adding content never means new systems:

```ts
interface Tool {
  id: string;            // "hand" | "tomato" | "stapler" | "paperball" | ...
  model?: string;        // GLB path (throwables)
  mode: "melee" | "throw";
  force: number;         // drives light/heavy + physics impulse
  sfx: string[];         // impact sound pool
  particles: "stars" | "splat" | "paper" | ...;
  decal?: string;        // e.g. tomato leaves a splat
  stressRelief: number;  // meter drain per hit
}
```

v1 set: hand → paper ball → tomato → stapler → keyboard → coffee mug. Combo bonus for *varying* tools (rewards playfulness over mindless clicking).

### 3.6 The stress meter (the purpose, gamified)

- The score is **the player's own stress bar**, starting full and *draining* with every hit — the game's fantasy stated as a mechanic: your stress goes down.
- Varied, well-timed hits drain faster (combo multiplier); when it empties → **"Stress killed!"** celebration screen: confetti, session stats (total hits, favorite tool, biggest combo), and a one-tap restart. The boss dusts himself off, smug again.
- No lose condition, ever. Sessions are 2–5 minutes by design — a vent break, not a grind.

---

## 4. Architecture

```
src/
  main.ts            // bootstrap, render loop, resize
  scene/             // room geometry, lighting, environment
  boss/
    BossController.ts  // state machine (§3.3)
    BossModel.ts       // GLB loading, AnimationMixer, hitboxes, face swap
    damage.ts          // damage accumulation, dishevelment stages, decals
  interaction/
    pointer.ts         // unified mouse/touch, raycasting
    tools.ts           // Tool definitions + active tool logic
    throwing.ts        // grab/flick physics
  fx/                // particles, camera shake, hit-pause, decals
  audio/             // Howler pools
  ui/                // HUD: stress meter, tool bar, combo text, end screen
  physics/           // Rapier world, ragdoll (phase 5)
```

Plain TypeScript modules and one game loop — no ECS framework needed at this scope.

---

## 5. Milestones

| Phase | Deliverable | Success test |
|---|---|---|
| 0 | Vite + TS + Three.js scaffold, empty lit room, camera look | runs at 60fps in browser |
| 1 | Boss loaded from Mixamo, idle loop, hitboxes visible in debug | he stands there judging you |
| 2 | **The Slap**: full 9-item juice checklist on click | *does hitting him feel good?* ← the go/no-go test |
| 3 | Reaction state machine, per-zone clips, faces, taunts | he feels alive; mashing never looks broken |
| 4 | Rapier: throwable desk props, damage stages, tool bar | 5 tools, tomato splats |
| 5 | Ragdoll knockdown + grab-and-fling | he flies; gets up smug |
| 6 | Stress meter, combos, end screen, sound pass, deploy | classmates play it from a link |

Phase 2 is the checkpoint: if the slap isn't fun, we fix *that* before building anything else.
