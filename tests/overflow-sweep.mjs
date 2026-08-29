import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const pages = [
  "/", "/gallery", "/contact", "/shower-remodels", "/privacy-policy", "/terms",
  "/services/tub-to-shower-conversions", "/services/full-bathroom-remodel",
  "/services/bathtubs-and-more", "/services/walk-in-bathtubs",
  "/services/bath-wall-systems", "/services/bathroom-safety",
];
let failures = 0;
for (const width of [320, 375, 390, 414]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const path of pages) {
    await page.goto(`http://localhost:3200${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    const bad = scrollW > clientW + 2;
    if (bad) { failures++; console.log(`OVERFLOW  w=${width} ${path}  scrollWidth=${scrollW} clientWidth=${clientW}`); }
  }
  await ctx.close();
}
console.log(failures === 0 ? "\nNo horizontal overflow on any page at 320/375/390/414px" : `\n${failures} overflow(s) found`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
