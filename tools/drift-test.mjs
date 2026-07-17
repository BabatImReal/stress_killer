import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("[pageerror]", String(e)));
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const res = await page.evaluate(() => {
  const b = window.__game.boss;
  let hips = null;
  b.root.traverse((o) => { if (!hips && o.name.endsWith("Hips")) hips = o; });
  b.hit("torso", { x: 0, y: 0, z: 0 }, 2, 999); // force 2 => stumble
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
  for (let i = 0; i < 40; i++) {
    b["mixer"].update(0.1); // 4s of animation, deterministic
    b.root.updateMatrixWorld(true);
    const e = hips.matrixWorld.elements;
    minX = Math.min(minX, e[12]); maxX = Math.max(maxX, e[12]);
    minZ = Math.min(minZ, e[14]); maxZ = Math.max(maxZ, e[14]);
  }
  return { hipsDriftX: +(maxX - minX).toFixed(3), hipsDriftZ: +(maxZ - minZ).toFixed(3) };
});
console.log("stumble drift (m):", JSON.stringify(res));
await browser.close();
