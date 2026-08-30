import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const width of [320, 360, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 700 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${process.argv[2]}/heading-w${width}.png` });
  await ctx.close();
}
await browser.close();
