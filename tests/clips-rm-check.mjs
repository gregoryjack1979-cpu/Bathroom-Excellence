import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const hasVideo = await page.evaluate(() => !!document.querySelector("section[aria-label='More transformations in motion'] video"));
console.log("reduced-motion: clip videos present:", hasVideo, hasVideo ? "FAIL" : "OK (poster only)");
await browser.close();
