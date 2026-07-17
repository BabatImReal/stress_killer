import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => console.error("[pageerror]", String(e)));
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const b = window.__game.boss;
  const actions = b["actions"];
  const out = [];
  actions.forEach((a, name) => {
    if (a.isRunning() || a.getEffectiveWeight() > 0.001)
      out.push(`${name}: running=${a.isRunning()} w=${a.getEffectiveWeight().toFixed(2)} t=${a.time.toFixed(2)}`);
  });
  return { state: b.state, current: b["currentName"], active: out, nActions: actions.size, mixerTime: b["mixer"]?.time };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
