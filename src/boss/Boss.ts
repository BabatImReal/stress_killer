import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

export type Zone = "head" | "torso" | "armL" | "armR" | "legs";

type ClipName =
  | "idle" | "taunt" | "point" | "shake_fist" | "angry_gesture" | "yell"
  | "hit_head" | "hit_body" | "hit_side" | "stumble" | "dizzy" | "knockout" | "getup";

const TAUNTS: ClipName[] = ["taunt", "point", "shake_fist", "angry_gesture", "yell"];

/** Damped spring for a little extra root-lean punch on top of the clips. */
class Spring {
  x = 0;
  v = 0;
  constructor(private k = 90, private damp = 10) {}
  kick(impulse: number): void {
    this.v += impulse;
  }
  update(dt: number): void {
    this.v += (-this.k * this.x - this.damp * this.v) * dt;
    this.x += this.v * dt;
  }
  reset(): void {
    this.x = 0;
    this.v = 0;
  }
}

export class Boss {
  root = new THREE.Group();
  hitMeshes: THREE.Mesh[] = [];
  state: "idle" | "dizzy" | "ko" | "getup" = "idle";
  damage = 0;

  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<ClipName, THREE.AnimationAction>();
  private currentName: ClipName = "idle";
  private headBone: THREE.Object3D | null = null;
  private sLean = new Spring();
  private lastHitAt = -99;
  private lastTauntAt = 0;
  private dizzyT = 0;

  constructor() {
    this.root.position.set(0, 0, -2.3);
  }

  async load(): Promise<void> {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync("/models/boss.glb");
    const model = gltf.scene;
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    const box = new THREE.Box3().setFromObject(model);
    const s = 1.85 / (box.max.y - box.min.y);
    model.scale.setScalar(s);
    model.position.y = -box.min.y * s;
    this.root.add(model);

    this.mixer = new THREE.AnimationMixer(model);
    for (const clip of gltf.animations) {
      this.actions.set(clip.name as ClipName, this.mixer.clipAction(clip));
    }
    this.mixer.addEventListener("finished", () => this.onClipFinished());

    const find = (suffix: string): THREE.Object3D | null => {
      let r: THREE.Object3D | null = null;
      model.traverse((o) => {
        if (!r && o.name.endsWith(suffix)) r = o;
      });
      return r;
    };
    this.headBone = find("Head");

    // Invisible hitboxes ride the skeleton bones; sizes are in raw rig units (~cm).
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const hb = (suffix: string, zone: Zone, w: number, h: number, d: number, oy: number): void => {
      const b = find(suffix);
      if (!b) return;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hitMat);
      m.position.y = oy;
      m.userData.zone = zone;
      b.add(m);
      this.hitMeshes.push(m);
    };
    hb("Head", "head", 30, 34, 30, 12);
    hb("Spine1", "torso", 38, 30, 26, 12);
    hb("Spine2", "torso", 40, 30, 28, 10);
    hb("Hips", "torso", 38, 26, 26, 2);
    hb("LeftArm", "armL", 15, 34, 15, 14);
    hb("LeftForeArm", "armL", 13, 34, 13, 14);
    hb("RightArm", "armR", 15, 34, 15, 14);
    hb("RightForeArm", "armR", 13, 34, 13, 14);
    hb("LeftUpLeg", "legs", 17, 46, 17, 20);
    hb("LeftLeg", "legs", 15, 44, 15, 18);
    hb("RightUpLeg", "legs", 17, 46, 17, 20);
    hb("RightLeg", "legs", 15, 44, 15, 18);

    // Zero fade: never show the T-pose bind pose on load
    this.play("idle", true, 0);
  }

  private play(name: ClipName, loop = false, fade = 0.15, speed = 1, clamp = false): void {
    const a = this.actions.get(name);
    if (!a) return;
    this.actions.forEach((o) => {
      if (o !== a) o.fadeOut(fade);
    });
    a.reset();
    a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    a.clampWhenFinished = clamp;
    a.timeScale = speed;
    a.fadeIn(fade).play();
    this.currentName = name;
  }

  private onClipFinished(): void {
    if (this.state === "ko") return;
    if (this.state === "getup") this.state = "idle";
    this.play(this.state === "dizzy" ? "dizzy" : "idle", true, 0.25);
  }

  hit(zone: Zone, point: THREE.Vector3, force: number, now: number): void {
    if (!this.mixer || this.state === "ko" || this.state === "getup") return;
    void point;
    this.lastHitAt = now;
    this.sLean.kick(1.2 * force);
    const speed = 1 + (force - 1) * 0.4 + Math.random() * 0.15;
    let clip: ClipName;
    if (force > 1.35) clip = "stumble";
    else if (zone === "head") clip = "hit_head";
    else if (zone === "torso") clip = Math.random() < 0.5 ? "hit_body" : "hit_side";
    else clip = "hit_side";
    // "Getting Hit" is a long multi-stagger clip — play it fast so it stays snappy
    this.play(clip, false, 0.07, clip === "hit_body" ? speed * 1.7 : speed);
    this.damage += force;
    if (this.state === "idle" && this.damage >= 7) {
      this.state = "dizzy";
      this.dizzyT = 3.2;
    }
  }

  knockout(): void {
    if (!this.mixer) return;
    this.state = "ko";
    this.play("knockout", false, 0.1, 1, true);
  }

  reset(): void {
    if (!this.mixer) return;
    this.damage = 0;
    this.dizzyT = 0;
    this.sLean.reset();
    if (this.state === "ko") {
      this.state = "getup";
      this.play("getup", false, 0.2);
    } else {
      this.state = "idle";
      this.play("idle", true);
    }
  }

  headWorldPos(target: THREE.Vector3): THREE.Vector3 {
    if (this.headBone) {
      this.headBone.getWorldPosition(target);
      target.y += 0.15;
    } else {
      this.root.getWorldPosition(target);
      target.y += 1.7;
    }
    return target;
  }

  update(dt: number, now: number): void {
    if (!this.mixer) return;
    this.mixer.update(dt);
    this.sLean.update(dt);
    this.root.rotation.x = -Math.min(0.3, Math.max(-0.15, this.sLean.x * 0.25));

    if (this.state === "dizzy") {
      this.dizzyT -= dt;
      if (this.dizzyT <= 0) {
        this.state = "idle";
        this.damage = Math.max(0, this.damage - 6);
        if (this.currentName === "dizzy") this.play("idle", true, 0.3);
      }
    }
    if (this.state === "idle" && this.currentName === "idle" && now - this.lastHitAt > 6 && now - this.lastTauntAt > 9) {
      this.lastTauntAt = now;
      this.play(TAUNTS[Math.floor(Math.random() * TAUNTS.length)], false, 0.25);
    }
  }
}
