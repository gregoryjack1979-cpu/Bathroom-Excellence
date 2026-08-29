import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const dir = process.argv[2];

for (const width of [320, 360, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 700 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${dir}/header-w${width}.png` });
  await ctx.close();
}

// confirm video element renders on a mobile viewport now
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page2 = await ctx2.newPage();
await page2.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page2.waitForTimeout(1200);
const hasHeroVideo = await page2.evaluate(() => !!document.querySelector("video[src*='hero-bg']"));
console.log("mobile: hero video element present:", hasHeroVideo);
const videoState = await page2.evaluate(() => {
  const v = document.querySelector("video[src*='hero-bg']");
  return v ? { paused: v.paused, readyState: v.readyState, currentSrc: v.currentSrc } : null;
});
console.log("video state:", JSON.stringify(videoState));
await page2.close();

await browser.close();
