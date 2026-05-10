# Developing

Local setup, project structure, and exhibit-authoring guidance for the WRMP visualization repo.

## Local Development

No build step — serve the repo root with any static server.

```bash
python3 -m http.server 8765
```

Then open the URL the server prints in your browser. `.claude/launch.json` defines a `wrmp` configuration that runs the same command for Claude Code preview tooling.

## Project Structure

```
wrmp/
├── index.html                 # Gallery hub (poster cards) — site landing page
├── design-system/
│   └── index.html             # Component / token specimens (uses shared CSS)
├── data/                      # JSON metadata (stations, species, gear, benthos)
├── shared/
│   ├── css/                   # Design system stylesheets
│   │   ├── tokens.css         # Brand tokens + Radix color imports
│   │   ├── exhibit-frame.css  # Frame, story panel, nav, map chrome
│   │   ├── leaflet-overrides.css
│   │   ├── marker-popup.css   # Station / map popup styling
│   │   └── metrics-card.css   # Metric card pattern
│   ├── fonts/                 # Self-hosted Source Sans Pro
│   ├── js/                    # data-loader.js, map-init.js, stepper.js, marker-popup.js
│   └── img/                   # Logos and marks (nav + step header)
├── exhibits/                  # Date-versioned exhibit prototypes
│   └── YYYY-MM-DD-slug/       # index.html + optional media
├── reference/                 # Branding assets + source data (gitignored)
├── CLAUDE.md                  # AI collaborator context — technical guidance
└── README.md                  # Public project overview
```

## Architecture

- **No build step.** Each exhibit is a single `index.html` with CDN dependencies (Leaflet, Google Fonts where used).
- **Shared utilities.** Exhibits load `shared/css/` and `shared/js/`. The `WRMP.*` namespace provides `loadData()`, `initMap()`, `flyTo()`, `makeMarkerPopup()`, `addPOI()`, and `createStepper()` (load order: data-loader → map-init → marker-popup → stepper).
- **Design tokens.** `shared/css/tokens.css` defines WRMP semantic colors, typography, and spacing. It imports [@radix-ui/colors](https://www.npmjs.com/package/@radix-ui/colors) for full scales; `--wrmp-*` tokens map brand usage onto those scales. Dark palettes reuse the same variable names under `.dark` / `.dark-theme`.
- **Two exhibit types:** Map-centric (Leaflet as background) and mixed-media (video/photo/map backgrounds swap per step).

## Creating a New Exhibit

1. Create `exhibits/YYYY-MM-DD-{slug}/index.html`
2. Copy the HTML skeleton from an existing exhibit (`2026-04-03-station-map-stepper` is the simplest map-centric reference)
3. Link to `../../shared/css/` and `../../shared/js/`
4. For each step, use a **step header** row (`.step-header` with `.step-header-mark`, `.step-header-text`, kicker + `h2`) before body copy — this matches `exhibit-frame.css` and keeps nav-adjacent titles consistent across exhibits
5. Define `STEP_DEFS` with render functions for each step
6. Init with `WRMP.createStepper({ totalSteps, onStepEnter })`

If using Claude Code, run `/exhibit map "Title"` or `/exhibit story "Title"` to scaffold from the skill.

## Data

JSON files in `data/` are converted from Excel metadata sources:

- **stations.json** — 119 monitoring stations (lat/lon, region, network, habitat, site type)
- **species.json** — 237 species (taxonomy, native/invasive status, habitat)
- **gear.json** — 9 sampling gear types
- **benthos.json** — 31 substrate/benthos classification types

### Converting new Excel sources

```python
import openpyxl, json
wb = openpyxl.load_workbook('file.xlsx', read_only=True)
ws = wb[wb.sheetnames[1]]  # data sheet (first is often metadata description)
rows = list(ws.iter_rows(values_only=True))
headers = [str(h).strip() for h in rows[0]]
data = [{h: v for h, v in zip(headers, row)} for row in rows[1:]]
json.dump(data, open('data/output.json', 'w'), indent=2)
```

## Design System

**Brand:**

- **Typography** — Self-hosted Source Sans Pro in `shared/fonts/` (`tokens.css`); exhibits often also load Source Sans 3 from Google Fonts. Headings and body share one stack (`--font-heading` aliases `--font-body`).
- **Primary palette** — Reference hexes are Teal `#228B9C`, ADA Teal `#005E6A`, Orange `#E09337`, Green `#379352` (see `--wrmp-*-brand` in `shared/css/tokens.css`). Use the `--wrmp-*` variables in code; those resolve through Radix scales, so a color picker on the live page may not match the reference hex exactly.
- **UI** — 16:9 frame, glassmorphism story panel, dot navigation
- **ADA** — 16px minimum text, WCAG 2.1 AA contrast, VoiceOver tested

**Specimen page:** [esassoc.github.io/wrmp/design-system/](https://esassoc.github.io/wrmp/design-system/) — browse colors, type, spacing, story-panel patterns, legends, popups, and other UI building blocks against the real shared stylesheets.

## Contributing

- Follow the date-slug versioning convention for new exhibits
- Use design tokens from `shared/css/tokens.css` — don't hardcode brand colors
- Build marker popups with `WRMP.makeMarkerPopup()` from `shared/js/marker-popup.js` (DOM-based, no `innerHTML`)
- Test exhibits at 1200px width (the max-width of the frame)
- Run VoiceOver for basic ADA checks
