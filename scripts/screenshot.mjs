// Dev-only: loads the running dev server, reports console errors, clicks the
// boss a few times, and saves screenshots. Usage: node scripts/screenshot.mjs <outdir>
import { chromium } from "playwright";

const outDir = process.argv[2] ?? ".";
const browser = await chromium.launch({ args: ["--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${outDir}/01-idle.png` });

// slap the boss: torso is roughly screen center
for (let i = 0; i < 5; i++) {
  await page.mouse.click(640, 380);
  await page.waitForTimeout(120);
}
await page.screenshot({ path: `${outDir}/02-hits.png` });

for (let i = 0; i < 10; i++) {
  await page.mouse.click(640, 330);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${outDir}/03-dizzy.png` });

console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join("\n")}` : "NO CONSOLE ERRORS");
await browser.close();
