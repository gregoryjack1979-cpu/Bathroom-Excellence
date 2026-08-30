import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
await page.locator("section[aria-label='More transformations in motion']").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: process.argv[2] + "/clips-section.png" });
const found = await page.evaluate(() =>
  Array.from(document.querySelectorAll("video")).map((v) => v.currentSrc)
);
console.log("videos on page:", found);
console.log(errors.length ? "ERRORS: " + errors.join("; ") : "no page errors");
await browser.close();
