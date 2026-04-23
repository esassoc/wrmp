# WRMP Data Visualization

Interactive "museum exhibit" style visualizations for the [Wetland Regional Monitoring Program](https://wrmp.org), focused on Fish & Fish Habitat (FFH) data from the San Francisco Estuary.

Built for ESA by Andrew Lovseth as part of WRMP Phase 3 (Feb–Sep 2026).

## What This Is

Each exhibit is a self-contained HTML page rendered inside a fixed 16:9 frame with a narrative stepper panel overlaying an interactive Leaflet map (or video/photo background). Think natural history museum displays, not dashboards.

Exhibits embed into the WRMP WordPress site via iframe.

## Exhibits

| Exhibit | Preview |
|---------|---------|
| **The Bay: Where We're Watching** | 5-step station network narrative — regions, networks, restoration sites |
| **Delta Smelt: The Smallest Giant** | Species profile with video hero, range map, conservation story |
| **How We Monitor** | Sampling gear infographic — otter trawl, beach seine, gill net |
| **Native vs. Invasive** | Species composition timeline, drought regime shift |
| **Designing the Experiment** | Restoration site network, benchmark vs. project methodology |

## Quick Start

```bash
# No build step — just a local static server (default port 8765)
python3 -m http.server 8765
```

Then open:

- **[Gallery](http://localhost:8765/gallery/)** — landing page that embeds each exhibit in a 16:9 iframe and links to the design system (`gallery/index.html`).
- Any exhibit directly, e.g. [http://localhost:8765/exhibits/2026-04-03-station-map-stepper/](http://localhost:8765/exhibits/2026-04-03-station-map-stepper/)
- The **design system specimen page**: [http://localhost:8765/design-system/](http://localhost:8765/design-system/) — loads the same `shared/css` files as production exhibits so you can review tokens and components in one place.

**Claude Code:** `.claude/launch.json` defines a `wrmp` configuration that runs `python3 -m http.server 8765` for preview tooling.

## Project Structure

```
wrmp/
├── data/                      # JSON metadata (stations, species, gear, benthos)
├── gallery/
│   └── index.html             # Hub: iframed exhibit previews + link to design-system
├── design-system/
│   └── index.html             # Living component / token specimens (uses shared CSS)
├── shared/
│   ├── css/                   # Design system stylesheets
│   │   ├── tokens.css         # Brand tokens + Radix color imports
│   │   ├── exhibit-frame.css  # Frame, story panel, nav, map chrome
│   │   ├── leaflet-overrides.css
│   │   ├── marker-popup.css   # Station / map popup styling
│   │   └── metrics-card.css   # Metric card pattern (annual report style)
│   ├── fonts/                 # Self-hosted Source Sans Pro (+ legacy Source Serif files in repo)
│   ├── js/                    # data-loader.js, map-init.js, stepper.js, marker-popup.js
│   └── img/                   # Logos and marks (nav + step header)
├── exhibits/                  # Date-versioned exhibit prototypes
│   └── YYYY-MM-DD-slug/       # index.html + optional media
├── reference/                 # Branding assets + source data (gitignored)
├── .claude/
│   ├── launch.json            # Local static server launch config
│   └── skills/wrmp-exhibit/   # Exhibit scaffolding skill (Claude Code)
├── .cursor/
│   └── settings.json          # Cursor workspace settings (e.g. Figma plugin)
├── CLAUDE.md                  # AI collaborator context
└── README.md                  # This file
```

## Architecture

- **No build step.** Each exhibit is a single `index.html` with CDN dependencies (Leaflet, Google Fonts where used).
- **Shared utilities.** Exhibits load `shared/css/` and `shared/js/`. The `WRMP.*` namespace provides `loadData()`, `initMap()`, `flyTo()`, `makeMarkerPopup()`, `addPOI()`, and `createStepper()` (see `CLAUDE.md` for load order).
- **Design tokens.** `shared/css/tokens.css` defines WRMP semantic colors, typography, and spacing. It imports [@radix-ui/colors](https://www.npmjs.com/package/@radix-ui/colors) (v3.0.0 via jsDelivr) for full scales; `--wrmp-*` tokens map brand usage onto those scales. Dark palettes reuse the same variable names under `.dark` / `.dark-theme` (see the design-system Colors section).
- **Two exhibit types:** Map-centric (Leaflet as background) and mixed-media (video/photo/map backgrounds swap per step).

## Creating a New Exhibit

1. Create `exhibits/YYYY-MM-DD-{slug}/index.html`
2. Copy the HTML skeleton from an existing exhibit (`2026-04-03-station-map-stepper` is the simplest map-centric reference)
3. Link to `../../shared/css/` and `../../shared/js/`
4. For each step, use a **step header** row (`.step-header` with `.step-header-mark`, `.step-header-text`, kicker + `h2`) before body copy — this matches `exhibit-frame.css` and keeps nav-adjacent titles consistent across exhibits. See any current exhibit or `.claude/skills/wrmp-exhibit/SKILL.md`.
5. Define `STEP_DEFS` with render functions for each step
6. Init with `WRMP.createStepper({ totalSteps, onStepEnter })`

If using Claude Code, run `/exhibit map "Title"` or `/exhibit story "Title"` to scaffold from the skill.

## Data

JSON files in `data/` are converted from Excel metadata provided by the WRMP team:

- **stations.json** — 119 monitoring stations (lat/lon, region, network, habitat, site type)
- **species.json** — 237 species (taxonomy, native/invasive status, habitat)
- **gear.json** — 9 sampling gear types with descriptions
- **benthos.json** — 31 substrate/benthos classification types

Catch data (CPUE time series, species counts) is pending from UC Davis.

## Design System

**Brand (all exhibits):**

- **Typography:** Self-hosted Source Sans Pro in `shared/fonts/` (`tokens.css`); exhibits often also load Source Sans 3 from Google Fonts. Headings and body share one stack (`--font-heading` aliases `--font-body`).
- **Primary palette:** Official WRMP reference hexes are Teal `#228B9C`, ADA Teal `#005E6A`, Orange `#E09337`, and Green `#379352` (see `--wrmp-*-brand` in `shared/css/tokens.css`). Use the `--wrmp-*` variables in code; those resolve through Radix scales, so a color picker on the live page may not match the reference hex exactly.
- **UI:** 16:9 frame, glassmorphism story panel, Apple-style dot navigation
- **ADA:** 16px minimum text, WCAG contrast ratios, VoiceOver tested

**Specimen page:** Open `design-system/index.html` via the local server to browse colors, type, spacing, story-panel patterns, legends, popups, and other UI building blocks against the real shared stylesheets.

## Contributing

- Follow the date-slug versioning convention for new exhibits
- Use design tokens from `shared/css/tokens.css` — don't hardcode brand colors
- Build marker popups with `WRMP.makeMarkerPopup()` from `shared/js/marker-popup.js` (DOM-based, no innerHTML for security)
- Test exhibits at 1200px width (the max-width of the frame)
- Run VoiceOver for basic ADA checks
