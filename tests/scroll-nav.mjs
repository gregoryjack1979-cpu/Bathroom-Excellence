import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
// scroll to the footer, then click "Shower Remodels" in the footer services list
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await page.locator("footer").getByRole("link", { name: "Shower Remodels" }).click();
await page.waitForTimeout(1500);
const y1 = await page.evaluate(() => window.scrollY);
console.log("after footer nav to /shower-remodels: scrollY =", y1, y1 < 50 ? "OK" : "FAIL");
// same via the header nav from mid-page
await page.evaluate(() => window.scrollTo(0, 3000));
await page.waitForTimeout(500);
await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Gallery" }).click();
await page.waitForTimeout(1500);
const y2 = await page.evaluate(() => window.scrollY);
console.log("after header nav to /gallery: scrollY =", y2, y2 < 50 ? "OK" : "FAIL");
// hash link still works: from /gallery click Get a Free Estimate -> /#free-estimate
await page.getByRole("banner").getByRole("link", { name: "Get a Free Estimate" }).click();
await page.waitForTimeout(1800);
const y3 = await page.evaluate(() => window.scrollY);
const formVisible = await page.locator("#free-estimate").evaluate((el) => {
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.top < 400;
});
console.log("after CTA to /#free-estimate: scrollY =", y3, "form near top:", formVisible ? "OK" : "FAIL");
await browser.close();
