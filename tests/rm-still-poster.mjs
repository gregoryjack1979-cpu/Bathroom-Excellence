import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const hasVideo = await page.evaluate(() => !!document.querySelector("video[src*='hero-bg']"));
console.log("reduced-motion mobile: hero video present:", hasVideo, hasVideo ? "FAIL (should be poster only)" : "OK");
await browser.close();
