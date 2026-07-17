import * as THREE from "three";

export type Zone = "head" | "torso" | "armL" | "armR" | "legs";
export type FaceKind = "smug" | "angry" | "pain" | "dizzy" | "ko";

/** Damped spring driven by velocity kicks — gives cartoony wobble reactions. */
class Spring {
  x = 0;
  v = 0;
  constructor(private k = 80, private damp = 9) {}
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

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

const SKIN = "#f2c9a0";
const INK = "#3a2a20";

function makeFace(kind: FaceKind): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = SKIN;
  x.fillRect(0, 0, 256, 256);
  x.strokeStyle = INK;
  x.fillStyle = INK;
  x.lineWidth = 9;
  x.lineCap = "round";
  const eL = 88;
  const eR = 168;
  const eyeY = 112;
  const mouthY = 192;

  const glasses = (tilt = 0): void => {
    x.save();
    x.translate(128, eyeY);
    x.rotate(tilt);
    x.strokeStyle = "#333";
    x.lineWidth = 7;
    x.strokeRect(eL - 128 - 27, -22, 54, 44);
    x.strokeRect(eR - 128 - 27, -22, 54, 44);
    x.beginPath();
    x.moveTo(eL - 128 + 27, 0);
    x.lineTo(eR - 128 - 27, 0);
    x.stroke();
    x.restore();
    x.strokeStyle = INK;
    x.lineWidth = 9;
  };
  const eyeball = (cx: number, r = 16, pr = 6, px = 0, py = 0): void => {
    x.fillStyle = "#fff";
    x.beginPath();
    x.arc(cx, eyeY, r, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = INK;
    x.beginPath();
    x.arc(cx + px, eyeY + py, pr, 0, Math.PI * 2);
    x.fill();
  };
  const spiral = (cx: number): void => {
    x.beginPath();
    for (let a = 0; a < Math.PI * 4.5; a += 0.2) {
      const r = 2 + a * 3.4;
      const px = cx + Math.cos(a) * r;
      const py = eyeY + Math.sin(a) * r;
      if (a === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.lineWidth = 6;
    x.stroke();
    x.lineWidth = 9;
  };
  const cross = (cx: number): void => {
    x.beginPath();
    x.moveTo(cx - 15, eyeY - 15);
    x.lineTo(cx + 15, eyeY + 15);
    x.moveTo(cx + 15, eyeY - 15);
    x.lineTo(cx - 15, eyeY + 15);
    x.stroke();
  };

  switch (kind) {
    case "smug": {
      eyeball(eL, 17, 6, 3, 3);
      eyeball(eR, 17, 6, 3, 3);
      x.fillStyle = SKIN;
      x.fillRect(eL - 20, eyeY - 20, 40, 16);
      x.fillRect(eR - 20, eyeY - 20, 40, 16);
      x.beginPath();
      x.moveTo(eL - 24, eyeY - 32);
      x.lineTo(eL + 20, eyeY - 22);
      x.moveTo(eR + 24, eyeY - 32);
      x.lineTo(eR - 20, eyeY - 22);
      x.stroke();
      glasses();
      x.beginPath();
      x.moveTo(100, mouthY + 4);
      x.quadraticCurveTo(145, mouthY + 14, 172, mouthY - 10);
      x.stroke();
      break;
    }
    case "angry": {
      eyeball(eL, 15, 7);
      eyeball(eR, 15, 7);
      x.beginPath();
      x.moveTo(eL - 26, eyeY - 40);
      x.lineTo(eL + 18, eyeY - 24);
      x.moveTo(eR + 26, eyeY - 40);
      x.lineTo(eR - 18, eyeY - 24);
      x.stroke();
      glasses();
      x.beginPath();
      x.moveTo(96, mouthY + 12);
      x.quadraticCurveTo(128, mouthY - 12, 160, mouthY + 12);
      x.stroke();
      break;
    }
    case "pain": {
      x.beginPath();
      x.moveTo(eL - 16, eyeY - 18);
      x.lineTo(eL + 14, eyeY);
      x.lineTo(eL - 16, eyeY + 18);
      x.moveTo(eR + 16, eyeY - 18);
      x.lineTo(eR - 14, eyeY);
      x.lineTo(eR + 16, eyeY + 18);
      x.stroke();
      glasses(0.12);
      x.fillStyle = "#5a2a24";
      x.beginPath();
      x.ellipse(128, mouthY, 26, 22, 0, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#e8837a";
      x.beginPath();
      x.ellipse(128, mouthY + 10, 14, 9, 0, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#7fb7e8";
      x.beginPath();
      x.ellipse(38, 100, 8, 13, -0.3, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.ellipse(220, 130, 7, 11, 0.3, 0, Math.PI * 2);
      x.fill();
      break;
    }
    case "dizzy": {
      spiral(eL);
      spiral(eR);
      x.beginPath();
      x.moveTo(96, mouthY);
      for (let i = 0; i <= 16; i++) {
        x.lineTo(96 + i * 4, mouthY + Math.sin(i * 1.1) * 7);
      }
      x.lineWidth = 7;
      x.stroke();
      break;
    }
    case "ko": {
      cross(eL);
      cross(eR);
      x.beginPath();
      x.arc(128, mouthY, 12, 0, Math.PI * 2);
      x.stroke();
      break;
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const COL = {
  suit: 0x2c3a4d,
  pants: 0x263243,
  shirt: 0xf5f2ea,
  tie: 0xd9483b,
  skin: 0xf2c9a0,
  hair: 0x4a4038,
  shoes: 0x2a2020,
};

export class Boss {
  root = new THREE.Group();
  hitMeshes: THREE.Mesh[] = [];
  state: "idle" | "dizzy" | "ko" = "idle";
  damage = 0;

  private torso = new THREE.Group();
  private head = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private faceMat: THREE.MeshBasicMaterial;
  private faces: Record<FaceKind, THREE.CanvasTexture>;

  private sLeanBack = new Spring(80, 9);
  private sLeanSide = new Spring(80, 9);
  private sHeadX = new Spring(120, 8);
  private sHeadZ = new Spring(120, 8);
  private sArmL = new Spring(60, 6);
  private sArmR = new Spring(60, 6);

  private lastHitAt = -99;
  private lastTauntAt = 0;
  private tauntT = 0;
  private tauntBlend = 0;
  private dizzyT = 0;
  private painT = 0;

  constructor() {
    this.faces = {
      smug: makeFace("smug"),
      angry: makeFace("angry"),
      pain: makeFace("pain"),
      dizzy: makeFace("dizzy"),
      ko: makeFace("ko"),
    };
    this.faceMat = new THREE.MeshBasicMaterial({ map: this.faces.smug });
    this.build();
    this.root.position.set(0, 0, -2.3);
    this.root.scale.setScalar(0.92);
  }

  private mesh(w: number, h: number, d: number, color: number, x: number, y: number, z: number, parent: THREE.Object3D, zone?: Zone): THREE.Mesh {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({ color }),
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    if (zone) {
      m.userData.zone = zone;
      this.hitMeshes.push(m);
    }
    parent.add(m);
    return m;
  }

  private build(): void {
    // Legs and shoes
    this.mesh(0.18, 0.95, 0.18, COL.pants, -0.14, 0.475, 0, this.root, "legs");
    this.mesh(0.18, 0.95, 0.18, COL.pants, 0.14, 0.475, 0, this.root, "legs");
    this.mesh(0.2, 0.09, 0.32, COL.shoes, -0.14, 0.045, 0.05, this.root, "legs");
    this.mesh(0.2, 0.09, 0.32, COL.shoes, 0.14, 0.045, 0.05, this.root, "legs");

    // Torso pivots at the hips
    this.torso.position.y = 0.95;
    this.root.add(this.torso);
    this.mesh(0.58, 0.62, 0.32, COL.suit, 0, 0.31, 0, this.torso, "torso");
    this.mesh(0.22, 0.5, 0.02, COL.shirt, 0, 0.34, 0.165, this.torso, "torso");
    this.mesh(0.09, 0.3, 0.02, COL.tie, 0, 0.38, 0.175, this.torso, "torso");
    this.mesh(0.12, 0.07, 0.025, COL.tie, 0, 0.55, 0.175, this.torso, "torso");

    // Arms pivot at the shoulders
    this.armL.position.set(-0.36, 0.55, 0);
    this.torso.add(this.armL);
    this.mesh(0.14, 0.55, 0.14, COL.suit, 0, -0.24, 0, this.armL, "armL");
    this.mesh(0.12, 0.1, 0.12, COL.skin, 0, -0.56, 0, this.armL, "armL");
    this.armR.position.set(0.36, 0.55, 0);
    this.torso.add(this.armR);
    this.mesh(0.14, 0.55, 0.14, COL.suit, 0, -0.24, 0, this.armR, "armR");
    this.mesh(0.12, 0.1, 0.12, COL.skin, 0, -0.56, 0, this.armR, "armR");

    // Head pivots at the neck
    this.head.position.set(0, 0.62, 0);
    this.torso.add(this.head);
    this.mesh(0.14, 0.12, 0.14, COL.skin, 0, 0.04, 0, this.head, "head");
    this.mesh(0.38, 0.38, 0.38, COL.skin, 0, 0.29, 0, this.head, "head");
    this.mesh(0.4, 0.12, 0.4, COL.hair, 0, 0.5, -0.01, this.head, "head");
    this.mesh(0.4, 0.26, 0.08, COL.hair, 0, 0.36, -0.17, this.head, "head");
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), this.faceMat);
    face.position.set(0, 0.29, 0.191);
    face.userData.zone = "head";
    this.head.add(face);
    this.hitMeshes.push(face);
  }

  setFace(kind: FaceKind): void {
    this.faceMat.map = this.faces[kind];
    this.faceMat.needsUpdate = true;
  }

  private restingFace(): FaceKind {
    if (this.state === "ko") return "ko";
    if (this.state === "dizzy") return "dizzy";
    return this.damage > 3 ? "angry" : "smug";
  }

  hit(zone: Zone, point: THREE.Vector3, force: number, now: number): void {
    if (this.state === "ko") return;
    this.lastHitAt = now;
    this.tauntT = 0;
    this.painT = 0.45;
    this.setFace("pain");
    const side = point.x > this.root.position.x ? 1 : -1;
    this.sLeanBack.kick(zone === "legs" ? 1.6 * force : 3.2 * force);
    this.sLeanSide.kick(-side * (1.2 + Math.random()) * force);
    if (zone === "head") {
      this.sHeadX.kick(6.5 * force);
      this.sHeadZ.kick(-side * 4 * force);
    } else {
      this.sHeadX.kick(2 * force);
    }
    this.sArmL.kick((zone === "armL" ? 8 : 2 + 2 * Math.random()) * force);
    this.sArmR.kick((zone === "armR" ? 8 : 2 + 2 * Math.random()) * force);
    this.damage += force;
    if (this.state === "idle" && this.damage >= 7) {
      this.state = "dizzy";
      this.dizzyT = 2.8;
    }
  }

  knockout(): void {
    this.state = "ko";
    this.setFace("ko");
    this.sLeanBack.kick(5);
    this.sArmL.kick(6);
    this.sArmR.kick(6);
    this.tauntT = 0;
  }

  reset(): void {
    this.state = "idle";
    this.damage = 0;
    this.painT = 0;
    this.dizzyT = 0;
    this.tauntT = 0;
    this.tauntBlend = 0;
    this.lastHitAt = -99;
    [this.sLeanBack, this.sLeanSide, this.sHeadX, this.sHeadZ, this.sArmL, this.sArmR].forEach((s) => s.reset());
    this.root.rotation.set(0, 0, 0);
    this.setFace("smug");
  }

  headWorldPos(target: THREE.Vector3): THREE.Vector3 {
    this.head.getWorldPosition(target);
    target.y += 0.3;
    return target;
  }

  update(dt: number, now: number): void {
    [this.sLeanBack, this.sLeanSide, this.sHeadX, this.sHeadZ, this.sArmL, this.sArmR].forEach((s) => s.update(dt));

    if (this.painT > 0) {
      this.painT -= dt;
      if (this.painT <= 0) this.setFace(this.restingFace());
    }

    if (this.state === "dizzy") {
      this.dizzyT -= dt;
      if (this.dizzyT <= 0) {
        this.state = "idle";
        this.damage = Math.max(0, this.damage - 6);
        if (this.painT <= 0) this.setFace(this.restingFace());
      }
    }

    // Taunt when the player hesitates
    if (this.state === "idle" && now - this.lastHitAt > 6 && now - this.lastTauntAt > 9) {
      this.lastTauntAt = now;
      this.tauntT = 1.8;
      if (this.painT <= 0) this.setFace("angry");
    }
    if (this.tauntT > 0) {
      this.tauntT -= dt;
      if (this.tauntT <= 0 && this.painT <= 0) this.setFace(this.restingFace());
    }
    this.tauntBlend += ((this.tauntT > 0 ? 1 : 0) - this.tauntBlend) * Math.min(1, dt * 8);

    const breath = Math.sin(now * 2.2) * 0.02;
    this.torso.rotation.x = breath * 0.4 - clamp(this.sLeanBack.x, -0.3, 0.7);
    this.torso.rotation.z = clamp(this.sLeanSide.x, -0.5, 0.5);
    this.torso.rotation.y = Math.sin(now * 0.6) * 0.04;
    this.head.rotation.x = -clamp(this.sHeadX.x, -0.5, 0.6);
    this.head.rotation.z = clamp(this.sHeadZ.x, -0.5, 0.5);
    this.head.rotation.y = Math.sin(now * 0.8) * 0.12;
    this.armL.rotation.z = 0.12 + clamp(this.sArmL.x, -1.2, 1.2);
    this.armR.rotation.z = -0.12 - clamp(this.sArmR.x, -1.2, 1.2);
    this.armR.rotation.x = this.tauntBlend * (-2.2 + Math.sin(now * 13) * 0.3);

    if (this.state === "dizzy") {
      this.root.rotation.z = Math.sin(now * 9) * 0.08;
      this.root.rotation.x = Math.sin(now * 7.3) * 0.04;
    } else if (this.state === "ko") {
      this.root.rotation.z = Math.sin(now * 1.6) * 0.05;
    } else {
      this.root.rotation.z *= 1 - Math.min(1, dt * 5);
      this.root.rotation.x *= 1 - Math.min(1, dt * 5);
    }
  }
}
