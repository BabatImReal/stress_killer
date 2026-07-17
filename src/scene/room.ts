import * as THREE from "three";

function box(
  w: number, h: number, d: number, color: number,
  x: number, y: number, z: number, parent: THREE.Object3D,
): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color }),
  );
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function windowTex(): THREE.CanvasTexture {
  return canvasTex(256, 256, (x) => {
    const sky = x.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, "#ffd98a");
    sky.addColorStop(0.6, "#ffab6b");
    sky.addColorStop(1, "#ff8f5e");
    x.fillStyle = sky;
    x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#fff3d0";
    x.beginPath();
    x.arc(165, 95, 34, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#5a4a63";
    const heights = [70, 110, 55, 95, 80, 120, 65];
    heights.forEach((bh, i) => x.fillRect(i * 38 - 5, 256 - bh, 34, bh));
    x.fillStyle = "#ffd98a";
    for (let i = 0; i < 26; i++) {
      x.fillRect(8 + Math.floor(Math.random() * 240), 160 + Math.floor(Math.random() * 88), 5, 7);
    }
  });
}

function posterTex(): THREE.CanvasTexture {
  return canvasTex(256, 384, (x) => {
    x.fillStyle = "#c0392b";
    x.fillRect(0, 0, 256, 384);
    x.strokeStyle = "#fffdf5";
    x.lineWidth = 8;
    x.strokeRect(14, 14, 228, 356);
    x.fillStyle = "#fffdf5";
    x.textAlign = "center";
    x.font = "bold 92px Trebuchet MS";
    x.fillText("KPI", 128, 150);
    x.font = "bold 52px Trebuchet MS";
    x.fillText("IS LIFE", 128, 230);
    x.fillStyle = "#ffd23d";
    x.font = "80px Trebuchet MS";
    x.fillText("★", 128, 330);
  });
}

function clockTex(): THREE.CanvasTexture {
  return canvasTex(128, 128, (x) => {
    x.fillStyle = "#fffdf5";
    x.beginPath();
    x.arc(64, 64, 60, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = "#3a3a3a";
    x.lineWidth = 5;
    x.stroke();
    x.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      x.beginPath();
      x.moveTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50);
      x.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56);
      x.stroke();
    }
    // 7:05 pm — still at the office
    x.lineWidth = 6;
    x.beginPath();
    x.moveTo(64, 64);
    x.lineTo(64 + Math.cos(1.86) * 30, 64 + Math.sin(1.86) * 30);
    x.stroke();
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(64, 64);
    x.lineTo(64 + Math.cos(-0.99) * 46, 64 + Math.sin(-0.99) * 46);
    x.stroke();
  });
}

function screenTex(): THREE.CanvasTexture {
  return canvasTex(128, 96, (x) => {
    x.fillStyle = "#243447";
    x.fillRect(0, 0, 128, 96);
    x.strokeStyle = "#3d5470";
    x.lineWidth = 2;
    for (let i = 1; i < 6; i++) {
      x.beginPath();
      x.moveTo(6, i * 15);
      x.lineTo(122, i * 15);
      x.stroke();
    }
    x.fillStyle = "#ff5f4d";
    x.font = "bold 26px Trebuchet MS";
    x.fillText("KPI ↓", 12, 34);
    x.fillStyle = "#7fd48a";
    x.fillRect(70, 55, 44, 26);
  });
}

export function createRoom(scene: THREE.Scene): void {
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x9fb2c4 });
  const room = new THREE.Group();
  scene.add(room);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 6.6),
    new THREE.MeshLambertMaterial({ color: 0xb08d63 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -1.1;
  floor.receiveShadow = true;
  room.add(floor);

  const mkWall = (w: number, h: number): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    m.receiveShadow = true;
    room.add(m);
    return m;
  };
  const back = mkWall(6.4, 3);
  back.position.set(0, 1.5, -4.4);
  const left = mkWall(6.6, 3);
  left.rotation.y = Math.PI / 2;
  left.position.set(-3.2, 1.5, -1.1);
  const right = mkWall(6.6, 3);
  right.rotation.y = -Math.PI / 2;
  right.position.set(3.2, 1.5, -1.1);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.6), new THREE.MeshLambertMaterial({ color: 0xf4efe6 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 3, -1.1);
  room.add(ceiling);

  // Sunset window on the left wall
  const win = new THREE.Group();
  win.position.set(-3.18, 1.85, -1.4);
  win.rotation.y = Math.PI / 2;
  room.add(win);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 1.25),
    new THREE.MeshBasicMaterial({ map: windowTex() }),
  );
  win.add(glass);
  box(1.84, 0.09, 0.06, 0xf4efe6, 0, 0.66, 0, win);
  box(1.84, 0.09, 0.06, 0xf4efe6, 0, -0.66, 0, win);
  box(0.09, 1.4, 0.06, 0xf4efe6, -0.88, 0, 0, win);
  box(0.09, 1.4, 0.06, 0xf4efe6, 0.88, 0, 0, win);
  box(0.06, 1.3, 0.05, 0xf4efe6, 0, 0, 0.005, win);

  // Motivational poster right behind the boss
  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 1.05),
    new THREE.MeshLambertMaterial({ map: posterTex() }),
  );
  poster.position.set(0.95, 1.8, -4.39);
  room.add(poster);

  // Wall clock stuck at overtime
  const clockBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.05, 24),
    new THREE.MeshLambertMaterial({ color: 0x3a3a3a }),
  );
  clockBody.rotation.x = Math.PI / 2;
  clockBody.position.set(-1.5, 2.45, -4.37);
  room.add(clockBody);
  const clockFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.34),
    new THREE.MeshBasicMaterial({ map: clockTex(), transparent: true }),
  );
  clockFace.position.set(-1.5, 2.45, -4.34);
  room.add(clockFace);

  // Bookshelf in the back corner
  const shelf = new THREE.Group();
  shelf.position.set(-2.35, 0, -4.2);
  room.add(shelf);
  box(1.15, 1.95, 0.3, 0x7a5a44, 0, 0.975, 0, shelf);
  const bookColors = [0xd9483b, 0x4a7fb5, 0x7fb069, 0xe8b23d, 0x8e6fb0, 0xd97b3b];
  for (let row = 0; row < 3; row++) {
    box(1.05, 0.045, 0.26, 0x5f4433, 0, 0.42 + row * 0.55, 0.03, shelf);
    let bx = -0.46;
    while (bx < 0.42) {
      const bw = 0.07 + Math.random() * 0.05;
      const bhh = 0.3 + Math.random() * 0.14;
      box(bw, bhh, 0.2, bookColors[Math.floor(Math.random() * bookColors.length)], bx + bw / 2, 0.44 + row * 0.55 + bhh / 2, 0.04, shelf);
      bx += bw + 0.015;
    }
  }

  // Office plant
  const plant = new THREE.Group();
  plant.position.set(2.55, 0, -3.6);
  room.add(plant);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.15, 0.34, 12),
    new THREE.MeshLambertMaterial({ color: 0xc96f43 }),
  );
  pot.position.y = 0.17;
  pot.castShadow = true;
  plant.add(pot);
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x4a9e5c });
  const leaf1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), leafMat);
  leaf1.position.y = 0.68;
  leaf1.castShadow = true;
  plant.add(leaf1);
  const leaf2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), new THREE.MeshLambertMaterial({ color: 0x5cb86e }));
  leaf2.position.set(0.12, 0.95, 0.05);
  leaf2.castShadow = true;
  plant.add(leaf2);

  // Player's desk in the foreground (props double as future ammo)
  const desk = new THREE.Group();
  room.add(desk);
  box(1.9, 0.06, 0.75, 0xc59a6d, 0, 0.76, -0.85, desk);
  const monitor = new THREE.Group();
  monitor.position.set(-0.62, 0.79, -1.0);
  monitor.rotation.y = 0.35;
  desk.add(monitor);
  box(0.1, 0.16, 0.1, 0x3a3a3a, 0, 0.08, 0, monitor);
  box(0.62, 0.4, 0.04, 0x2a2a2a, 0, 0.42, 0, monitor);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.34),
    new THREE.MeshBasicMaterial({ map: screenTex() }),
  );
  screen.position.set(0, 0.42, 0.021);
  monitor.add(screen);
  box(0.42, 0.03, 0.16, 0xe8e2d4, -0.05, 0.8, -0.72, desk);
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.045, 0.11, 12),
    new THREE.MeshLambertMaterial({ color: 0xd9483b }),
  );
  mug.position.set(0.55, 0.845, -0.75);
  mug.castShadow = true;
  desk.add(mug);
  for (let i = 0; i < 3; i++) {
    const p = box(0.28, 0.005, 0.36, 0xfdfdf8, 0.28 + i * 0.015, 0.795 + i * 0.006, -0.98, desk);
    p.rotation.y = (Math.random() - 0.5) * 0.4;
  }
  const stapler = box(0.16, 0.05, 0.06, 0xd9483b, 0.72, 0.815, -0.95, desk);
  stapler.rotation.y = 0.5;

  // Warm evening light from the window side
  scene.add(new THREE.HemisphereLight(0xfff1dd, 0x4a4038, 0.9));
  const sun = new THREE.DirectionalLight(0xffd2a0, 2.4);
  sun.position.set(-2.6, 3.1, 1.6);
  sun.target.position.set(0.3, 1, -2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera;
  sc.left = -4;
  sc.right = 4;
  sc.top = 4;
  sc.bottom = -1;
  sc.near = 0.5;
  sc.far = 14;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);
}
