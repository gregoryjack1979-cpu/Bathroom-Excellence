import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const width of [320, 344, 360, 375, 390, 412]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const data = await page.evaluate(() => {
    const header = document.querySelector("header");
    const row = header.querySelector(":scope > div > div"); // top flex row
    const logo = header.querySelector("a[aria-label*='home']");
    const rightGroup = header.querySelector(".flex.items-center.gap-2.lg\\:hidden");
    return {
      windowInnerWidth: window.innerWidth,
      headerRect: header.getBoundingClientRect(),
      rowScrollWidth: row ? row.scrollWidth : null,
      rowClientWidth: row ? row.clientWidth : null,
      logoRect: logo ? logo.getBoundingClientRect() : null,
      rightGroupRect: rightGroup ? rightGroup.getBoundingClientRect() : null,
    };
  });
  const overflowAmount = (data.rowScrollWidth ?? 0) - (data.rowClientWidth ?? 0);
  console.log(`w=${width}: header.right=${data.headerRect.right.toFixed(0)} windowW=${data.windowInnerWidth} rowOverflow=${overflowAmount} logoRight=${data.logoRect?.right.toFixed(0)} rightGroupRight=${data.rightGroupRect?.right.toFixed(0)}`);
  await ctx.close();
}
await browser.close();
