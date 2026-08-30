import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:3100";
const dir = process.argv[3] || "/tmp";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1600); // let the loader finish

const stops = [
  ["hero", "#top"],
  ["problems", "#problems"],
  ["solutions", "#solutions"],
  ["clips", "section[aria-label='More transformations in motion']"],
  ["why-us", "#why-us"],
  ["form", "#free-estimate"],
  ["contact", "#contact"],
];
for (const [name, sel] of stops) {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ behavior: "instant", block: "start" }), sel);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/tour-${name}.png` });
}
console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
await browser.close();
