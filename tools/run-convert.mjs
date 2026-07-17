// Drives tools/convert.html headlessly and saves the produced boss.glb.
// Usage: node tools/run-convert.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";

mkdirSync("public/models", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => console.error("[pageerror]", String(e)));

const download = page.waitForEvent("download", { timeout: 180000 });
await page.goto("http://localhost:5173/tools/convert.html");
const d = await download;
await d.saveAs("public/models/boss.glb");
console.log("saved public/models/boss.glb");
await browser.close();
