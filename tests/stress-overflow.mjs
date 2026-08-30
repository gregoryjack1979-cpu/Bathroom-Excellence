import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
let failures = 0;

// 1) Extreme narrow widths, real default font metrics
for (const width of [260, 280, 300, 320, 344, 360, 375, 390, 412]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const { scrollW, clientW, h1Text } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    h1Text: document.querySelector("h1")?.textContent,
  }));
  const bad = scrollW > clientW + 2;
  if (bad) failures++;
  console.log(`w=${width}: scrollW=${scrollW} clientW=${clientW} ${bad ? "OVERFLOW" : "ok"}`);
  await ctx.close();
}

// 2) Simulate Android font-scaling / accessibility text-size boost (up to 1.5x root font-size)
for (const scale of [1.15, 1.3, 1.5]) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.evaluate((s) => { document.documentElement.style.fontSize = `${16 * s}px`; }, scale);
  await page.waitForTimeout(500);
  const { scrollW, clientW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  const bad = scrollW > clientW + 2;
  if (bad) failures++;
  console.log(`w=360 fontScale=${scale}x: scrollW=${scrollW} clientW=${clientW} ${bad ? "OVERFLOW" : "ok"}`);
  await page.screenshot({ path: `${process.argv[2]}/stress-scale${scale}.png` });
  await ctx.close();
}

console.log(failures === 0 ? "\nNo overflow under any width or font-scale scenario" : `\n${failures} overflow(s) found`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
