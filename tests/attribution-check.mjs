/**
 * Attribution end-to-end check. Run against a served build:
 *   npm run build && npm run start -- -p 3210 &
 *   node tests/attribution-check.mjs http://localhost:3210
 *
 * Proves the whole chain: land with ad parameters, browse away so the URL no
 * longer carries them, complete the estimate form, and confirm the click
 * identifier still reaches the payload the CRM webhook receives. That join is
 * what lets a signed job be traced back to the campaign that produced it.
 */
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3210";
let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : `  ${extra}`}`);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

async function walkForm(page) {
  await page.locator("#free-estimate").scrollIntoViewIfNeeded();
  await page.getByRole("radio", { name: "Full Bathroom Remodel" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("checkbox", { name: "Leaks" }).click();
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
  await page.fill("#lead-phone", "636 555 0123");
  await page.fill("#lead-email", "janet@example.com");
  await page.fill("#lead-zip", "63301");
  await page.getByRole("button", { name: "Get My Free Estimate" }).click();
  await page.waitForTimeout(1200);
}

function collectPayloads(page, sink) {
  page.on("console", (m) => {
    if (m.type() !== "info") return;
    Promise.all(m.args().map((a) => a.jsonValue().catch(() => null)))
      .then((args) => sink.push(JSON.stringify(args)))
      .catch(() => {});
  });
}

/* ── 1. Ad click, then browsing, then submit from another page ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  collectPayloads(page, logs);

  await page.goto(`${base}/?gclid=TESTCLICK123&utm_source=google&utm_campaign=bathroom-remodel-2026`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const stored = await page.evaluate(() => localStorage.getItem("be.attribution"));
  check("click id captured on landing", !!stored && stored.includes("TESTCLICK123"), stored ?? "nothing stored");

  // Browse away — the URL no longer carries the click id.
  await page.goto(`${base}/gallery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.goto(`${base}/services/full-bathroom-remodel`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const survived = await page.evaluate(() => localStorage.getItem("be.attribution"));
  check("survives navigation away from the landing URL", !!survived && survived.includes("TESTCLICK123"));

  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await walkForm(page);
  const payload = logs.find((t) => t.includes("leadScore"));
  check("payload reaches the webhook shape", !!payload);
  check("gclid present in payload", !!payload && payload.includes('"gclid":"TESTCLICK123"'), payload ?? "");
  check("utm_source present", !!payload && payload.includes('"utm_source":"google"'));
  check("utm_campaign present", !!payload && payload.includes('"utm_campaign":"bathroom-remodel-2026"'));
  check("landing page recorded", !!payload && payload.includes('"landingPage":"/"'));
  await page.close();
}

/* ── 2. Organic visitor: no ad params, no attribution keys ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  collectPayloads(page, logs);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await walkForm(page);
  const payload = logs.find((t) => t.includes("leadScore"));
  check("organic lead still submits", !!payload);
  check("no attribution keys invented for organic traffic",
    !!payload && !payload.includes("gclid") && !payload.includes("utm_source"), payload ?? "");
  await page.close();
}

/* ── 3. A later paid click overwrites an older one ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/?gclid=OLDCLICK`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.goto(`${base}/?gclid=NEWCLICK`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const stored = await page.evaluate(() => localStorage.getItem("be.attribution"));
  check("most recent paid click wins", !!stored && stored.includes("NEWCLICK") && !stored.includes("OLDCLICK"));

  // A utm-only visit must not wipe the real click id.
  await page.goto(`${base}/?utm_source=newsletter`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => localStorage.getItem("be.attribution"));
  check("utm-only visit does not erase the click id", !!after && after.includes("NEWCLICK"), after ?? "");
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} failing` : "\nall checks passed");
process.exit(failures ? 1 : 0);
