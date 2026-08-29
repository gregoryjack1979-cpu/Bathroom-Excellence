import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const dir = process.argv[2];
let failures = 0;
const check = (name, cond) => { console.log(`${cond ? "PASS" : "FAIL"}  ${name}`); if (!cond) failures++; };

await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);

// tap through the wizard using real touch taps
await page.locator("#free-estimate").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.getByRole("radio", { name: "Full Bathroom Remodel" }).tap();
await page.waitForTimeout(900);
check("advanced to step 2 after tap", (await page.getByText("What issues are you experiencing?").count()) > 0);

await page.getByRole("checkbox", { name: "Leaks" }).tap();
await page.getByRole("button", { name: "Continue" }).tap();
await page.waitForTimeout(400);
await page.getByRole("checkbox", { name: "Glass doors" }).tap();
await page.getByRole("button", { name: "Continue" }).tap();
await page.waitForTimeout(400);
check("reached timeline step", (await page.getByText("When are you planning").count()) > 0);
await page.getByRole("radio", { name: "As soon as possible" }).tap();
await page.waitForTimeout(500);
await page.getByRole("radio", { name: "Yes, I own my home" }).tap();
await page.waitForTimeout(900);
check("reached contact step", (await page.locator("#lead-first").count()) > 0);
await page.screenshot({ path: `${dir}/touch-step6.png` });

// fill via tap+type (mobile keyboard flow)
await page.locator("#lead-first").tap();
await page.locator("#lead-first").fill("Janet");
await page.locator("#lead-last").tap();
await page.locator("#lead-last").fill("Rivera");
await page.locator("#lead-phone").tap();
await page.locator("#lead-phone").fill("5558675309");
await page.locator("#lead-email").tap();
await page.locator("#lead-email").fill("janet@example.com");
await page.locator("#lead-zip").tap();
await page.locator("#lead-zip").fill("63301");
await page.getByRole("button", { name: "Get My Free Estimate" }).tap();
await page.waitForTimeout(900);
check("form submitted via touch to success panel", (await page.getByText("your estimate request is in").count()) > 0);
await page.screenshot({ path: `${dir}/touch-success.png` });

// before/after slider: touch drag
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.locator("#before-after").scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const slider = page.locator("#before-after").getByRole("slider");
const box = await slider.boundingBox();
const container = await page.locator("#before-after .chrome-edge").boundingBox();
console.log("slider box:", box, "container:", container);
const v0 = await slider.getAttribute("aria-valuenow");
// simulate touch drag via touchscreen API
await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(container.x + 40, box.y + box.height / 2, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(400);
const v1 = await slider.getAttribute("aria-valuenow");
check("before/after slider draggable on mobile", v0 !== v1);
await page.screenshot({ path: `${dir}/touch-slider.png` });

await browser.close();
console.log(failures === 0 ? "\nALL TOUCH CHECKS PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
