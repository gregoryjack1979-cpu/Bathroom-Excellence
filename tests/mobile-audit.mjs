import { chromium } from "playwright";
const base = "http://localhost:3200";
const dir = process.argv[2];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

// check for horizontal scroll / overflow at each page
async function checkOverflow(label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollW: doc.scrollWidth, clientW: doc.clientWidth };
  });
  const bad = overflow.scrollW > overflow.clientW + 2;
  console.log(`${label}: scrollWidth=${overflow.scrollW} clientWidth=${overflow.clientW} ${bad ? "HORIZONTAL OVERFLOW!" : "ok"}`);
  return bad;
}

// HOME — full page, section by section
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await checkOverflow("home (top)");
await page.screenshot({ path: `${dir}/home-01-hero.png` });

const sections = [
  ["services-band", "section[aria-label='Our services']"],
  ["dark-panel", "section[aria-label='Why remodel your bathroom']"],
  ["transformation", "#transformation"],
  ["solutions", "#solutions"],
  ["before-after", "#before-after"],
  ["tub-cta", "section[aria-label*='Turn Your Old Bathtub']"],
  ["why-us", "#why-us"],
  ["reviews", "section[aria-label='Customer reviews']"],
  ["contact", "#contact"],
  ["video", "section[aria-label='Bathroom Excellence brand video']"],
  ["footer", "footer"],
];
for (const [name, sel] of sections) {
  const el = page.locator(sel).first();
  if (await el.count() === 0) { console.log(`MISSING SECTION: ${name} (${sel})`); continue; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/home-${name}.png` });
}
await checkOverflow("home (after scroll)");

console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no console/page errors on home");
await browser.close();
