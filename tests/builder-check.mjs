/**
 * Bathroom Design Builder — functional checks against a served build.
 *   npm run build && npm run start -- -p 3200 &
 *   node tests/builder-check.mjs http://localhost:3200 ./shots
 */
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3200";
const dir = process.argv[3] || "/tmp";
const URL = `${base}/design-builder`;
let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

/** src of a preview layer slot by id (null when hidden) */
const layerSrc = (page, id) =>
  page.evaluate((id) => {
    const slots = [...document.querySelectorAll('[role="img"][aria-label^="Bathroom preview"] > div')];
    const order = ["room", "wall", "grout", "accent", "window", "base", "fixtures", "spout", "storage", "safety", "door"];
    const slot = slots[order.indexOf(id)];
    const img = slot?.querySelector("img");
    return img ? img.getAttribute("src").split("/assets/")[1] : null;
  }, id);

const summaryValue = (page, title) =>
  page.evaluate((title) => {
    const dt = [...document.querySelectorAll("section[aria-labelledby='builder-summary-heading'] dt")].find((d) => d.textContent.trim() === title);
    return dt?.nextElementSibling?.textContent.trim() ?? null;
  }, title);

const currentStepHeading = (page) => page.locator("#builder-step-heading").textContent();
const pick = (page, name) => page.locator("[role='group'] button", { hasText: name }).first().click();

/* ── Desktop: state, preview, rules, navigation ── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  check("builder loads without console errors", errors.length === 0);
  check("fallback room shows before any choice", (await layerSrc(page, "room")) === "rooms/grey-room.jpg");
  check("empty-state nudge visible", (await page.getByText("Start with Step 1").count()) > 0);
  check("starts on step 1", (await currentStepHeading(page)).includes("Bathroom Type"));
  await page.screenshot({ path: `${dir}/builder-01-empty.png` });

  // Step 1: bathroom type → base layer + summary
  await pick(page, "Shower");
  await page.waitForTimeout(500);
  check("selecting Shower adds the base layer", (await layerSrc(page, "base")) === "bathroom-types/shower.png");
  check("summary reflects bathroom type", (await summaryValue(page, "Bathroom Type")) === "Shower");
  check("nudge disappears after first choice", (await page.getByText("Start with Step 1").count()) === 0);

  // Next → Step 2 room
  await page.getByRole("button", { name: /^Next:/ }).click();
  await page.waitForTimeout(400);
  check("Next advances to Room", (await currentStepHeading(page)).includes("Room Environment"));
  await pick(page, "Blue Room");
  await page.waitForTimeout(500);
  check("room background swaps to blue", (await layerSrc(page, "room")) === "rooms/blue-room.jpg");

  // Step 3: subway tile → step 4 shows only subway/decorative styles
  await page.getByRole("button", { name: /^Next:/ }).click();
  await pick(page, "Subway Tile");
  await page.waitForTimeout(400);
  check("wall type recorded", (await summaryValue(page, "Bathwall Type")) === "Subway Tile");
  check("grout defaults to silver once a tile type is chosen", (await summaryValue(page, "Grout Color")) === "Silver Grout");
  await page.getByRole("button", { name: /^Next:/ }).click();
  await page.waitForTimeout(400);
  const styleNames = await page.locator("[role='group'] button").allTextContents();
  check("wall-design step filters to subway patterns", styleNames.some((t) => t.includes("Herringbone")) && !styleNames.some((t) => t.includes("Calcutta Gold")));
  await pick(page, "Herringbone");
  await page.waitForTimeout(600);
  check("wall layer set for subway", (await layerSrc(page, "wall")) === "walls/subway/white-tile.png");
  check("grout layer follows pattern + colour", (await layerSrc(page, "grout")) === "walls/grout/herringbone-silver.png");

  // Step 5: grout applicable → choose black
  await page.getByRole("button", { name: /^Next:/ }).click();
  await page.waitForTimeout(300);
  check("grout step is shown for subway", (await currentStepHeading(page)).includes("Grout"));
  await pick(page, "Black Grout");
  await page.waitForTimeout(500);
  check("black grout repaints the grout layer", (await layerSrc(page, "grout")) === "walls/grout/herringbone-black.png");
  await page.screenshot({ path: `${dir}/builder-02-subway.png` });

  // Rule: switching to Smooth clears grout + incompatible style, grout step becomes N/A and is skipped
  await page.locator("nav[aria-label='Design steps'] ol.hidden button, nav[aria-label='Design steps'] ol:not(.hidden) button", { hasText: "Bathwall Type" }).first().click();
  await page.waitForTimeout(300);
  await pick(page, "Smooth");
  await page.waitForTimeout(500);
  check("Smooth resets grout to null", (await summaryValue(page, "Grout Color")) === "Not applicable");
  check("Smooth clears the now-incompatible Herringbone style", (await summaryValue(page, "Wall Design")) === "Not chosen");
  check("grout layer removed", (await layerSrc(page, "grout")) === null);
  await page.getByRole("button", { name: /^Next:/ }).click(); // → wall design
  await pick(page, "Sandstone");
  await page.waitForTimeout(500);
  check("smooth + sandstone wall layer", (await layerSrc(page, "wall")) === "walls/smooth/sandstone.png");
  await page.getByRole("button", { name: /^Next:/ }).click(); // should skip grout → door
  await page.waitForTimeout(300);
  check("Next skips the not-applicable grout step", (await currentStepHeading(page)).includes("Door"));
  await page.getByRole("button", { name: "← Back" }).click();
  await page.waitForTimeout(300);
  check("Back also skips the grout step", (await currentStepHeading(page)).includes("Wall Design"));

  // Illusions type auto-selects its single style
  await page.getByRole("button", { name: "← Back" }).click();
  await pick(page, "Illusions Calcutta Gold");
  await page.waitForTimeout(500);
  check("Illusions type auto-selects its only style", (await summaryValue(page, "Wall Design")) === "Calcutta Gold");
  check("marble wall layer resolved", (await layerSrc(page, "wall")) === "walls/marble/calcutta-gold.png");

  // Door + trim + hardware follows trim
  await page.getByRole("button", { name: /^Next:/ }).click(); // wall design (auto)
  await page.getByRole("button", { name: /^Next:/ }).click(); // door (grout skipped)
  await pick(page, "Sliding Glass Door");
  await page.waitForTimeout(500);
  check("door layer defaults to chrome hardware before trim is chosen", (await layerSrc(page, "door")) === "doors/sliding-glass-chrome.png");
  await page.getByRole("button", { name: /^Next:/ }).click(); // trim
  await pick(page, "Matte Black");
  await page.waitForTimeout(600);
  check("fixtures layer takes the finish", (await layerSrc(page, "fixtures")) === "fixtures/matte-black.png");
  check("door hardware follows the finish", (await layerSrc(page, "door")) === "doors/sliding-glass-matte-black.png");

  // Storage / accent / window / safety
  await page.getByRole("button", { name: /^Next:/ }).click();
  await pick(page, "Tower Caddy");
  await page.getByRole("button", { name: /^Next:/ }).click();
  await pick(page, "Add Accent");
  await page.getByRole("button", { name: /^Next:/ }).click();
  await pick(page, "Acrylic Window");
  await page.getByRole("button", { name: /^Next:/ }).click();
  await pick(page, "Grab Bar");
  await page.waitForTimeout(600);
  check("storage layer", (await layerSrc(page, "storage")) === "storage/tower-caddy.png");
  check("accent layer", (await layerSrc(page, "accent")) === "accents/decorative-accent.png");
  check("window layer", (await layerSrc(page, "window")) === "windows/acrylic-window.png");
  check("grab bar follows the finish", (await layerSrc(page, "safety")) === "safety/grab-bar-matte-black.png");
  check("last step shows Review instead of Next", (await page.getByRole("button", { name: /Review Design/ }).count()) === 1);
  const progress = await page.locator("[role='progressbar']").getAttribute("aria-valuenow");
  check("all 10 applicable steps complete (grout N/A)", progress === "10" && (await page.locator("[role='progressbar']").getAttribute("aria-valuemax")) === "10");
  await page.screenshot({ path: `${dir}/builder-03-complete.png` });

  // Rule: bathtub forces door to none and disables the glass door card
  await page.locator("nav[aria-label='Design steps'] button", { hasText: "Bathroom Type" }).first().click();
  await pick(page, "Bathtub");
  await page.waitForTimeout(500);
  check("bathtub forces door to No Door", (await summaryValue(page, "Shower Door")) === "No Door");
  check("door layer removed for bathtub", (await layerSrc(page, "door")) === null);
  check("tub spout appears in the chosen finish", (await layerSrc(page, "spout")) === "fixtures/tub-spout-matte-black.png");
  await page.locator("nav[aria-label='Design steps'] button", { hasText: "Shower Door" }).first().click();
  await page.waitForTimeout(300);
  const glassCard = page.locator("[role='group'] button", { hasText: "Sliding Glass Door" });
  check("glass door card disabled with a reason", (await glassCard.isDisabled()) && (await glassCard.textContent()).includes("Not available with a bathtub"));

  // Export → real download with labels
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export" }).click()]);
  const path = await download.path();
  const json = JSON.parse(await (await import("node:fs/promises")).readFile(path, "utf8"));
  check("export filename dated", /^bathroom-design-\d{4}-\d{2}-\d{2}\.json$/.test(download.suggestedFilename()));
  check("export has readable labels", json.design.bathroomType === "Bathtub" && json.design.wallStyle === "Calcutta Gold" && json.design.trimColor === "Matte Black");
  check("export has raw ids", json.selections.wallType === "illusions-calcutta-gold" && json.selections.decorativeAccent === true);
  check("export marks grout not applicable", json.design.groutColor === "Not applicable");

  // Save, then reload → restore prompt (draft) → restore
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(400);
  check("save toast", (await page.getByText("Design saved").count()) > 0);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const dialog = page.getByRole("dialog");
  check("reload offers to restore the draft", (await dialog.count()) === 1 && (await dialog.textContent()).includes("Restore your previous design"));
  await page.getByRole("button", { name: "Restore design" }).click();
  await page.waitForTimeout(800);
  check("restored design keeps selections", (await summaryValue(page, "Hardware Finish")) === "Matte Black" && (await layerSrc(page, "base")) === "bathroom-types/bathtub.png");

  // Reset → confirm → back to step 1, empty
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("button", { name: "Reset design" }).click();
  // the old base layer fades out for 350ms before it leaves the DOM
  await page
    .waitForFunction(() => {
      const slots = document.querySelectorAll('[role="img"][aria-label^="Bathroom preview"] > div');
      return !slots[5]?.querySelector("img");
    }, null, { timeout: 3000 })
    .catch(() => {});
  check("reset clears the design", (await summaryValue(page, "Bathroom Type")) === "Not chosen" && (await layerSrc(page, "base")) === null);
  check("reset returns to step 1", (await currentStepHeading(page)).includes("Bathroom Type"));

  // Load brings the explicitly saved design back
  await page.getByRole("button", { name: "Load" }).click();
  await page.waitForTimeout(600);
  check("load restores the saved design", (await summaryValue(page, "Wall Design")) === "Calcutta Gold");

  // Reload after a reset-then-load: draft equals loaded design → prompt again; decline → fresh
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("button", { name: "Reset design" }).click();
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  check("no restore prompt after a reset (draft cleared)", (await page.getByRole("dialog").count()) === 0);

  check("no console/page errors through the whole flow", errors.length === 0);
  if (errors.length) console.log(errors.join("\n"));
  await ctx.close();
}

/* ── Reduced motion: still fully usable ── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await pick(page, "Seated Shower");
  await page.waitForTimeout(300);
  check("reduced motion: selection still updates preview", (await layerSrc(page, "base")) === "bathroom-types/seated-shower.png");
  await ctx.close();
}

/* ── Mobile: layout, no overflow, sheet ── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const doc = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  check("mobile: no horizontal overflow", doc.s <= doc.c + 1);
  const previewTop = await page.locator("[role='img'][aria-label^='Bathroom preview']").boundingBox();
  const panelTop = await page.locator("#builder-step-heading").boundingBox();
  check("mobile: preview sits above the steps", previewTop && panelTop && previewTop.y < panelTop.y);
  await page.locator("[role='group'] button", { hasText: "Bathtub" }).first().tap();
  await page.waitForTimeout(400);
  check("mobile: tap selects", (await layerSrc(page, "base")) === "bathroom-types/bathtub.png");
  await page.getByRole("button", { name: /Your Bathroom Design/ }).tap();
  await page.waitForTimeout(500);
  check("mobile: summary sheet opens", (await page.locator("#builder-summary-sheet").count()) === 1);
  await page.screenshot({ path: `${dir}/builder-04-mobile.png` });
  // scroll to bottom; preview should stay pinned under the header
  await page.getByRole("button", { name: /Your Bathroom Design/ }).tap();
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(500);
  const pinned = await page.locator("[role='img'][aria-label^='Bathroom preview']").boundingBox();
  check("mobile: preview stays pinned while scrolling", pinned && pinned.y >= 60 && pinned.y < 120);
  check("mobile: no page errors", errors.length === 0);
  await ctx.close();
}

await browser.close();
console.log(failures === 0 ? "\nALL BUILDER CHECKS PASSED" : `\n${failures} BUILDER CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
