import * as THREE from "three";
import { createRoom } from "./scene/room";
import { Boss } from "./boss/Boss";
import { Effects } from "./fx/effects";
import { Sfx } from "./audio/sfx";
import { Hud } from "./ui/hud";
import { Pointer, type HitInfo } from "./interaction/pointer";

const container = document.getElementById("app")!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1d24);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 50);
const camRig = new THREE.Group();
const camShake = new THREE.Group();
camRig.position.set(0, 1.25, 0);
camRig.add(camShake);
camShake.add(camera);
scene.add(camRig);

createRoom(scene);
const boss = new Boss();
scene.add(boss.root);
const hint = document.getElementById("hint")!;
hint.textContent = "The boss is walking in…";
void boss.load().then(() => {
  hint.textContent = "Click your boss to relieve stress";
});
const effects = new Effects(scene, camShake);
const sfx = new Sfx();

let gameOver = false;
let combo = 0;
let hits = 0;
let bestCombo = 0;
let lastHitTime = -9;
let timeScale = 1;
let pauseT = 0;
const tmp = new THREE.Vector3();

const hud = new Hud(() => {
  boss.reset();
  hud.reset();
  gameOver = false;
  combo = 0;
  hits = 0;
  bestCombo = 0;
});

function onPress(hit: HitInfo | null): void {
  sfx.unlock();
  if (gameOver || !hit) return;
  const now = performance.now() / 1000;
  combo = now - lastHitTime < 1.15 ? combo + 1 : 1;
  lastHitTime = now;
  hits++;
  bestCombo = Math.max(bestCombo, combo);

  let force = (0.9 + Math.random() * 0.3) * (1 + Math.min(combo, 10) * 0.05);
  if (boss.state === "dizzy") force *= 1.5;

  boss.hit(hit.zone, hit.point, force, now);
  effects.burst(hit.point);
  effects.decal(hit.object, hit.point);
  effects.shake(0.02 + 0.02 * force);
  sfx.slap(force);
  sfx.tick();
  if (hits % 2 === 0) sfx.grunt();
  if (force > 1.35 || (combo > 0 && combo % 6 === 0)) {
    timeScale = 0.07;
    pauseT = 0.07;
  }

  const relief = Math.round(3 + force + combo * 0.8);
  tmp.copy(hit.point).project(camera);
  effects.floatText((tmp.x * 0.5 + 0.5) * innerWidth, (-tmp.y * 0.5 + 0.5) * innerHeight, `+${relief} relief`);
  if (combo >= 3) hud.showCombo(combo);

  if (hud.drain(relief)) {
    gameOver = true;
    boss.knockout();
    effects.confetti(boss.headWorldPos(tmp));
    sfx.fanfare();
    hud.victory(hits, bestCombo);
  }
}

const pointer = new Pointer(container, camera, () => boss.hitMeshes, onPress);
// Dev console handle for debugging (harmless in prod)
(window as unknown as Record<string, unknown>).__game = { boss, sfx, hud };

const clock = new THREE.Clock();
let starAcc = 0;
renderer.setAnimationLoop(() => {
  const raw = Math.min(clock.getDelta(), 0.05);
  if (pauseT > 0) {
    pauseT -= raw;
    if (pauseT <= 0) timeScale = 1;
  }
  const dt = raw * timeScale;
  const now = performance.now() / 1000;

  camRig.rotation.y += (pointer.lookYaw - camRig.rotation.y) * Math.min(1, raw * 6);
  camera.rotation.x += (pointer.lookPitch - camera.rotation.x) * Math.min(1, raw * 6);

  boss.update(dt, now);
  if (boss.state === "dizzy") {
    starAcc += dt;
    if (starAcc > 0.35) {
      starAcc = 0;
      effects.burst(boss.headWorldPos(tmp), { count: 2, speed: 1, up: 1, size: 0.07 });
    }
  }
  effects.update(dt, raw);
  renderer.render(scene, camera);
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
