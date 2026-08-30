import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
const hasTransformation = await page.evaluate(() => !!document.querySelector("#transformation"));
const hasHomeBeforeAfter = await page.evaluate(() => !!document.querySelector("#before-after"));
console.log("Home: #transformation present:", hasTransformation, "(should be false)");
console.log("Home: #before-after present:", hasHomeBeforeAfter, "(should be false)");
await page.locator("#top").scrollIntoViewIfNeeded();
await page.evaluate(() => document.querySelector("section[aria-labelledby='transform-checklist-heading']")?.scrollIntoView());
await page.waitForTimeout(800);
await page.screenshot({ path: process.argv[2] + "/removal-checklist.png" });

await page.goto("http://localhost:3200/gallery", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const galleryHasBeforeAfter = await page.evaluate(() => !!document.querySelector("#before-after"));
console.log("Gallery: #before-after present:", galleryHasBeforeAfter, "(should be true)");
await browser.close();
