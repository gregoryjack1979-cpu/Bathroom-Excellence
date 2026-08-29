# Bathroom Excellence — Shower Remodeling Website

A production-ready, lead-generating website for Bathroom Excellence (St. Charles,
MO bathroom remodeler) — an enhanced, 3D-interactive rebuild of the original
bathroomexcellence.com — built with Next.js (App Router), TypeScript, Tailwind CSS v4 and
Framer Motion, with premium bathroom-themed interactions:

- **3D parallax hero** that responds to mouse movement (glass showcase, floating
  badges, water droplets, chrome ring)
- **Signature scroll transformation** — a pinned scene that strips an old shower
  to the studs and rebuilds it into a finished remodel as you scroll
- **Custom water-droplet cursor** with inertia trail (desktop only) and
  water-ripple / glass-flash click effects at the exact click position
- **Interactive gallery** with category filters and a keyboard/touch lightbox
- **Draggable before/after reveal** with a chrome-droplet handle (full keyboard
  support: arrows, Home/End)
- **Six-step lead wizard** with validation, automatic lead scoring, priority
  assignment and webhook delivery
- Light service pages for every nav item, contact page, privacy/terms, SEO
  metadata, LocalBusiness JSON-LD, sitemap and robots

Accessibility & performance: semantic HTML, focus traps, visible focus rings,
`prefers-reduced-motion` support everywhere (the transformation renders its
finished state, cursor/ripples/parallax switch off), no WebGL (so no WebGL
fallback needed), idle-mounted effects, statically prerendered pages.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Replace the business information

Everything brandable lives in **`config/site.ts`** — company name, phone,
email, address, service area, hours, social links, nav and SEO copy. Edit that
one file (or set the env vars below) and the whole site updates: header,
footer, JSON-LD, metadata, contact cards, form copy.

Environment overrides (see `.env.example`):

```
NEXT_PUBLIC_SITE_URL=        # canonical URL for metadata + sitemap
NEXT_PUBLIC_COMPANY_NAME=
NEXT_PUBLIC_PHONE_NUMBER=    # e.g. (636) 555-0123
NEXT_PUBLIC_EMAIL=
NEXT_PUBLIC_WEBHOOK_URL=     # where leads are POSTed
```

## Replace the imagery

The site ships with hand-drawn SVG bathroom scenes (license-free and
animation-friendly). Every image location is a **photo slot**:

1. Put your photos in `public/images/` (e.g. `public/images/hero.jpg`).
2. Map slots in `config/site.ts`:

```ts
imageSlots: {
  "hero": "/images/hero.jpg",
  "before-after-old": "/images/before.jpg",
  "before-after-new": "/images/after.jpg",
  "gallery-1": "/images/project-1.jpg",   // gallery-1 … gallery-12
},
```

All 13 slots ship pre-mapped to real project photography in `public/images/`
(extracted from the reference-site captures the owner provided) — replace any
file, or unmap a slot to fall back to its SVG scene.
Gallery titles/descriptions live in `lib/galleryData.ts`; service page copy in
`lib/servicesData.ts`.

## Leads: webhook, scoring, priority

Submissions POST a flat JSON payload to `NEXT_PUBLIC_WEBHOOK_URL` — drop in a
Zapier / Make.com / n8n webhook URL or a GoHighLevel inbound webhook and map
fields directly:

```json
{
  "firstName": "…", "lastName": "…", "phone": "…", "email": "…",
  "address": "…", "zipCode": "…",
  "projectType": "Full Bathroom Remodel",
  "currentShowerProblems": ["Leaks", "Mold or mildew"],
  "desiredFeatures": ["Glass doors"],
  "projectTimeline": "As soon as possible",
  "homeownerStatus": "Yes, I own my home",
  "leadSource": "shower-remodels-website",
  "leadScore": 60,
  "leadPriority": "High Priority",
  "submissionDate": "2026-08-29T…",
  "page": "/"
}
```

Scoring (`lib/leadScoring.ts`): homeowner **+20**; timeline ASAP **+20** /
1 month **+15** / 1–3 months **+10** / researching **+5**; project type full
remodel **+20**, shower remodel / tub-to-shower / walk-in **+15**, safety
**+10**. Priority: **40+ High**, **25–39 Medium**, **<25 Low**.

With no webhook configured, submissions log to the browser console and show
the success panel — handy for demos.

## Deploy to GitHub Pages

The repo ships with `.github/workflows/deploy-pages.yml`, which builds a fully
static export and publishes it on every push to the branch:

1. In the repo go to **Settings → Pages** and set **Source** to
   **“GitHub Actions”** (not “Deploy from a branch” — that mode serves the raw
   source through Jekyll and cannot build a Next.js app).
2. Push (or re-run the workflow from the Actions tab). The site appears at
   `https://<user>.github.io/<repo>/`.

The workflow sets `STATIC_EXPORT=1` and `BASE_PATH=/<repo>` so links, assets
and the favicon all resolve under the project subpath. On static hosting the
`/shower-remodels` nav link serves its own page (canonical → `/`) instead of a
server redirect.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
   Vercel auto-detects Next.js; no build settings needed.
3. Add the `NEXT_PUBLIC_*` environment variables in Project → Settings →
   Environment Variables.
4. Deploy, then set `NEXT_PUBLIC_SITE_URL` to your live domain and redeploy so
   metadata, sitemap and JSON-LD use the real URL.

## Verification suite

With a production server running (`npm run build && npm run start -- -p 3200`):

```bash
node tests/verify.mjs http://localhost:3200 ./shots
```

It walks the lead form end-to-end (asserting score 60 / High Priority on the
logged payload), exercises the lightbox keys, the before/after slider
(keyboard + drag), reduced-motion behavior, the mobile menu, and captures
screenshots at desktop/tablet/mobile sizes. `tests/tour.mjs` grabs
section-by-section screenshots including three stages of the scroll
transformation.
