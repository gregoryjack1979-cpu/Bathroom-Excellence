import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
const state = await page.evaluate(() => {
  const v = document.querySelector("video[src*='hero-bg']");
  return v ? { paused: v.paused, readyState: v.readyState, currentTime: v.currentTime, error: v.error?.message } : null;
});
console.log("after 3.5s, autoplay-policy relaxed:", JSON.stringify(state));
await browser.close();
