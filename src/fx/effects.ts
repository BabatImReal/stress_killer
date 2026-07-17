import * as THREE from "three";

interface Particle {
  s: THREE.Sprite;
  v: THREE.Vector3;
  life: number;
  max: number;
}

interface Decal {
  s: THREE.Sprite;
  life: number;
}

function starTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  x.fillStyle = "#fff";
  x.translate(32, 32);
  x.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 28 : 12;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  x.closePath();
  x.fill();
  return new THREE.CanvasTexture(c);
}

function blobTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 4, 32, 32, 30);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.7, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export interface BurstOpts {
  count?: number;
  colors?: string[];
  speed?: number;
  up?: number;
  size?: number;
}

export class Effects {
  private parts: Particle[] = [];
  private decals: Decal[] = [];
  private starTex = starTexture();
  private blobTex = blobTexture();
  private shakeAmp = 0;
  private textLayer = document.getElementById("fx-layer")!;

  constructor(private scene: THREE.Scene, private shakeGroup: THREE.Group) {}

  burst(pos: THREE.Vector3, opts: BurstOpts = {}): void {
    const { count = 10, colors = ["#ffd23d", "#ffe94d", "#ff9a3d"], speed = 2.2, up = 1.8, size = 0.09 } = opts;
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.starTex,
        color: colors[i % colors.length],
        transparent: true,
        depthWrite: false,
      });
      const s = new THREE.Sprite(mat);
      s.position.copy(pos);
      s.scale.setScalar(size * (0.7 + Math.random() * 0.6));
      this.scene.add(s);
      this.parts.push({
        s,
        v: new THREE.Vector3(
          (Math.random() - 0.5) * 2 * speed,
          up * (0.4 + Math.random()),
          (Math.random() - 0.5) * speed,
        ),
        life: 0.5 + Math.random() * 0.3,
        max: 0.8,
      });
    }
    while (this.parts.length > 90) this.kill(this.parts.shift()!);
  }

  confetti(pos: THREE.Vector3): void {
    this.burst(pos, {
      count: 40,
      colors: ["#ff4d6d", "#ffd23d", "#4dd08a", "#4da6ff", "#c78aff", "#ff9a3d"],
      speed: 3.4,
      up: 4,
      size: 0.1,
    });
  }

  decal(target: THREE.Object3D, worldPoint: THREE.Vector3): void {
    const mat = new THREE.SpriteMaterial({
      map: this.blobTex,
      color: 0xd23c2a,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const s = new THREE.Sprite(mat);
    const lp = worldPoint.clone();
    target.worldToLocal(lp);
    lp.multiplyScalar(1.05);
    s.position.copy(lp);
    s.scale.setScalar(0.14 + Math.random() * 0.05);
    target.add(s);
    this.decals.push({ s, life: 8 });
    if (this.decals.length > 22) {
      const old = this.decals.shift()!;
      old.s.removeFromParent();
      old.s.material.dispose();
    }
  }

  shake(amount: number): void {
    this.shakeAmp = Math.min(0.09, this.shakeAmp + amount);
  }

  floatText(xPx: number, yPx: number, text: string): void {
    const div = document.createElement("div");
    div.className = "float-text";
    div.textContent = text;
    div.style.left = `${xPx}px`;
    div.style.top = `${yPx}px`;
    this.textLayer.appendChild(div);
    setTimeout(() => div.remove(), 950);
  }

  private kill(p: Particle): void {
    this.scene.remove(p.s);
    p.s.material.dispose();
  }

  update(dt: number, rawDt: number): void {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.kill(p);
        this.parts.splice(i, 1);
        continue;
      }
      p.s.position.addScaledVector(p.v, dt);
      p.v.y -= 6 * dt;
      p.s.material.opacity = Math.min(1, p.life / (p.max * 0.6));
    }
    for (let i = this.decals.length - 1; i >= 0; i--) {
      const d = this.decals[i];
      d.life -= dt;
      if (d.life <= 0) {
        d.s.removeFromParent();
        d.s.material.dispose();
        this.decals.splice(i, 1);
        continue;
      }
      d.s.material.opacity = Math.min(0.75, (d.life / 8) * 1.2);
    }
    if (this.shakeAmp > 0) {
      this.shakeGroup.position.set(
        (Math.random() - 0.5) * 2 * this.shakeAmp,
        (Math.random() - 0.5) * 2 * this.shakeAmp,
        0,
      );
      this.shakeGroup.rotation.z = (Math.random() - 0.5) * this.shakeAmp * 0.5;
      this.shakeAmp *= Math.exp(-6 * rawDt);
      if (this.shakeAmp < 0.002) {
        this.shakeAmp = 0;
        this.shakeGroup.position.set(0, 0, 0);
        this.shakeGroup.rotation.z = 0;
      }
    }
  }
}
