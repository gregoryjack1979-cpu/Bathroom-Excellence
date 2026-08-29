import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await page.locator("footer").scrollIntoViewIfNeeded();
await page.waitForTimeout(1500); // let all AnimateIn sections settle

const rects = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll("footer *").forEach((el) => {});
  const grab = (sel, label) => {
    const el = document.querySelector(sel);
    if (el) out[label] = el.getBoundingClientRect();
  };
  // footer top logo (first Logo component)
  const logos = document.querySelectorAll("footer img[alt*='crest']");
  out.crestImages = Array.from(logos).map((el, i) => ({ i, rect: el.getBoundingClientRect(), alt: el.alt }));
  const serviceAreaLi = Array.from(document.querySelectorAll("footer li")).find(li => li.textContent.includes("Service area"));
  if (serviceAreaLi) out.serviceAreaLi = serviceAreaLi.getBoundingClientRect();
  const wordmarks = document.querySelectorAll("footer span");
  return out;
});
console.log(JSON.stringify(rects, null, 2));
await page.screenshot({ path: `${SCRATCH}/footer-full.png`, fullPage: false });

// full page footer capture too
await page.screenshot({ path: `${SCRATCH}/footer-fullpage.png`, fullPage: true, clip: undefined });
await browser.close();
