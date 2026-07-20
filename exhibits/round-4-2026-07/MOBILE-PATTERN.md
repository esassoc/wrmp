# Mobile Exhibit Pattern — Round 4

The desktop exhibit is a **landscape stage**: a narrative panel pinned beside a full-bleed background (map, video, photo), advanced left-to-right through numbered steps. That composition assumes horizontal room for panel-*beside*-media, a hovering pointer, and enough pixels that a 42%-width panel still reads. A phone has none of those. Shrinking the stage yields a ~160px panel over a ~220px map with sub-16px text — unusable.

Round 4 is a different composition for a different device, not a reflow of the same one. Desktop is the YouTube of this program — a stage you sit back and watch. Mobile is the TikTok — full-screen vertical cards you swipe through, thumb on glass, media as the hero and words as the caption.

## The pattern

**One step = one full-screen vertical card.** The step's media (video / photo / map) fills the screen edge-to-edge. The narrative sits in a bottom-anchored scrim over it, the way a caption sits over a TikTok. There is no side panel; the panel *becomes* the lower third of the media.

**Vertical swipe advances the story.** Steps stack top-to-bottom in a CSS scroll-snap deck. Advancing is a thumb-flick down, the single most practiced gesture on a phone. No Back/Next buttons, no horizontal paging.

**Media leads; interaction is opt-in.** The swipe flow is watch-only — nothing to fiddle with, nothing to mis-tap. Depth (a pannable map, filters, resource links) lives one deliberate tap away, in a mode you choose to enter. This is the museum placard model: the exhibit shows you the specimen; you step closer only when you want to.

## Why CSS scroll-snap, not a JS swipe handler

Scroll-snap *is* scrolling, so it inherits native momentum, the real scrollbar, keyboard paging, and screen-reader traversal for free — and it degrades to plain scrolling if anything fails. A hand-rolled touch-transform handler reimplements all of that worse and fights the browser. The one thing scroll-snap can't absorb is a live map (below), which is why the map goes behind a tap.

## Per-element decisions

| Element | Desktop | Mobile | Why |
|---|---|---|---|
| Step navigation | Back/Next + dot rail, horizontal | Vertical scroll-snap; a slim tick rail shows position and jumps on tap | Thumb-native; the dots become a position indicator, not a control you must hit |
| Video / photo step | Background beside panel | Full-bleed card hero + caption scrim | These are *already* the TikTok idiom — zero compromise, the format's strength |
| Map step | Always-live Leaflet | Frozen map as the card hero + **"Explore the map"** → fullscreen interactive | A live map wants the same vertical drag the swipe needs; separating watch-mode from explore-mode resolves the gesture collision cleanly |
| Legend filter | Chips filter the map in place | Move into the fullscreen map; in-card show a static key only | Filtering is a lean-in action — it belongs in explore-mode, not the watch flow |
| Marker popups | Click a marker | Inside the fullscreen map only | Same reasoning |
| Stat highlights | 3-across row | 3-across if each clears ~90px, else wraps | Glanceable data is core to the caption, not interaction |
| Callout note | Inline accent line | Inline tinted line in the caption | Lightweight, no interaction to adapt |
| Data & tools | Persistent side drawer, bottom-right | **Bottom sheet**, slides up from a pinned button | Side drawers are a desktop idiom; bottom sheets are the phone's |
| Resource hub (end) | 3-across panels | Stacked cards as the final swipe card | Vertical stack is the natural portrait form |

## Interactivity, degraded on purpose

The brief invited the tradeoff rather than assuming parity. The honest read: **live in-flow map interaction is the one thing that genuinely doesn't survive on a phone**, because it competes for the swipe gesture. Every other interaction adapts to touch without loss (drawer → sheet, chips → sheet chips, dots → rail).

So the map is demoted from "always live" to "live on tap." What's lost in the watch flow: idle panning while reading. What's kept: full pan / zoom / marker inspection / region filtering, in a fullscreen mode with room to actually use them on a small screen. For a museum-style audience this is a net gain — the ambient map was rarely the point; the story was.

## Authoring simplifications carried into Round 4

The desktop exhibits were pressure-tested by hand-authoring, and three costs surface that a future WordPress authoring plugin should not inherit:

1. **Resources were triplicated** — the same Data / Tools / Context list is hand-maintained in the end-card hub *and* the persistent drawer, ~200 lines each, kept in sync by hand. Round 4 defines resources **once** as data and renders both the bottom sheet and the end card from it.
2. **Step definition was scattered** across the HTML step divs, a `STEP_CONFIG` array, a render `switch`, and two separate `totalSteps` literals — a step count an author had to keep consistent in five places. Round 4 drives every card from a single `STEPS` config array: the one shape an authoring UI would serialize from form fields.
3. **The dark/light panel-theme knob disappears.** With a universal bottom scrim over media, per-step panel theming is no longer a decision anyone has to make.

The `STEPS` + `RESOURCES` config at the top of the Round 4 exhibit is deliberately the shape a plugin's saved content would take — it doubles as a schema sketch for that build.

## One markup, one config, two shells

Round 4 is a single file with a single content source — the `STEPS` / `RESOURCES` config — that renders two different shells, switched at a 900px breakpoint:

- **Below 900px — the mobile vertical player.** Full-screen scroll-snap cards, media-forward, map-on-tap.
- **At or above 900px — the desktop stage.** The Round 3 composition: a narrative panel beside an always-live Leaflet map, horizontal step navigation, clickable legend filter, persistent drawer.

Both shells are generated from the same config by two renderers; a `matchMedia` switch mounts whichever the viewport calls for and builds it lazily the first time that viewport is entered. Neither shell is a compromise of the other — each is the native form for its device, and the content is authored exactly once. The desktop shell reuses the shared stage CSS (`exhibit-frame`, `exhibit-cover`, `level3`) so it is visually identical to the hand-authored Round 3 exhibit, now driven by config instead of hand-written HTML.

This is the shape the production WordPress plugin serializes: an author fills in steps and resources; the shared renderer decides the shell.

The two renderers live in the shared layer — `shared/js/exhibit-r4.js` (the engine) and `shared/css/exhibit-mobile.css` (mobile styling), alongside the existing shared stage CSS for desktop. An exhibit is now a thin file: two empty root divs, the shared scripts, and a `WRMP.createR4Exhibit({ cover, steps, end, resources, map, data, computeStats })` config. `delta-smelt/index.html` (219 lines, all content) is the reference. The engine injects the icon sprite and both shells' chrome, so the exhibit file carries no layout.

### Config shape

```
WRMP.createR4Exhibit({
  frameTint, data, computeStats,        // data:{stations,species}; computeStats(data)→{statKey:value}
  cover:  { image, tag, tagGq, tagHref, topic, topicHref, kicker, title, lede, updated },
  steps:  [ { kicker, title, media, body:[…], stats:[…], callout } ],
  end:    { kicker, title, lede },
  resources: [ { cat, icon, items:[ { name, chip, icon, desc, href, ext } ] } ],
  map:    { popupFields, views: { <key>: { bounds, radius, select, colorFor, legend|filter } } },
});
```

`media` is one of `{type:'video', src, poster, credit}`, `{type:'photo', src, position, credit}`, `{type:'map', view:'<key>'}`, `{type:'gradient', gradient}`, or `{type:'custom', render}`. Map filterability comes from whether the referenced view defines a `filter`.

### The `custom` media type — charts & scorecards

Chart-forward steps can't hide behind a scrim, so `type:'custom'` gets a **figure layout** instead of a background: on mobile the figure sits on a solid panel in the top ~46% with the caption reading below it; on desktop the figure occupies the right stage where the map would otherwise be, with the story panel on the left.

```
media: {
  type: 'custom',
  render: function (container, ctx) {
    // ctx.data  → the loaded data (config.data result), or {} before load
    // ctx.mode  → 'mobile' | 'desktop'
    // Build a Chart.js canvas / scorecard HTML into `container`.
    // The engine calls this on first view AND again when data arrives,
    // so DISPOSE any prior instance you created (e.g. container._chart?.destroy()).
  },
}
```

The exhibit page adds `<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>` and the render uses the global `Chart`. This is also the seam where Levi's R/htmlwidgets outputs will plug in later.
