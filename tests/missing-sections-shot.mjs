import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
const shots = [
  ["missing-checklist", "section[aria-labelledby='transform-checklist-heading']"],
  ["missing-ctaband", "section[aria-label*='Turn Your Old Bathtub']"],
  ["missing-footer", "footer"],
];
for (const [name, sel] of shots) {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start" }), sel);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${process.argv[2]}/${name}.png` });
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: `${process.argv[2]}/missing-bottom.png` });
console.log(errors.length ? "ERRORS: " + errors.join("; ") : "no page errors");
await browser.close();
