# Bathroom Design Builder

An interactive bathroom/shower configurator built into this site at
**`/design-builder`**. A sales rep (or a homeowner) walks through eleven
steps — bathroom type, room, wall panels, grout, door, hardware finish,
storage, accent, window, safety — and a layered preview updates with every
choice. Designs can be saved to the browser, restored after a reload, and
exported as JSON.

It is frontend-only by design. There is no backend, login, pricing, CRM or
payment code; the structure leaves clear seams for all of those (see
[Where future integrations go](#where-future-integrations-go)).

## Run it

```bash
npm install
npm run dev              # http://localhost:3000/design-builder
```

Production / static export work exactly as for the rest of the site (see the
main README). The builder is a fully static route — everything runs in the
browser.

Functional checks (55 assertions: state, rules, navigation, storage, export,
mobile):

```bash
npm run build && npm run start -- -p 3200 &
node tests/builder-check.mjs http://localhost:3200 ./shots
```

## Folder structure

The brief suggested `/data`, `/types`, `/hooks` at the repo root; this repo
already keeps shared code under `lib/` and UI under `components/`, so the
builder follows that convention with a `builder/` namespace. Everything is
self-contained — it could be lifted into its own app by moving these folders.

```
app/design-builder/page.tsx          route + metadata (renders <Configurator/>)

lib/builder/
  types.ts                           option ids, Configuration, StepDefinition, PreviewLayer
  configuratorData.ts                EVERY option, in walkthrough order  ← edit this to change choices
  rules.ts                           compatibility rules, step status, human-readable labels
  previewLayers.ts                   Configuration → ordered image layers (the preview engine's brain)
  storage.ts                         localStorage save/load/draft + JSON export
  useConfigurator.tsx                React context + reducer: the central configuration state

components/builder/
  Configurator.tsx                   layout shell (providers, desktop/mobile arrangement, restore prompt)
  BuilderHeader.tsx                  app bar: logo, title, Save / Load / Export / Reset
  ProgressBar.tsx                    "Step 3 of 11" + segmented progress
  StepNavigation.tsx                 clickable step list (checklist on desktop, chips on mobile)
  StepPanel.tsx                      the current step's options + Back / Next
  OptionCard.tsx / OptionGrid.tsx    reusable selectable card + responsive grid
  BathroomPreview.tsx                the layered, cross-fading preview stage
  ConfigurationSummary.tsx           live summary (card on desktop, bottom sheet on mobile)
  SaveDesign.tsx / ExportDesign.tsx / ResetButton.tsx
  BuilderUi.tsx / ConfirmDialog.tsx / Toast.tsx / ActionButton.tsx

public/assets/                       all imagery (see below)
scripts/generate-builder-placeholders.py   regenerates the placeholder art
tests/builder-check.mjs              Playwright checks
```

## How the preview works

The preview is a stack of absolutely-positioned images on one fixed
**1600 × 1200 (4:3)** stage. `resolvePreviewLayers(configuration)` in
`lib/builder/previewLayers.ts` returns one slot per product category:

| z   | slot       | image comes from                                   |
| --- | ---------- | -------------------------------------------------- |
| 0   | room       | `roomThemes[].background` (grey until chosen)      |
| 10  | wall       | `walls/<folder>/<style>.png` (subway: one white field) |
| 20  | grout      | `walls/grout/<pattern>-<colour>.png`               |
| 30  | accent     | `accentOptions[].layer`                            |
| 40  | window     | `windowOptions[].layer`                            |
| 50  | base       | `bathroomTypes[].layer` (pan / tub / seat)         |
| 60  | fixtures   | `trimColors[].fixturesLayer`                       |
| 62  | spout      | `trimColors[].spoutLayer` (bathtub only)           |
| 70  | storage    | `storageOptions[].layer`                           |
| 80  | safety     | `safetyOptions[].layerByTrim[trim]` or `.layer`    |
| 90  | door       | `doorTypes[].layerByTrim[trim]`                    |

`BathroomPreview.tsx` knows nothing about bathrooms: it renders whatever
slots come back, and when a slot's `src` changes it cross-fades the old
image out and the new one in. Hardware layers (door rail, grab bar, spout)
are keyed by the trim finish, so one finish choice repaints all of them.

## Replacing the placeholder images

Every image is a placeholder drawn by `scripts/generate-builder-placeholders.py`.
Replace any of them by dropping a real file at the **same path** — no code
changes needed.

**Preview layers** (`public/assets/rooms`, `bathroom-types`, `walls`, `doors`,
`fixtures`, `storage`, `accents`, `windows`, `safety`):

- Must be **1600 × 1200**. Rooms are opaque JPGs; every other layer is a PNG
  with transparency everywhere except the product.
- All layers share one coordinate system, so a real door photo must sit where
  the placeholder door sits. Open the placeholder in an image editor as a
  guide layer, trace the real product over it, delete the guide, export.
- The geometry constants (alcove position etc.) are at the top of the
  generator script if you need them.

**Thumbnails** (`public/assets/thumbs/...`): 480 × 360 (4:3), any format.
These are the pictures on the option cards.

**Files that vary by finish** — `doors/sliding-glass-{chrome,matte-black,brushed-nickel}.png`,
`fixtures/{finish}.png`, `fixtures/tub-spout-{finish}.png`,
`safety/grab-bar-{finish}.png`. If a real product only comes in one image,
point every finish at that file in `configuratorData.ts`.

To regenerate the placeholders after editing the script: `python3 scripts/generate-builder-placeholders.py` (needs Pillow).

## Adding or changing options

**A new choice in an existing step** — e.g. a new wall colour "Slate":

1. Add the id to the relevant union in `lib/builder/types.ts` (`WallStyleId`).
2. Add the entry in `lib/builder/configuratorData.ts` (`wallStyles`) and list it
   in `compatibleStyles` of every wall type that offers it.
3. Add the images: `walls/smooth/slate.png`, `walls/tile/slate.png`,
   `thumbs/wall-styles/slate.png`.

That's it — the step, preview, summary, export and rules pick it up.

**A whole new product category** — e.g. "Shower Head Style":

1. `types.ts`: an id union, an option interface, a field on `Configuration`, a `StepId`.
2. `configuratorData.ts`: the option list and a `steps` entry.
3. `rules.ts`: `DEFAULT_CONFIGURATION` gets the field (`null`); `describeSelection` gets a case.
4. `previewLayers.ts`: a slot with a `zIndex` between its neighbours.
5. `useConfigurator.tsx`: a named setter (optional — `setField` already works).
6. `StepPanel.tsx`: a `case` rendering an `OptionGrid` of `OptionCard`s.

**A compatibility rule** — all rules live in `normalizeConfiguration()` in
`rules.ts`, which runs after every change. Add a line there; nothing else
needs to know. Existing rules:

- no wall type → no wall style and no grout
- a wall style the current type doesn't offer → cleared (auto-selected when the type offers exactly one)
- grout → `null` when the wall type has no grout; defaults to silver when it does
- bathtub → door forced to "No Door" (the glass-door card shows disabled with the reason)

Steps that don't apply (grout, for smooth/printed panels) are marked
"Not applicable", skipped by Next/Back, and excluded from the progress count.

## Saving, restoring and exporting

- **Save / Load** — `localStorage["bathroomConfiguration"]`, `{ version, savedAt, configuration }`.
- **Restore on reload** — the working design is autosaved to
  `localStorage["bathroomConfiguration:draft"]`; on the next visit the user is
  asked whether to restore it. Reset clears the draft (a saved design is kept).
- **Export** — downloads `bathroom-design-YYYY-MM-DD.json`:

```json
{
  "app": "Bathroom Design Builder",
  "version": 1,
  "exportedAt": "2026-09-06T14:30:00.000Z",
  "summary": "Shower in the Blue Room, Calcutta Gold walls, sliding glass door, matte black hardware, ...",
  "design":     { "bathroomType": "Shower", "wallStyle": "Calcutta Gold", "groutColor": "Not applicable", ... },
  "selections": { "bathroomType": "shower", "wallStyle": "calcutta-gold", "groutColor": null, ... }
}
```

`design` is human-readable; `selections` is the raw ids an integration would
map to SKUs.

## Where future integrations go

| Feature                          | Starts from                                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| Lead capture / GoHighLevel / Builder Prime | `buildExport()` in `storage.ts` is the payload; POST it from `ExportDesign.tsx` or a new "Send to me" action |
| Pricing engine / quotes          | option ids are stable keys — attach prices in `configuratorData.ts` or a lookup keyed by id; compute from `Configuration` |
| PDF proposal / email share       | `buildExport()` + the preview (render the same layers server-side or snapshot the stage) |
| Shareable links                  | serialise `Configuration` into the URL; `parseConfiguration()` in `storage.ts` already validates and normalises untrusted input |
| Customer / rep accounts          | swap the `localStorage` functions in `storage.ts` for API calls — nothing else touches storage |
| Product inventory / SKU mapping  | keep option ids as SKU keys; hide options by filtering the data lists |
| Order management                 | consume the export's `selections` |

Nothing in `components/builder/` calls the network today; all persistence goes
through `lib/builder/storage.ts`.

## Placeholder notes

A few things are approximations until real product data arrives:

- **Trendz** is drawn as a diamond lattice; the real pattern should replace `walls/grout/trendz-*.png` and its thumbnail.
- **Illusions** wall types each map to a single matching style (auto-selected). If a printed panel comes in several colourways, list them in that type's `compatibleStyles`.
- Grout **defaults to silver** when a tile type is chosen so the preview never shows tiles without lines; change `DEFAULT_GROUT` in `configuratorData.ts`.
- Hardware layers use **chrome until a finish is chosen** (`DEFAULT_HARDWARE_TRIM`).
- The preview shows the **grey room** until a room is chosen (`FALLBACK_ROOM`).
