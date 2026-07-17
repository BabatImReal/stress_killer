import * as THREE from "three";
import type { Zone } from "../boss/Boss";

export interface HitInfo {
  zone: Zone;
  point: THREE.Vector3;
  object: THREE.Mesh;
}

export class Pointer {
  lookYaw = 0;
  lookPitch = 0.07;
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();

  constructor(
    private dom: HTMLElement,
    private camera: THREE.PerspectiveCamera,
    private targets: () => THREE.Object3D[],
    private onPress: (hit: HitInfo | null) => void,
  ) {
    dom.addEventListener("pointermove", (e) => this.onMove(e));
    dom.addEventListener("pointerdown", (e) => this.onDown(e));
  }

  private setNdc(e: PointerEvent): void {
    this.ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  }

  private cast(): HitInfo | null {
    this.ray.setFromCamera(this.ndc, this.camera);
    const hits = this.ray.intersectObjects(this.targets(), false);
    if (hits.length === 0) return null;
    const h = hits[0];
    return {
      zone: (h.object.userData.zone ?? "torso") as Zone,
      point: h.point,
      object: h.object as THREE.Mesh,
    };
  }

  private onMove(e: PointerEvent): void {
    this.setNdc(e);
    this.lookYaw = -this.ndc.x * 0.3;
    this.lookPitch = 0.07 + this.ndc.y * 0.14;
    this.dom.style.cursor = this.cast() ? "pointer" : "crosshair";
  }

  private onDown(e: PointerEvent): void {
    this.setNdc(e);
    this.onPress(this.cast());
  }
}
