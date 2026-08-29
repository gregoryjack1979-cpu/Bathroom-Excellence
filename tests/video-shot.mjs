import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.evaluate(() => document.querySelector("video")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(1200);
const state = await page.evaluate(() => {
  const v = document.querySelector("video");
  return v ? { found: true, src: v.currentSrc, poster: v.poster, paused: v.paused } : { found: false };
});
console.log(JSON.stringify(state));
await page.screenshot({ path: process.argv[2] + "/video-band.png" });
console.log(errors.length ? "ERRORS: " + errors.join("; ") : "no page errors");
await browser.close();
