/* ════════════════════════════════════════════════════════════
   WRMP.org — Exhibits gallery
   ────────────────────────────────────────────────────────────
   Renders the round-3 poster grid from data/exhibits.json and
   wires two dropdown filters that intersect: the management-
   question dropdown (custom, with a guiding-question color dot
   per option) and the Topic <select>. The page always lands on
   "All" — filtering is in-page only, not restored from the URL.

   The MQ dropdown lists the FULL framework (every management
   question in the taxonomy, incl. Q5), not just the ones with an
   exhibit today — selecting an empty one shows the empty state.
   Card, badge and topic-chip visuals come from exhibit-tags.css.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var DATA_URL = "../data/exhibits.json";
  var ASSET_BASE = "../"; // exhibits.json paths are project-root relative
  var FRAMEWORK_PAGE = "science-framework-round2.html";

  var grid = document.getElementById("exhibit-grid");
  var mqMount = document.getElementById("mq-filter");
  var topicSelect = document.getElementById("topic-select");
  var emptyMsg = document.getElementById("gallery-empty");
  if (!grid || !mqMount) return;

  var mqText = {}; // code -> full management-question text
  var mqTextShort = {}; // code -> 3–8 word summary (dropdown label)
  var topicNames = {}; // slug -> display name
  var activeMq = ""; // "" = All questions
  var activeTopic = ""; // "" = All topics

  // MQ dropdown DOM (built in buildMqDropdown)
  var mqTrigger, mqValue, mqDot, mqList;
  var mqOptions = []; // { code, li }

  // ── small DOM helpers ──
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }
  function gqDigit(code) {
    return code.charAt(0); // leading digit drives the color tier
  }
  function badgeTitle(code) {
    return code + " — " + (mqText[code] || "");
  }
  function dotColor(code) {
    // Mid-tone (--qN-mq) reads as the question's hue at dot size; the
    // deeper --qN-ink converges to brown across the warm tiers (Q3–Q5).
    return code ? "var(--q" + gqDigit(code) + "-mq)" : "";
  }

  // ── one MQ badge, rendered as a link to the framework section ──
  function badgeLink(code) {
    var a = el("a", "exhibit-tag");
    a.setAttribute("data-gq", gqDigit(code));
    a.setAttribute("href", FRAMEWORK_PAGE + "#mq-" + code);
    a.setAttribute("title", badgeTitle(code));
    a.textContent = code;
    return a;
  }

  // ── one poster card ──
  function buildCard(ex) {
    var mqs = ex.managementQuestions || [];
    var topics = ex.topics || [];

    var item = el("article", "gallery-item");
    item.setAttribute("data-mqs", mqs.join(" "));
    item.setAttribute("data-topics", topics.join(" "));

    var frame = el("div", "exhibit-card-frame");

    var card = el("a", "exhibit-card");
    card.setAttribute("href", ASSET_BASE + ex.href);
    card.setAttribute("aria-label", "Open exhibit: " + ex.title);

    var image = el("span", "exhibit-card-image");
    image.style.backgroundImage = "url('" + ASSET_BASE + ex.cover + "')";
    var gradient = el("span", "exhibit-card-gradient");

    var begin = el("span", "exhibit-card-begin");
    begin.setAttribute("aria-hidden", "true");
    begin.appendChild(playIcon());
    begin.appendChild(document.createTextNode("Begin exhibit"));

    var content = el("span", "exhibit-card-content");
    var kicker = el("span", "exhibit-card-kicker");
    kicker.textContent = ex.kicker;
    var title = el("span", "exhibit-card-title");
    title.textContent = ex.title;
    var dots = el("span", "exhibit-card-dots");
    dots.setAttribute("aria-label", ex.steps + " stops");
    for (var i = 0; i < ex.steps; i++) {
      dots.appendChild(el("span", "exhibit-card-dot"));
    }
    content.appendChild(kicker);
    content.appendChild(title);
    content.appendChild(dots);

    card.appendChild(image);
    card.appendChild(gradient);
    card.appendChild(begin);
    card.appendChild(content);

    // On-poster MQ badges — siblings of the card, overlay top-left.
    var onPoster = el("div", "exhibit-tags exhibit-tags--on-poster");
    mqs.forEach(function (code) {
      onPoster.appendChild(badgeLink(code));
    });

    var marker = el("span", "exhibit-marker");
    marker.setAttribute("aria-hidden", "true");

    frame.appendChild(card);
    frame.appendChild(onPoster);
    frame.appendChild(marker);
    item.appendChild(frame);
    return item;
  }

  // Play-triangle glyph for the hover "Begin" pill (no innerHTML).
  function playIcon() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M8 5v14l11-7z");
    svg.appendChild(path);
    return svg;
  }

  // ── filtering: a card shows only if it matches BOTH the active MQ
  //    AND the selected Topic (empty = All on either axis) ──
  function applyFilters() {
    var items = grid.querySelectorAll(".gallery-item");
    var visible = 0;
    items.forEach(function (item) {
      var mqs = (item.getAttribute("data-mqs") || "").split(" ");
      var topics = (item.getAttribute("data-topics") || "").split(" ");
      var show =
        (!activeMq || mqs.indexOf(activeMq) !== -1) &&
        (!activeTopic || topics.indexOf(activeTopic) !== -1);
      item.hidden = !show;
      if (show) visible++;
    });
    syncMqTrigger();
    if (topicSelect) topicSelect.value = activeTopic;
    if (emptyMsg) emptyMsg.hidden = visible !== 0;
  }

  /* ── Custom MQ dropdown ─────────────────────────────────────
     Native <option> can't carry a colored dot, so this is a
     button + role="listbox". Options: "All" + every taxonomy MQ,
     each with a guiding-question color dot. */
  function mqChevron() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "mq-select__chevron");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", "m6 9 6 6 6-6");
    svg.appendChild(path);
    return svg;
  }

  function makeOption(code, codeLabel, textLabel, fullText) {
    var li = el("li", "mq-select__option");
    li.setAttribute("role", "option");
    li.setAttribute("data-mq", code);
    li.setAttribute("tabindex", "-1");
    if (fullText) li.setAttribute("title", fullText); // hover = full question
    var dot = el("span", "mq-select__dot" + (code ? "" : " mq-select__dot--all"));
    if (code) dot.style.background = dotColor(code);
    var codeEl = el("span", "mq-select__opt-code");
    codeEl.textContent = codeLabel;
    var textEl = el("span", "mq-select__opt-text");
    textEl.textContent = textLabel;
    li.appendChild(dot);
    li.appendChild(codeEl);
    li.appendChild(textEl);
    li.addEventListener("click", function () {
      selectMq(code);
      closeList(true);
    });
    mqOptions.push({ code: code, li: li });
    return li;
  }

  function buildMqDropdown(codes) {
    var wrap = el("div", "mq-select");

    mqTrigger = el("button", "mq-select__trigger");
    mqTrigger.type = "button";
    mqTrigger.setAttribute("aria-haspopup", "listbox");
    mqTrigger.setAttribute("aria-expanded", "false");
    mqTrigger.setAttribute("aria-labelledby", "mq-label");
    mqDot = el("span", "mq-select__dot mq-select__dot--all");
    mqValue = el("span", "mq-select__value");
    mqValue.textContent = "All management questions";
    mqTrigger.appendChild(mqDot);
    mqTrigger.appendChild(mqValue);
    mqTrigger.appendChild(mqChevron());

    mqList = el("ul", "mq-select__list");
    mqList.setAttribute("role", "listbox");
    mqList.setAttribute("aria-label", "Management question");
    mqList.hidden = true;
    mqList.appendChild(makeOption("", "All", "management questions"));
    codes.forEach(function (code) {
      // Show a 3–8 word summary; full text stays on hover (title).
      var short = mqTextShort[code] || mqText[code] || "";
      mqList.appendChild(makeOption(code, code, short, mqText[code] || ""));
    });

    mqTrigger.addEventListener("click", function () {
      if (mqList.hidden) openList();
      else closeList(true);
    });
    mqTrigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openList();
      }
    });
    mqList.addEventListener("keydown", onListKeydown);

    wrap.appendChild(mqTrigger);
    wrap.appendChild(mqList);
    mqMount.appendChild(wrap);

    // close on outside click
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) closeList(false);
    });
  }

  function focusOption(idx) {
    if (idx < 0) idx = mqOptions.length - 1;
    if (idx >= mqOptions.length) idx = 0;
    mqOptions[idx].li.focus();
  }
  function currentIndex() {
    for (var i = 0; i < mqOptions.length; i++) {
      if (mqOptions[i].li === document.activeElement) return i;
    }
    return -1;
  }
  function onListKeydown(e) {
    var i = currentIndex();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusOption(i + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusOption(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusOption(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusOption(mqOptions.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (i >= 0) {
        selectMq(mqOptions[i].code);
        closeList(true);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeList(true);
    } else if (e.key === "Tab") {
      closeList(false);
    }
  }

  function openList() {
    mqList.hidden = false;
    mqTrigger.setAttribute("aria-expanded", "true");
    // focus the selected option (or the first)
    var sel = 0;
    for (var i = 0; i < mqOptions.length; i++) {
      if (mqOptions[i].code === activeMq) {
        sel = i;
        break;
      }
    }
    focusOption(sel);
  }
  function closeList(returnFocus) {
    if (mqList.hidden) return;
    mqList.hidden = true;
    mqTrigger.setAttribute("aria-expanded", "false");
    if (returnFocus) mqTrigger.focus();
  }

  function selectMq(code) {
    activeMq = code;
    applyFilters();
  }

  // Reflect activeMq in the trigger + option selected-state.
  function syncMqTrigger() {
    if (!mqTrigger) return;
    if (activeMq) {
      mqValue.textContent = activeMq;
      mqDot.className = "mq-select__dot";
      mqDot.style.background = dotColor(activeMq);
    } else {
      mqValue.textContent = "All management questions";
      mqDot.className = "mq-select__dot mq-select__dot--all";
      mqDot.style.background = "";
    }
    mqOptions.forEach(function (o) {
      var on = o.code === activeMq;
      o.li.classList.toggle("is-selected", on);
      o.li.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  // ── Topic <select>: only topics that have ≥1 exhibit, in taxonomy
  //    order, plus the default All topics. ──
  function buildTopicSelect(slugs) {
    if (!topicSelect) return;
    var allOpt = el("option");
    allOpt.value = "";
    allOpt.textContent = "All topics";
    topicSelect.appendChild(allOpt);
    slugs.forEach(function (slug) {
      var opt = el("option");
      opt.value = slug;
      opt.textContent = topicNames[slug];
      topicSelect.appendChild(opt);
    });
    topicSelect.addEventListener("change", function () {
      activeTopic = topicSelect.value;
      applyFilters();
    });
  }

  // ── load + render ──
  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      var tax = data.taxonomy || {};
      mqText = tax.managementQuestions || {};
      mqTextShort = tax.managementQuestionsShort || {};
      topicNames = tax.topics || {};
      var exhibits = data.exhibits || [];

      // Both filters list the FULL taxonomy — every management question
      // and every monitoring topic — not only those with an exhibit
      // today; picking an empty one shows the empty state.
      var allCodes = Object.keys(mqText).sort();
      var allTopics = Object.keys(topicNames);

      buildMqDropdown(allCodes);
      buildTopicSelect(allTopics);
      exhibits.forEach(function (ex) {
        grid.appendChild(buildCard(ex));
      });

      // Always land on the full set — the page defaults to "All
      // management questions" / "All topics"; filtering is in-page only.
      applyFilters();
    })
    .catch(function (err) {
      grid.textContent = "";
      var p = el("p", "gallery-empty");
      p.textContent = "Sorry — the exhibit list could not be loaded.";
      p.hidden = false;
      grid.appendChild(p);
      if (window.console) window.console.error("Exhibits gallery:", err);
    });
})();
