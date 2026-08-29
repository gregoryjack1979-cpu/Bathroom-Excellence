import { chromium } from "playwright";
const base = "http://localhost:3300/Bathroom-Excellence";
const dir = process.argv[2] || "/tmp";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await page.screenshot({ path: `${dir}/pages-home.png` });
// nav to gallery via the header link (verifies basePath-aware routing)
await page.getByRole("link", { name: "Gallery", exact: true }).click();
await page.waitForTimeout(1200);
console.log("gallery url:", page.url());
await page.screenshot({ path: `${dir}/pages-gallery.png` });
console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
await browser.close();
