import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
const shots = [
  ["copy-cards", "section[aria-label='Our services']"],
  ["copy-panel", "section[aria-label='Why remodel your bathroom']"],
  ["copy-whyus", "#why-us"],
  ["copy-reviews", "section[aria-label='Customer reviews']"],
];
for (const [name, sel] of shots) {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), sel);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${process.argv[2]}/${name}.png` });
}
await page.goto("http://localhost:3200/services/tub-to-shower-conversions", { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(() => document.querySelector("section[aria-label*='Turn Your Old Bathtub']")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(900);
await page.screenshot({ path: `${process.argv[2]}/copy-ctaband.png` });
console.log(errors.length ? "ERRORS: " + errors.join("; ") : "no page errors");
await browser.close();
