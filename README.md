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
# No build step — just a local server
python3 -m http.server 8765

# Open any exhibit
open http://localhost:8765/exhibits/2026-04-03-station-map-stepper/
```

## Project Structure

```
wrmp/
├── data/                  # JSON metadata (stations, species, gear, benthos)
├── shared/                # Shared CSS, JS, and images
│   ├── css/               #   tokens.css, exhibit-frame.css, leaflet-overrides.css
│   ├── js/                #   data-loader.js, map-init.js, stepper.js
│   └── img/               #   wrmp-logo.png
├── exhibits/              # Date-versioned exhibit prototypes
│   └── YYYY-MM-DD-slug/   #   Each contains index.html + optional media
├── reference/             # Branding assets + source data (gitignored)
├── CLAUDE.md              # AI collaborator context (Claude Code)
└── README.md              # This file
```

## Architecture

- **No build step.** Each exhibit is a single `index.html` with CDN dependencies (Leaflet, Google Fonts).
- **Shared utilities.** All exhibits load from `shared/css/` and `shared/js/`. The `WRMP.*` namespace provides `loadData()`, `initMap()`, `flyTo()`, `makePopup()`, `addPOI()`, and `createStepper()`.
- **Design tokens.** Brand colors, typography, and spacing are defined in `shared/css/tokens.css`. All exhibits must use these.
- **Two exhibit types:** Map-centric (Leaflet as background) and mixed-media (video/photo/map backgrounds swap per step).

## Creating a New Exhibit

1. Create `exhibits/YYYY-MM-DD-{slug}/index.html`
2. Copy the HTML skeleton from an existing exhibit (`station-map-stepper` is simplest)
3. Link to `../../shared/css/` and `../../shared/js/`
4. Define step content in the story panel
5. Write `STEP_DEFS` array with render functions for each step
6. Init with `WRMP.createStepper({ totalSteps, onStepEnter })`

If using Claude Code, run `/exhibit map "Title"` or `/exhibit story "Title"` to scaffold automatically.

## Data

JSON files in `data/` are converted from Excel metadata provided by the WRMP team:

- **stations.json** — 119 monitoring stations (lat/lon, region, network, habitat, site type)
- **species.json** — 237 species (taxonomy, native/invasive status, habitat)
- **gear.json** — 9 sampling gear types with descriptions
- **benthos.json** — 31 substrate/benthos classification types

Catch data (CPUE time series, species counts) is pending from UC Davis.

## Design System

Follows the WRMP brand identity:

- **Typography:** Source Sans 3 (and self-hosted Source Sans Pro) for all headings and body
- **Primary palette:** Teal `#228B9C`, ADA Teal `#005E6A`, Orange `#E09337`, Green `#379352`
- **UI:** 16:9 frame, glassmorphism story panel, Apple-style dot navigation
- **ADA:** 16px minimum text, WCAG contrast ratios, VoiceOver tested

## Contributing

- Follow the date-slug versioning convention for new exhibits
- Use design tokens from `shared/css/tokens.css` — don't hardcode brand colors
- Build popups with `WRMP.makePopup()` (DOM-based, no innerHTML for security)
- Test exhibits at 1200px width (the max-width of the frame)
- Run VoiceOver for basic ADA checks
