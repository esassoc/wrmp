/* ══════════════════════════════════════════════════════════════
   WRMP Round 4 — dual-shell exhibit engine.

   One content config drives two shells, switched at 900px:
     • below  → mobile vertical player (scroll-snap cards, map-on-tap)
     • at/above → desktop stage (panel + live map, from the R3 CSS)

   Usage (in an exhibit's index.html):
     <div id="root-mobile"></div>
     <div id="root-desktop"></div>
     <script src="…/exhibit-r4.js"></script>
     <script>WRMP.createR4Exhibit({ cover, steps, end, resources, map, data, computeStats });</script>

   Pairs with shared/css/exhibit-mobile.css (mobile) and the shared
   stage CSS (exhibit-frame / exhibit-cover / level3) for desktop.
   Requires: leaflet, data-loader.js, marker-popup.js.
   ══════════════════════════════════════════════════════════════ */

var WRMP = window.WRMP || {};

(function () {
  "use strict";

  var DEFAULT_TILE = {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    opts: { attribution: "&copy; OSM &copy; CARTO", subdomains: "abcd", maxZoom: 17 },
  };
  var CAT_KEY = { Data: "data", Tools: "tools", Context: "science" };
  var CAT_ICON = { Data: "i-database", Tools: "i-compass", Context: "i-book" };

  // Lucide glyphs, stroked. Rendered as <symbol>s; `.lc { fill:none;
  // stroke:currentColor }` in the CSS forces correct rendering through <use>.
  var SPRITE =
    '<svg width="0" height="0" aria-hidden="true"><defs>' +
    '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<symbol id="i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></symbol>' +
    '<symbol id="i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/></symbol>' +
    '<symbol id="i-book" viewBox="0 0 24 24"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol>' +
    '<symbol id="i-download" viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></symbol>' +
    '<symbol id="i-map" viewBox="0 0 24 24"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></symbol>' +
    '<symbol id="i-file" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></symbol>' +
    '<symbol id="i-external" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></symbol>' +
    '<symbol id="i-down" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></symbol>' +
    '<symbol id="i-chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>' +
    '<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></symbol>' +
    '<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol>' +
    '<symbol id="i-expand" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></symbol>' +
    '<symbol id="i-refresh" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></symbol>' +
    "</g></defs></svg>";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function svg(id, cls) {
    return '<svg class="lc ' + (cls || "") + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }
  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  WRMP.createR4Exhibit = function (config) {
    var COVER = config.cover || {};
    // Cover management-question tags: prefer an array `cover.tags:[{tag,gq,href}]`;
    // fall back to the single `tag`/`tagGq`/`tagHref` form.
    var COVER_TAGS = COVER.tags ||
      (COVER.tag ? [{ tag: COVER.tag, gq: COVER.tagGq, href: COVER.tagHref }] : []);
    var STEPS = config.steps || [];
    var END = config.end || {};
    var RESOURCES = config.resources || [];
    var MAP = config.map || { views: {} };
    var VIEWS = MAP.views || {};
    var TILE = MAP.tile || DEFAULT_TILE;
    var POPUP_FIELDS = MAP.popupFields || [];
    var CODE_FIELD = MAP.codeField || "station_code";
    var NAME_FIELD = MAP.nameField || "station_name";
    var MARK = config.mark || "../../../shared/img/wrmp-logo-2in-mark-crop.png";
    var ALL_HREF = config.allExhibitsHref || "../../../";
    var TITLE = COVER.title || "Exhibit";
    var mqDesktop = window.matchMedia("(min-width: 900px)");

    var STATIONS = [];
    var DATA = {};

    // ── Inject the icon sprite once ──
    if (!document.getElementById("wrmp-r4-sprite")) {
      var holder = document.createElement("div");
      holder.id = "wrmp-r4-sprite";
      holder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
      holder.innerHTML = SPRITE;
      document.body.insertBefore(holder, document.body.firstChild);
    }

    // ── Shared: map helpers (view-driven) ──
    function viewStations(view) {
      return view.select ? view.select(STATIONS) : STATIONS;
    }
    function markerColor(view, s) {
      return view.colorFor ? view.colorFor(s) : "#999";
    }
    function makeMarkers(map, viewKey, filter, interactive) {
      var view = VIEWS[viewKey];
      if (!view) return;
      if (map._markers) map._markers.clearLayers();
      else map._markers = L.layerGroup().addTo(map);
      var field = view.filter ? view.filter.field : null;
      viewStations(view).forEach(function (s) {
        var color = markerColor(view, s);
        var match = !filter || (field && s[field] === filter);
        var mk = L.circleMarker([s.lat, s.lon], {
          radius: match ? view.radius || 6 : 3,
          fillColor: match ? color : "#bbb",
          color: match ? "#fff" : "#ddd",
          weight: match ? 1.5 : 1,
          fillOpacity: match ? 0.85 : 0.25,
        });
        if (interactive) {
          mk.bindPopup(
            WRMP.makeMarkerPopup({
              code: s[CODE_FIELD],
              name: s[NAME_FIELD],
              dotColor: color,
              showImage: false,
              sections: [
                {
                  rows: POPUP_FIELDS.map(function (p) {
                    return { type: "row", label: s[p[1]] || "—", value: p[0] };
                  }),
                },
              ],
            }),
          );
        }
        mk.addTo(map._markers);
      });
    }
    function fitFrozen(map, viewKey) {
      var view = VIEWS[viewKey];
      var h = map.getSize().y || 600;
      map.fitBounds(view.bounds, {
        paddingTopLeft: [24, 54],
        paddingBottomRight: [24, Math.round(h * 0.42)],
        animate: false,
      });
    }

    function fillStats() {
      if (!config.computeStats) return;
      var vals = config.computeStats(DATA) || {};
      Object.keys(vals).forEach(function (k) {
        document.querySelectorAll('[data-stat="' + k + '"]').forEach(function (n) {
          n.textContent = vals[k];
        });
      });
    }

    // ── Shared: resource list (mobile sheet + end card) ──
    function buildResourceList() {
      var wrap = el("div");
      RESOURCES.forEach(function (group) {
        var g = el("div", "res-group");
        g.dataset.cat = CAT_KEY[group.cat] || "data";
        g.appendChild(
          el(
            "div",
            "res-grouphead",
            '<span class="res-cat-icon">' +
              svg(group.icon || CAT_ICON[group.cat] || "i-database") +
              "</span>" +
              '<span class="gh-name">' + group.cat + "</span>" +
              '<span class="gh-count">' + group.items.length + "</span>",
          ),
        );
        group.items.forEach(function (it) {
          var row = el("a", "res-row");
          row.href = it.href;
          row.target = "_blank";
          row.rel = "noopener noreferrer";
          row.innerHTML =
            svg(it.icon, "rw-lead") +
            '<div class="rw-body"><div class="rw-top">' +
            '<span class="rw-name">' + it.name + "</span>" +
            '<span class="rw-chip">' + it.chip + "</span>" +
            '<span class="rw-go">' + svg(it.ext ? "i-external" : "i-down") + "</span></div>" +
            '<p class="rw-desc">' + it.desc + "</p></div>";
          g.appendChild(row);
        });
        wrap.appendChild(g);
      });
      return wrap;
    }

    // ════════════════════════════════════════════════
    // MOBILE SHELL
    // ════════════════════════════════════════════════
    var mo = {}; // mobile refs/state

    function buildMobileChrome() {
      var root = document.getElementById("root-mobile");
      root.innerHTML =
        '<div class="player" id="player">' +
        '<div class="deck" id="deck" role="region" aria-label="' + TITLE + '"></div>' +
        '<nav class="rail" id="rail" aria-label="Exhibit progress"></nav>' +
        '<button class="sheet-trigger" id="sheetTrigger" aria-label="Open data and tools" aria-haspopup="dialog">' +
        svg("i-layers") +
        "</button>" +
        '<div class="sheet-scrim" id="sheetScrim"></div>' +
        '<aside class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Data and tools" aria-hidden="true">' +
        '<div class="sheet-grip"></div>' +
        '<div class="sheet-head"><p class="sheet-title">Data &amp; tools</p>' +
        '<button class="sheet-close" id="sheetClose" aria-label="Close">' + svg("i-x") + "</button></div>" +
        '<div class="sheet-body" id="sheetBody"></div></aside>' +
        '<div class="mapmodal" id="mapModal" role="dialog" aria-modal="true" aria-label="Interactive map" aria-hidden="true">' +
        '<div class="mapmodal-map" id="modalMap"></div>' +
        '<div class="mapmodal-bar"><span class="mapmodal-title" id="modalTitle">Explore the map</span>' +
        '<button class="mapmodal-close" id="modalClose" aria-label="Close map">' + svg("i-x") + "</button></div>" +
        '<div class="mapmodal-legend" id="modalLegend"></div></div>' +
        "</div>";
    }

    function m_mediaLayer(step) {
      var media = el("div", "card-media");
      var t = step.media.type;
      if (t === "video") {
        var v = el("video");
        v.autoplay = true; v.loop = true; v.muted = true;
        v.setAttribute("muted", ""); v.playsInline = true;
        v.setAttribute("playsinline", ""); v.setAttribute("preload", "metadata");
        if (step.media.poster) v.poster = step.media.poster;
        var src = el("source"); src.src = step.media.src; src.type = "video/mp4";
        v.appendChild(src); media.appendChild(v);
      } else if (t === "photo") {
        var ph = el("div", "card-photo");
        ph.style.backgroundImage = "url('" + step.media.src + "')";
        if (step.media.position) ph.style.backgroundPosition = step.media.position;
        media.appendChild(ph);
      } else if (t === "map") {
        media.appendChild(el("div", "card-map"));
      } else if (t === "gradient") {
        var gr = el("div", "card-gradient");
        if (step.media.gradient) gr.style.background = step.media.gradient;
        media.appendChild(gr);
      }
      return media;
    }

    function m_buildCover() {
      var card = el("section", "card card--cover");
      card.setAttribute("aria-label", "Cover");
      var media = el("div", "card-media");
      var ph = el("div", "card-photo");
      ph.style.backgroundImage = "url('" + COVER.image + "')";
      media.appendChild(ph);
      card.appendChild(media);
      card.appendChild(el("div", "card-scrim"));

      var cap = el("div", "card-caption");
      if (COVER_TAGS.length || COVER.topic) {
        var tags = el("div", "cover-tags");
        COVER_TAGS.forEach(function (t) {
          var tag = el("a", "cover-tag", t.tag);
          if (t.href) tag.href = t.href;
          if (t.gq) tag.dataset.gq = t.gq;
          tags.appendChild(tag);
        });
        if (COVER.topic) {
          var topic = el("a", "cover-topic", COVER.topic);
          if (COVER.topicHref) topic.href = COVER.topicHref;
          tags.appendChild(topic);
        }
        cap.appendChild(tags);
      }
      if (COVER.kicker) cap.appendChild(el("div", "cover-kicker", COVER.kicker));
      cap.appendChild(el("h1", "cover-title", COVER.title));
      if (COVER.lede) cap.appendChild(el("p", "cover-lede", COVER.lede));
      if (COVER.updated) cap.appendChild(el("p", "cover-updated", COVER.updated));
      cap.appendChild(el("div", "swipe-cue", "<span>Swipe to begin</span>" + svg("i-chevron")));
      card.appendChild(cap);
      return card;
    }

    function m_buildStep(step) {
      var isCustom = step.media.type === "custom";
      var card = el("section", "card" + (isCustom ? " card--figure" : ""));
      card.dataset.media = step.media.type;
      card._step = step;
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "slide");
      card.setAttribute("aria-label", step.title);
      if (isCustom) {
        card.appendChild(el("div", "card-figure"));
      } else {
        card.appendChild(m_mediaLayer(step));
        if (step.media.view) card.dataset.view = step.media.view;
        if (step.media.credit) card.appendChild(el("div", "card-credit", step.media.credit));
      }
      card.appendChild(el("div", "card-scrim"));

      var cap = el("div", "card-caption");
      var view = step.media.type === "map" ? VIEWS[step.media.view] : null;

      if (view) {
        var explore = el("button", "map-explore", svg("i-expand") + "<span>Explore the map</span>");
        explore.dataset.view = step.media.view;
        explore.dataset.title = step.title;
        explore.addEventListener("click", function () {
          m_openMap(this.dataset.view, this.dataset.title, this);
        });
        cap.appendChild(explore);
      }

      if (step.kicker) cap.appendChild(el("div", "card-kicker", step.kicker));
      cap.appendChild(el("h2", "card-title", step.title));
      var body = el("div", "card-body");
      (step.body || []).forEach(function (p) { body.appendChild(el("p", null, p)); });
      cap.appendChild(body);

      if (step.stats) {
        var row = el("div", "card-stats");
        step.stats.forEach(function (s) {
          var stat = el("div", "card-stat");
          var num = el("div", "num", s.num != null ? s.num : "—");
          if (s.dataKey) num.dataset.stat = s.dataKey;
          stat.appendChild(num);
          stat.appendChild(el("div", "lbl", s.lbl));
          row.appendChild(stat);
        });
        cap.appendChild(row);
      }
      if (step.callout) cap.appendChild(el("div", "card-callout", step.callout));

      if (view && view.filter) {
        var key = el("div", "card-key");
        view.filter.options.forEach(function (o) {
          var k = el("span", "k", "<i></i>" + (o.short || o.label));
          k.querySelector("i").style.background = o.color;
          key.appendChild(k);
        });
        cap.appendChild(key);
      }
      card.appendChild(cap);
      return card;
    }

    function m_buildEnd() {
      var card = el("section", "card card--end");
      card.setAttribute("aria-label", END.kicker || "The data runs deeper");
      var media = el("div", "card-media");
      var ph = el("div", "card-photo");
      ph.style.backgroundImage = "url('" + (END.image || COVER.image) + "')";
      media.appendChild(ph);
      card.appendChild(media);
      card.appendChild(el("div", "card-scrim"));

      var cap = el("div", "card-caption");
      if (END.kicker) cap.appendChild(el("div", "card-kicker", END.kicker));
      cap.appendChild(el("h2", "card-title", END.title || "The data runs deeper"));
      if (END.lede) cap.appendChild(el("p", "card-body", "<p>" + END.lede + "</p>"));
      if (RESOURCES.length) cap.appendChild(buildResourceList());

      var actions = el("div", "end-actions");
      var restart = el("button", "end-btn end-btn--primary", svg("i-refresh") + "Restart exhibit");
      restart.addEventListener("click", function () { m_goTo(0); });
      var all = el("a", "end-btn end-btn--secondary", "View all exhibits");
      all.href = ALL_HREF;
      actions.appendChild(restart);
      actions.appendChild(all);
      cap.appendChild(actions);
      card.appendChild(cap);
      return card;
    }

    function m_assemble() {
      mo.deck.appendChild(m_buildCover());
      STEPS.forEach(function (s) { mo.deck.appendChild(m_buildStep(s)); });
      mo.deck.appendChild(m_buildEnd());
      mo.cards = Array.prototype.slice.call(mo.deck.querySelectorAll(".card"));
      mo.cards.forEach(function (c, i) {
        c.dataset.index = i;
        var label = i === 0 ? "Cover" : i === mo.cards.length - 1 ? (END.kicker || "End") : STEPS[i - 1].title;
        var tick = el("button", "rail-tick");
        tick.setAttribute("aria-label", "Go to " + label);
        tick.addEventListener("click", function () { m_goTo(i); });
        mo.rail.appendChild(tick);
      });
      mo.ticks = Array.prototype.slice.call(mo.rail.querySelectorAll(".rail-tick"));
    }

    function m_setActive(i) {
      if (i === mo.current) return;
      mo.current = i;
      mo.ticks.forEach(function (t, j) { t.classList.toggle("active", j === i); });
      mo.cards.forEach(function (c, j) {
        var v = c.querySelector("video");
        if (!v) return;
        if (j === i) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }

    function m_initObserver() {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting && e.intersectionRatio >= 0.55) {
              m_setActive(+e.target.dataset.index);
              if (e.target.dataset.media === "map") m_initFrozenMap(e.target, e.target.dataset.view);
              else if (e.target.dataset.media === "custom") m_renderFigure(e.target, false);
            }
          });
        },
        { root: mo.deck, threshold: [0, 0.55, 0.9] },
      );
      mo.cards.forEach(function (c) { io.observe(c); });
    }

    function m_initFrozenMap(cardEl, viewKey) {
      var div = cardEl.querySelector(".card-map");
      if (!div || div._map) return;
      var m = L.map(div, {
        zoomControl: false, attributionControl: false, dragging: false,
        tap: false, touchZoom: false, scrollWheelZoom: false,
        doubleClickZoom: false, boxZoom: false, keyboard: false,
      });
      L.tileLayer(TILE.url, TILE.opts).addTo(m);
      div._map = m; div._view = viewKey;
      var draw = function () { m.invalidateSize(); makeMarkers(m, viewKey, null, false); fitFrozen(m, viewKey); };
      draw();
      setTimeout(draw, 80);
    }
    function m_refreshFrozen() {
      mo.deck.querySelectorAll(".card-map").forEach(function (d) {
        if (d._map) { makeMarkers(d._map, d._view, null, false); fitFrozen(d._map, d._view); }
      });
    }

    // Custom figure (chart / scorecard) — the step's render(container, ctx)
    // owns its content and must dispose any prior instance it created.
    function m_renderFigure(cardEl, force) {
      var fig = cardEl.querySelector(".card-figure");
      var step = cardEl._step;
      if (!fig || !step || !step.media.render) return;
      if (fig._rendered && !force) return;
      step.media.render(fig, { data: DATA, mode: "mobile" });
      fig._rendered = true;
    }
    function m_refreshFigures() {
      mo.deck.querySelectorAll(".card--figure").forEach(function (c) {
        var fig = c.querySelector(".card-figure");
        if (fig && fig._rendered) m_renderFigure(c, true);
      });
    }

    // Fullscreen interactive map modal
    function m_openMap(viewKey, title, opener) {
      mo.modalView = viewKey; mo.modalFilter = null; mo.modalReturnFocus = opener || null;
      document.getElementById("modalTitle").textContent = title || "Explore the map";
      mo.mapModal.classList.add("open");
      mo.mapModal.setAttribute("aria-hidden", "false");
      mo.deck.classList.add("locked");
      if (!mo.modalMap) {
        mo.modalMap = L.map("modalMap", { zoomControl: false, attributionControl: true });
        L.tileLayer(TILE.url, TILE.opts).addTo(mo.modalMap);
        L.control.zoom({ position: "bottomright" }).addTo(mo.modalMap);
      }
      setTimeout(function () {
        mo.modalMap.invalidateSize();
        makeMarkers(mo.modalMap, viewKey, null, true);
        var view = VIEWS[viewKey];
        var h = mo.modalMap.getSize().y || 600;
        mo.modalMap.fitBounds(view.bounds, { paddingTopLeft: [24, 60], paddingBottomRight: [24, Math.round(h * 0.14)], animate: false });
        m_buildModalLegend(viewKey);
      }, 60);
      document.getElementById("modalClose").focus({ preventScroll: true });
    }
    function m_closeMap() {
      mo.mapModal.classList.remove("open");
      mo.mapModal.setAttribute("aria-hidden", "true");
      mo.deck.classList.remove("locked");
      if (mo.modalMap) mo.modalMap.closePopup();
      if (mo.modalReturnFocus) mo.modalReturnFocus.focus({ preventScroll: true });
    }
    function m_buildModalLegend(viewKey) {
      var view = VIEWS[viewKey];
      var wrap = document.getElementById("modalLegend");
      wrap.replaceChildren();
      if (!view.filter) return;
      var mk = function (label, value, color) {
        var chip = el("button", "mm-chip");
        if (mo.modalFilter && mo.modalFilter !== value) chip.classList.add("dimmed");
        if (color) { var dot = el("span", "dot"); dot.style.background = color; chip.appendChild(dot); }
        chip.appendChild(document.createTextNode(label));
        chip.addEventListener("click", function () {
          mo.modalFilter = mo.modalFilter === value ? null : value;
          makeMarkers(mo.modalMap, viewKey, mo.modalFilter, true);
          m_buildModalLegend(viewKey);
        });
        return chip;
      };
      wrap.appendChild(mk("All", null, null));
      view.filter.options.forEach(function (o) { wrap.appendChild(mk(o.label, o.value, o.color)); });
    }

    function m_openSheet() {
      document.getElementById("sheetBody").replaceChildren(buildResourceList());
      mo.sheet.classList.add("open");
      mo.sheet.setAttribute("aria-hidden", "false");
      mo.sheetScrim.classList.add("open");
      mo.deck.classList.add("locked");
      document.getElementById("sheetClose").focus({ preventScroll: true });
    }
    function m_closeSheet() {
      mo.sheet.classList.remove("open");
      mo.sheet.setAttribute("aria-hidden", "true");
      mo.sheetScrim.classList.remove("open");
      mo.deck.classList.remove("locked");
      mo.sheetTrigger.focus({ preventScroll: true });
    }

    function m_goTo(i) {
      i = Math.max(0, Math.min(mo.cards.length - 1, i));
      mo.deck.scrollTo({ top: i * mo.deck.clientHeight, behavior: prefersReduced() ? "auto" : "smooth" });
    }

    function buildMobile() {
      if (mo.built) return;
      mo.built = true;
      buildMobileChrome();
      mo.player = document.getElementById("player");
      mo.deck = document.getElementById("deck");
      mo.rail = document.getElementById("rail");
      mo.sheet = document.getElementById("sheet");
      mo.sheetScrim = document.getElementById("sheetScrim");
      mo.sheetTrigger = document.getElementById("sheetTrigger");
      mo.mapModal = document.getElementById("mapModal");
      mo.current = 0;
      m_assemble();
      m_setActive(0);
      m_initObserver();
      // The player shell is fixed chrome — only the deck scrolls.
      mo.player.addEventListener("scroll", function () {
        mo.player.scrollTop = 0; mo.player.scrollLeft = 0;
      });
      mo.sheetTrigger.addEventListener("click", m_openSheet);
      document.getElementById("sheetClose").addEventListener("click", m_closeSheet);
      mo.sheetScrim.addEventListener("click", m_closeSheet);
      document.getElementById("modalClose").addEventListener("click", m_closeMap);
      if (STATIONS.length) m_refreshFrozen();
    }

    // ════════════════════════════════════════════════
    // DESKTOP SHELL (the R3 stage, from the shared stage CSS)
    // ════════════════════════════════════════════════
    var de = {}; // desktop refs/state

    function d_stepPanel(i) {
      var step = STEPS[i];
      if (step.panel) return step.panel;
      return step.media.type === "map" || step.media.type === "custom" ? "light" : "dark";
    }

    function d_hub() {
      var hub = el("div", "l3-hub");
      RESOURCES.forEach(function (group) {
        var panel = el("div", "l3-hub-panel");
        panel.dataset.cat = CAT_KEY[group.cat] || "data";
        panel.appendChild(
          el("div", "l3-hub-panel-head",
            '<span class="cat-icon">' + svg(group.icon || CAT_ICON[group.cat]) + "</span>" +
            '<span class="cat-name">' + group.cat + "</span>" +
            '<span class="cat-count">' + group.items.length + "</span>"),
        );
        group.items.forEach(function (it) {
          var a = el("a", "l3-hub-item");
          a.href = it.href; a.target = "_blank"; a.rel = "noopener noreferrer";
          a.innerHTML =
            '<span class="hf-icon">' + svg(it.icon) + "</span>" +
            '<div class="hf-body"><div class="hf-top">' +
            '<p class="hf-name">' + it.name + "</p>" +
            '<span class="l3-chip">' + it.chip + "</span>" +
            '<span class="hf-go">' + svg(it.ext ? "i-external" : "i-down") + "</span></div>" +
            '<p class="hf-desc">' + it.desc + "</p></div>";
          panel.appendChild(a);
        });
        hub.appendChild(panel);
      });
      return hub;
    }

    function d_drawerBody() {
      var body = el("div", "level3-drawer-body");
      RESOURCES.forEach(function (group) {
        var g = el("div", "drf-group");
        g.dataset.cat = CAT_KEY[group.cat] || "data";
        g.appendChild(
          el("div", "drf-grouphead",
            '<span class="cat-icon cat-icon-sm">' + svg(group.icon || CAT_ICON[group.cat]) + "</span>" +
            '<span class="gh-name">' + group.cat + "</span>" +
            '<span class="gh-count">' + group.items.length + "</span>"),
        );
        group.items.forEach(function (it) {
          var a = el("a", "drf-row");
          a.href = it.href; a.target = "_blank"; a.rel = "noopener noreferrer";
          a.innerHTML =
            '<span class="rw-icon">' + svg(it.icon) + "</span>" +
            '<div class="rw-body"><div class="rw-top">' +
            '<p class="rw-name">' + it.name + "</p>" +
            '<span class="l3-chip">' + it.chip + "</span>" +
            '<span class="rw-go">' + svg(it.ext ? "i-external" : "i-down") + "</span></div>" +
            '<p class="rw-desc">' + it.desc + "</p></div>";
          g.appendChild(a);
        });
        body.appendChild(g);
      });
      return body;
    }

    function d_cover() {
      var cover = el("div", "exhibit-cover");
      cover.id = "d-cover";
      var img = el("div", "exhibit-cover-image");
      img.style.backgroundImage = "url('" + COVER.image + "')";
      img.setAttribute("aria-hidden", "true");
      cover.appendChild(img);
      var grad = el("div", "exhibit-cover-gradient");
      grad.setAttribute("aria-hidden", "true");
      cover.appendChild(grad);
      var content = el("div", "exhibit-cover-content");
      var tagsHtml = "";
      if (COVER_TAGS.length || COVER.topic) {
        var tagChips = COVER_TAGS.map(function (t) {
          return '<a class="exhibit-tag" data-gq="' + (t.gq || "") + '" href="' + (t.href || "#") + '">' + t.tag + "</a>";
        }).join("");
        tagsHtml =
          '<div class="exhibit-cover-tags">' +
          (tagChips ? '<div class="exhibit-tags">' + tagChips + "</div>" : "") +
          (COVER.topic ? '<div class="exhibit-topics exhibit-topics--on-cover"><a class="exhibit-topic" href="' + (COVER.topicHref || "#") + '">' + COVER.topic + "</a></div>" : "") +
          "</div>";
      }
      content.innerHTML =
        tagsHtml +
        (COVER.kicker ? '<span class="exhibit-cover-kicker">' + COVER.kicker + "</span>" : "") +
        '<h2 class="exhibit-cover-title">' + COVER.title + "</h2>" +
        (COVER.lede ? '<p class="exhibit-cover-lede">' + COVER.lede + "</p>" : "");
      var enter = el("button", "exhibit-cover-cta", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Step Inside');
      enter.id = "d-enter"; enter.type = "button";
      content.appendChild(enter);
      cover.appendChild(content);
      return cover;
    }

    function d_end() {
      var end = el("div", "exhibit-cover exhibit-cover--end is-hidden");
      end.id = "d-end";
      var img = el("div", "exhibit-cover-image");
      img.style.backgroundImage = "url('" + (END.image || COVER.image) + "')";
      img.setAttribute("aria-hidden", "true");
      end.appendChild(img);
      var grad = el("div", "exhibit-cover-gradient l3-endcard-wash");
      grad.setAttribute("aria-hidden", "true");
      end.appendChild(grad);
      var content = el("div", "exhibit-cover-content l3-endcard");
      content.innerHTML =
        '<div class="l3-endcard-head">' +
        (END.kicker ? '<span class="exhibit-cover-kicker">' + END.kicker + "</span>" : "") +
        '<h2 class="exhibit-cover-title">' + (END.title || "The data runs deeper") + "</h2>" +
        (END.lede ? '<p class="exhibit-cover-lede">' + END.lede + "</p>" : "") +
        "</div>" +
        (RESOURCES.length ? '<span class="exhibit-cover-links-label">Take the data further</span>' : "");
      if (RESOURCES.length) content.appendChild(d_hub());
      var actions = el("div", "exhibit-cover-actions");
      var restart = el("button", "exhibit-cover-cta", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>Restart exhibit');
      restart.id = "d-restart"; restart.type = "button";
      var all = el("a", "exhibit-cover-cta exhibit-cover-cta--secondary", "View all exhibits");
      all.href = ALL_HREF;
      actions.appendChild(restart); actions.appendChild(all);
      content.appendChild(actions);
      end.appendChild(content);
      return end;
    }

    function buildDesktop() {
      if (de.built) return;
      de.built = true;
      var root = document.getElementById("root-desktop");
      var frame = el("div", "exhibit-frame");
      if (config.frameTint) frame.style.background = config.frameTint;
      frame.appendChild(d_cover());
      frame.appendChild(d_end());

      STEPS.forEach(function (step, i) {
        var bg = el("div", "bg-layer bg-" + step.media.type + (i === 0 ? " active" : ""));
        bg.id = "d-bg-" + i;
        if (step.media.type === "video") {
          var v = el("video");
          v.autoplay = true; v.loop = true; v.muted = true;
          v.setAttribute("muted", ""); v.playsInline = true;
          v.setAttribute("playsinline", ""); v.setAttribute("preload", "metadata");
          if (step.media.poster) v.poster = step.media.poster;
          var s = el("source"); s.src = step.media.src; s.type = "video/mp4";
          v.appendChild(s); bg.appendChild(v);
          if (step.media.credit) bg.appendChild(el("span", "photo-credit", step.media.credit));
        } else if (step.media.type === "photo") {
          bg.style.backgroundImage = "url('" + step.media.src + "')";
          if (step.media.position) bg.style.backgroundPosition = step.media.position;
          if (step.media.credit) bg.appendChild(el("span", "photo-credit", step.media.credit));
        } else if (step.media.type === "gradient" && step.media.gradient) {
          bg.style.background = step.media.gradient;
        }
        frame.appendChild(bg);
      });

      var mapEl = el("div");
      mapEl.id = "d-map";
      mapEl.style.cssText = "position:absolute;inset:0;z-index:1;opacity:0;transition:opacity .6s ease;pointer-events:none;";
      frame.appendChild(mapEl);
      var figEl = el("div"); figEl.id = "d-figure";
      frame.appendChild(figEl);
      var lg = el("div", "map-legend"); lg.id = "d-legend";
      frame.appendChild(lg);

      var panel = el("div", "story-panel panel-dark dark-theme");
      panel.id = "d-panel";
      var inner = el("div", "story-panel-inner");
      STEPS.forEach(function (step, i) {
        var stepEl = el("div", "step" + (i === 0 ? " active" : ""));
        stepEl.dataset.step = i;
        stepEl.appendChild(
          el("div", "step-header",
            '<img class="step-header-mark" src="' + MARK + '" alt="" width="40" height="40" decoding="async" />' +
            '<div class="step-header-text"><span class="kicker">' + (step.kicker || "") + '</span><h2>' + step.title + "</h2></div>"),
        );
        var body = el("div", "body");
        (step.body || []).forEach(function (p) { body.appendChild(el("p", null, p)); });
        if (step.stats) {
          var row = el("div", "stat-row");
          step.stats.forEach(function (s) {
            var pill = el("div", "stat-pill");
            var num = el("div", "num", s.num != null ? s.num : "—");
            if (s.dataKey) num.dataset.stat = s.dataKey;
            pill.appendChild(num);
            pill.appendChild(el("div", "lbl", s.lbl));
            row.appendChild(pill);
          });
          body.appendChild(row);
        }
        if (step.callout) body.appendChild(el("div", "callout", step.callout));
        stepEl.appendChild(body);
        inner.appendChild(stepEl);
      });
      panel.appendChild(inner);

      var nav = el("div", "nav-bar");
      var prev = el("button", null, "Back"); prev.id = "d-prev"; prev.disabled = true;
      var dots = el("div", "step-dots");
      STEPS.forEach(function (_, i) {
        var dot = el("button", "step-dot" + (i === 0 ? " active" : ""));
        dot.dataset.step = i;
        dot.setAttribute("aria-label", "Step " + (i + 1));
        dots.appendChild(dot);
      });
      var next = el("button", null, "Next"); next.id = "d-next";
      nav.appendChild(prev); nav.appendChild(dots); nav.appendChild(next);
      nav.appendChild(el("span", "step-counter"));
      panel.appendChild(nav);
      frame.appendChild(panel);

      if (RESOURCES.length) {
        var toggle = el("button", "level3-drawer-toggle",
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 8l10 5 10-5-10-5Zm0 7.5L4.2 6.6 12 2.7l7.8 3.9L12 10.5ZM2 13l10 5 10-5-2.4-1.2L12 15.3 4.4 11.8 2 13Zm0 5 10 5 10-5-2.4-1.2L12 20.3 4.4 16.8 2 18Z"/></svg>Data &amp; tools');
        toggle.id = "d-drawer-toggle"; toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "d-drawer");
        var aside = el("aside", "level3-drawer");
        aside.id = "d-drawer";
        aside.setAttribute("aria-label", "Data and tools");
        aside.appendChild(el("div", "level3-drawer-head",
          '<p class="level3-drawer-title">Data &amp; tools</p>' +
          '<button class="level3-drawer-close" type="button" aria-label="Close"><svg class="lc lc-sm" aria-hidden="true"><use href="#i-x"/></svg></button>'));
        aside.appendChild(d_drawerBody());
        frame.appendChild(toggle);
        frame.appendChild(aside);
      }

      root.appendChild(frame);
      d_wire();
    }

    function d_wire() {
      var panel = document.getElementById("d-panel");
      var stepEls = panel.querySelectorAll(".step");
      var dots = panel.querySelectorAll(".step-dot");
      var prev = document.getElementById("d-prev");
      var next = document.getElementById("d-next");
      var legendEl = document.getElementById("d-legend");
      var mapEl = document.getElementById("d-map");
      var figureEl = document.getElementById("d-figure");
      var bgLayers = document.querySelectorAll("#root-desktop .bg-layer");
      var cover = document.getElementById("d-cover");
      var end = document.getElementById("d-end");
      var drawerAside = document.getElementById("d-drawer");
      var drawerToggle = document.getElementById("d-drawer-toggle");
      var LAST = STEPS.length - 1;
      var activeFilter = null;
      var seedView = firstMapView();

      var map = L.map(mapEl, { zoomControl: false, attributionControl: true, keyboard: false });
      L.tileLayer(TILE.url, TILE.opts).addTo(map);
      L.layerGroup().addTo(map);
      de.map = map;
      if (seedView) map.fitBounds(VIEWS[seedView].bounds); // seed a view for flyTo

      function panelPad() {
        var fr = document.querySelector("#root-desktop .exhibit-frame");
        var pw = fr ? fr.offsetWidth * 0.44 : 400;
        return { paddingTopLeft: [pw + 20, 30], paddingBottomRight: [30, 30] };
      }
      function flyTo(bounds) {
        var o = panelPad(); o.duration = 1.2; o.maxZoom = 14;
        map.flyToBounds(bounds, o);
      }
      function fitStations(viewKey, filter) {
        var view = VIEWS[viewKey];
        if (filter && view.filter) {
          var field = view.filter.field;
          var m = STATIONS.filter(function (s) { return s[field] === filter; });
          if (m.length) { flyTo(L.latLngBounds(m.map(function (s) { return [s.lat, s.lon]; }))); return; }
        }
        flyTo(view.bounds);
      }
      function buildLegend(viewKey) {
        var view = VIEWS[viewKey];
        legendEl.replaceChildren();
        if (!view.filter) {
          (view.legend || []).forEach(function (item) {
            var chip = el("button", "map-legend-chip");
            chip.innerHTML =
              (item.color ? '<span class="map-legend-dot" style="background:' + item.color + '"></span>' : "") +
              '<span class="map-legend-chip-label" data-label="' + item.label + '">' + item.label + "</span>";
            legendEl.appendChild(chip);
          });
          return;
        }
        var addChip = function (label, value, color) {
          var isActive = value === null ? !activeFilter : activeFilter === value;
          var isDimmed = activeFilter && !isActive;
          var c = el("button", "map-legend-chip" + (isActive ? " active" : "") + (isDimmed ? " dimmed" : ""));
          if (color) { var d = el("span", "map-legend-dot"); d.style.background = color; c.appendChild(d); }
          var l = el("span", "map-legend-chip-label");
          l.setAttribute("data-label", label); l.textContent = label;
          c.appendChild(l);
          c.addEventListener("click", function () {
            activeFilter = value === null ? null : activeFilter === value ? null : value;
            makeMarkers(map, viewKey, activeFilter, true);
            fitStations(viewKey, activeFilter);
            buildLegend(viewKey);
          });
          legendEl.appendChild(c);
        };
        addChip("All", null, null);
        view.filter.options.forEach(function (o) { addChip(o.label, o.value, o.color); });
      }

      function goToStep(n) {
        if (n < 0 || n >= STEPS.length) return;
        de.current = n;
        var panelTheme = d_stepPanel(n);
        stepEls.forEach(function (s) { s.classList.remove("active"); });
        stepEls[n].classList.add("active");
        dots.forEach(function (d) { d.classList.remove("active"); });
        dots[n].classList.add("active");
        prev.disabled = n === 0;
        next.textContent = n === LAST ? "Learn more" : "Next";

        panel.classList.toggle("panel-dark", panelTheme === "dark");
        panel.classList.toggle("dark-theme", panelTheme === "dark");

        bgLayers.forEach(function (l) { l.classList.remove("active"); });
        var bg = document.getElementById("d-bg-" + n);
        if (bg) bg.classList.add("active");

        legendEl.replaceChildren();
        var kind = STEPS[n].media.type;
        var isMap = kind === "map";
        var isCustom = kind === "custom";
        mapEl.style.opacity = isMap ? "1" : "0";
        mapEl.style.pointerEvents = isMap ? "auto" : "none";
        figureEl.classList.toggle("active", isCustom);
        if (isCustom) d_renderFigure(n);

        if (isMap && STATIONS.length) {
          var viewKey = STEPS[n].media.view;
          activeFilter = null;
          setTimeout(function () { map.invalidateSize(); }, 50);
          setTimeout(function () { makeMarkers(map, viewKey, null, true); fitStations(viewKey, null); }, 80);
          buildLegend(viewKey);
        }
      }
      function d_renderFigure(n) {
        var step = STEPS[n];
        if (!step.media.render) return;
        figureEl.innerHTML = "";
        step.media.render(figureEl, { data: DATA, mode: "desktop" });
      }
      de.goToStep = goToStep;
      de.refresh = function () {
        var step = STEPS[de.current];
        if (!step) return;
        if (step.media.type === "map" && STATIONS.length) {
          var viewKey = step.media.view;
          makeMarkers(map, viewKey, activeFilter, true);
          fitStations(viewKey, activeFilter);
        } else if (step.media.type === "custom") {
          d_renderFigure(de.current);
        }
      };

      prev.addEventListener("click", function () { goToStep(de.current - 1); });
      next.addEventListener("click", function () {
        if (de.current === LAST) showEnd(); else goToStep(de.current + 1);
      });
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () { goToStep(parseInt(dot.dataset.step, 10)); });
      });

      function openDrawer() { if (drawerAside) { drawerAside.classList.add("is-open"); drawerToggle.setAttribute("aria-expanded", "true"); } }
      function closeDrawer() { if (drawerAside) { drawerAside.classList.remove("is-open"); drawerToggle.setAttribute("aria-expanded", "false"); } }
      if (drawerToggle) {
        drawerToggle.addEventListener("click", function () {
          drawerAside.classList.contains("is-open") ? closeDrawer() : openDrawer();
        });
        drawerAside.querySelector(".level3-drawer-close").addEventListener("click", closeDrawer);
      }

      function showEnd() { end.classList.remove("is-hidden", "is-leaving"); void end.offsetHeight; end.classList.add("is-entering"); }
      function hideEnd() { end.classList.add("is-leaving"); setTimeout(function () { end.classList.add("is-hidden"); end.classList.remove("is-leaving", "is-entering"); }, 800); }
      document.getElementById("d-enter").addEventListener("click", function () {
        cover.classList.add("is-leaving");
        setTimeout(function () { cover.classList.add("is-hidden"); }, 800);
        goToStep(0);
      });
      document.getElementById("d-restart").addEventListener("click", function () { hideEnd(); goToStep(0); });

      document.addEventListener("keydown", function (e) {
        if (!mqDesktop.matches) return;
        if (e.key === "Escape" && drawerAside && drawerAside.classList.contains("is-open")) { closeDrawer(); return; }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); if (de.current < LAST) goToStep(de.current + 1); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goToStep(de.current - 1); }
      });

      de.current = 0;
      goToStep(0);
    }

    function firstMapView() {
      for (var i = 0; i < STEPS.length; i++) {
        if (STEPS[i].media.type === "map") return STEPS[i].media.view;
      }
      return null;
    }

    // ════════════════════════════════════════════════
    // Shell switch + data
    // ════════════════════════════════════════════════
    function syncShell() {
      var desktop = mqDesktop.matches;
      document.body.classList.toggle("is-desktop", desktop);
      document.getElementById("root-mobile").style.display = desktop ? "none" : "";
      document.getElementById("root-desktop").style.display = desktop ? "" : "none";
      if (desktop) {
        buildDesktop();
        if (de.map) setTimeout(function () { de.map.invalidateSize(); }, 60);
      } else {
        buildMobile();
      }
    }

    if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", syncShell);
    else mqDesktop.addListener(syncShell);
    syncShell();

    if (config.data) {
      WRMP.loadData(config.data)
        .then(function (data) {
          DATA = data;
          STATIONS = data.stations || [];
          fillStats();
          if (mo.built) { m_refreshFrozen(); m_refreshFigures(); }
          if (de.built && de.refresh) de.refresh();
        })
        .catch(function (err) { console.error("Failed to load data:", err); });
    } else {
      fillStats();
    }
  };

  window.WRMP = WRMP;
})();
