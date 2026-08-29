import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3200/services/walk-in-bathtubs", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: process.argv[2] + "/outline-service.png" });
await browser.close();
