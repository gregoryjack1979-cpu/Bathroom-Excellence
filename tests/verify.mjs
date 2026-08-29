/**
 * End-to-end verification: run against a served build, e.g.
 *   npm run build && npm run start -- -p 3200 &
 *   node tests/verify.mjs http://localhost:3200 ./shots
 */
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3200";
const dir = process.argv[3] || "/tmp";
let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

/* ── Desktop: console, form, lightbox, slider ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const infos = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
    if (m.type() === "info") {
      // resolve logged objects (the lead payload) into inspectable JSON
      Promise.all(m.args().map((a) => a.jsonValue().catch(() => null)))
        .then((args) => infos.push(JSON.stringify(args)))
        .catch(() => infos.push(m.text()));
    }
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1700);
  check("home loads without console errors", errors.length === 0);

  // Lead form walkthrough → score 60 / High Priority
  await page.locator("#free-estimate").scrollIntoViewIfNeeded();
  await page.getByRole("radio", { name: "Full Bathroom Remodel" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("checkbox", { name: "Leaks" }).click();
  await page.getByRole("checkbox", { name: "Mold or mildew" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(400);
  await page.getByRole("checkbox", { name: "Glass doors" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(400);
  await page.getByRole("radio", { name: "As soon as possible" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("radio", { name: "Yes, I own my home" }).click();
  await page.waitForTimeout(500);
  await page.fill("#lead-first", "Janet");
  await page.fill("#lead-last", "Rivera");
  await page.fill("#lead-phone", "555 867 5309");
  await page.fill("#lead-email", "janet@example.com");
  await page.fill("#lead-zip", "63301");
  await page.screenshot({ path: `${dir}/v-form-step6.png` });
  await page.getByRole("button", { name: "Get My Free Estimate" }).click();
  await page.waitForTimeout(900);
  const success = await page.getByText("your estimate request is in").count();
  check("form submits to success panel", success > 0);
  const payloadLog = infos.find((t) => t.includes("leadScore"));
  check("payload logged with score 60 + High Priority",
    !!payloadLog && payloadLog.includes('"leadScore":60') && payloadLog.includes("High Priority"));
  await page.screenshot({ path: `${dir}/v-form-success.png` });

  // Validation gate: reload, try Continue on step 2 with nothing selected
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("#free-estimate").scrollIntoViewIfNeeded();
  await page.getByRole("radio", { name: "Walk-In Shower" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Continue" }).click();
  check("empty multi-select blocked with message",
    (await page.getByRole("alert").count()) > 0);

  // Gallery lightbox: open, arrow, escape
  await page.locator("#gallery").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const firstTitle = await page.locator("#gallery h3").first().textContent();
  await page.getByRole("button", { name: /Open .* in the gallery viewer/ }).first().click();
  await page.waitForTimeout(600);
  check("lightbox opens as dialog", (await page.getByRole("dialog").count()) > 0);
  await page.screenshot({ path: `${dir}/v-lightbox.png` });
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  const secondTitle = await page.getByRole("dialog").locator("h3").textContent();
  check("arrow key advances lightbox", secondTitle !== firstTitle);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  check("escape closes lightbox", (await page.getByRole("dialog").count()) === 0);

  // Gallery filter
  await page.getByRole("button", { name: "Walk-In Showers" }).click();
  await page.waitForTimeout(700);
  const cards = await page.locator("#gallery li").count();
  check("category filter narrows grid", cards > 0 && cards < 12);

  // Before/after slider: keyboard + drag
  await page.locator("#before-after").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const slider = page.getByRole("slider");
  await slider.focus();
  const v0 = await slider.getAttribute("aria-valuenow");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(300);
  const v1 = await slider.getAttribute("aria-valuenow");
  check("slider arrow key changes value", v0 !== v1);
  const box = await slider.boundingBox();
  await page.mouse.move(box.x + 1, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 300, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const v2 = await slider.getAttribute("aria-valuenow");
  check("slider drag changes value", Number(v2) < Number(v1));
  await page.screenshot({ path: `${dir}/v-before-after.png` });

  // custom cursor mounted on fine pointer
  check("custom cursor active", await page.evaluate(() =>
    document.documentElement.classList.contains("has-custom-cursor")));

  await page.close();
}

/* ── Reduced motion ── */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const tfHeight = await page.evaluate(() => document.querySelector("#transformation")?.offsetHeight ?? 0);
  check("reduced motion collapses transformation track", tfHeight > 0 && tfHeight < 2200);
  check("reduced motion disables custom cursor", await page.evaluate(() =>
    !document.documentElement.classList.contains("has-custom-cursor")));
  await page.locator("#transformation").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${dir}/v-reduced-motion.png` });
  await ctx.close();
}

/* ── Tablet + mobile ── */
for (const [name, width, height, touch] of [["tablet", 768, 1024, true], ["mobile", 375, 812, true]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: name === "mobile" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${dir}/v-${name}-hero.png` });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(700);
  check(`${name}: mobile menu opens`, (await page.getByRole("dialog", { name: "Site menu" }).count()) > 0);
  await page.screenshot({ path: `${dir}/v-${name}-menu.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await page.locator("#free-estimate").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/v-${name}-form.png` });
  check(`${name}: no page errors`, errors.length === 0);
  await ctx.close();
}

/* ── Service page + gallery page ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/services/walk-in-bathtubs`, { waitUntil: "networkidle" });
  check("service page renders h1", (await page.locator("h1").textContent()).includes("Bathe Safely"));
  await page.screenshot({ path: `${dir}/v-service.png` });
  const resp = await page.goto(`${base}/shower-remodels`, { waitUntil: "networkidle" });
  check("shower-remodels redirects home", page.url().replace(/\/$/, "") === base.replace(/\/$/, "") && resp.ok());
  await page.close();
}

await browser.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
