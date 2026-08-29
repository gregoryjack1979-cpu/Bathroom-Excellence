import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.waitForTimeout(1700);
const links = await page.getByRole("link", { name: /Book (Appointment Now|an Appointment)/ }).all();
let ok = 0;
for (const l of links) {
  const href = await l.getAttribute("href");
  const target = await l.getAttribute("target");
  if (href === "https://www.bathroomexcellence.com/book" && target === "_blank") ok++;
  else console.log("BAD:", href, target);
}
console.log(`booking links on homepage: ${links.length}, correctly wired: ${ok}`);
await page.screenshot({ path: process.argv[2] + "/book-hero.png" });
await browser.close();
