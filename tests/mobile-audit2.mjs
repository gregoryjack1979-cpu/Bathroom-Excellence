import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const dir = process.argv[2];

// footer closing bar
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await page.screenshot({ path: `${dir}/home-footer-bottom.png` });

// mobile menu open
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "Open menu" }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${dir}/mobile-menu.png` });
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// service page
await page.goto("http://localhost:3200/services/full-bathroom-remodel", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${dir}/service-page.png` });

// shower-remodels page
await page.goto("http://localhost:3200/shower-remodels", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${dir}/shower-remodels-hero.png` });
await page.evaluate(() => document.querySelector("#gallery")?.scrollIntoView());
await page.waitForTimeout(900);
await page.screenshot({ path: `${dir}/shower-remodels-gallery.png` });

// gallery page + lightbox touch swipe
await page.goto("http://localhost:3200/gallery", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${dir}/gallery-page.png` });
await page.getByRole("button", { name: /Open .* in the gallery viewer/ }).first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${dir}/gallery-lightbox-mobile.png` });

// contact page
await page.goto("http://localhost:3200/contact", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${dir}/contact-page.png` });

await browser.close();
