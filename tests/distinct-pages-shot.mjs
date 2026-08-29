import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
const homeH1 = await page.locator("h1").first().textContent();
await page.screenshot({ path: `${process.argv[2]}/dist-home.png` });

await page.goto("http://localhost:3200/shower-remodels", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
const srH1 = await page.locator("h1").first().textContent();
await page.screenshot({ path: `${process.argv[2]}/dist-shower.png` });
await page.getByText("We'll Make Your Old Shower a Work of Art").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.screenshot({ path: `${process.argv[2]}/dist-shower-panel.png` });

console.log("Home H1:", JSON.stringify(homeH1));
console.log("Shower Remodels H1:", JSON.stringify(srH1));
console.log("distinct:", homeH1 !== srH1 ? "YES" : "NO - STILL IDENTICAL");
console.log(errors.length ? "ERRORS: " + errors.join("; ") : "no page errors");
await browser.close();
