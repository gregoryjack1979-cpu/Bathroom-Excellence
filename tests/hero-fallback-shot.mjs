import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const p1 = await rm.newPage();
await p1.goto("http://localhost:3200", { waitUntil: "networkidle" });
await p1.waitForTimeout(900);
const hasVideoTag = await p1.evaluate(() => !!document.querySelector("video[src*=\"hero-bg\"]"));
console.log("reduced-motion: video element present:", hasVideoTag, hasVideoTag ? "FAIL (should use poster img)" : "OK");
await p1.screenshot({ path: process.argv[2] + "/hero-rm.png" });
await rm.close();

const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p2 = await mob.newPage();
await p2.goto("http://localhost:3200", { waitUntil: "networkidle" });
await p2.waitForTimeout(1700);
const mobHasVideo = await p2.evaluate(() => !!document.querySelector("video[src*=\"hero-bg\"]"));
console.log("mobile: video element present:", mobHasVideo, mobHasVideo ? "FAIL (should use poster img)" : "OK");
await p2.screenshot({ path: process.argv[2] + "/hero-mobile.png" });
await mob.close();

await browser.close();
