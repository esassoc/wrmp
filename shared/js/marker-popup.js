/* ── WRMP Marker Popup ─────────────────────────────
   Builds a DOM-based marker popup card.
   No innerHTML — all nodes created via createElement.
   Requires marker-popup.css and tokens.css to be loaded.

   Usage:
     var el = WRMP.makeMarkerPopup({
       name: "Outer Bair Restoration",
       code: "OBP 1",
       category: "Tidal Pond Slough",
       image: "path/to/img.jpg",   // optional
       showImage: true,            // default true
       sections: [
         { rows: [
           { type: "row",       label: "Project",    value: "Site Type" },
           { type: "hierarchy", label: "Location",   items: [{ value: "South Bay" }, { value: "Bair Island Marsh" }] },
           { type: "tags",      label: "Habitats",   tags:  [{ value: "Wetland", icon: "🌿" }] }
         ]}
       ]
     });
     marker.bindPopup(el);
*/

var WRMP = window.WRMP || {};

(function () {

    // ── Private helpers ───────────────────────────────

    function makeDivider() {
        var hr = document.createElement("hr");
        hr.className = "mp-divider";
        return hr;
    }

    function makeGroupLabel(text) {
        var span = document.createElement("span");
        span.className = "mp-group-label";
        span.textContent = text;
        return span;
    }

    function makeTag(tag) {
        var span = document.createElement("span");
        span.className = "mp-tag";
        if (tag.icon) {
            var icon = document.createElement("span");
            icon.textContent = tag.icon;
            icon.setAttribute("aria-hidden", "true");
            span.appendChild(icon);
        }
        span.appendChild(document.createTextNode(tag.value));
        return span;
    }

    function makeChevron() {
        var span = document.createElement("span");
        span.className = "mp-chevron";
        span.setAttribute("aria-hidden", "true");
        span.textContent = "›";
        return span;
    }

    function makeAttributeRow(row) {
        var div = document.createElement("div");
        div.className = "mp-row";
        var label = document.createElement("span");
        label.className = "mp-row-label";
        label.textContent = row.label;
        var value = document.createElement("span");
        value.className = "mp-row-value";
        value.textContent = row.value;
        div.appendChild(label);
        div.appendChild(value);
        return div;
    }

    function makeTagRow(tags) {
        var div = document.createElement("div");
        div.className = "mp-tag-row";
        tags.forEach(function (tag) {
            div.appendChild(makeTag(tag));
        });
        return div;
    }

    function makeHierarchyRow(items) {
        var div = document.createElement("div");
        div.className = "mp-tag-row mp-tag-row--hierarchy";
        items.forEach(function (item, i) {
            if (i > 0) div.appendChild(makeChevron());
            div.appendChild(makeTag(item));
        });
        return div;
    }

    function makeGroup(groupLabel, children) {
        var div = document.createElement("div");
        div.className = "mp-group";
        if (groupLabel) div.appendChild(makeGroupLabel(groupLabel));
        children.forEach(function (child) { div.appendChild(child); });
        return div;
    }

    function renderRow(row) {
        if (row.type === "row") {
            return makeAttributeRow(row);
        }
        if (row.type === "tags") {
            return makeGroup(row.label || null, [makeTagRow(row.tags)]);
        }
        if (row.type === "hierarchy") {
            return makeGroup(row.label || null, [makeHierarchyRow(row.items)]);
        }
        return document.createTextNode("");
    }

    // ── Public API ────────────────────────────────────

    /**
     * Build a marker popup card element.
     * @param {Object}  opts
     * @param {string}  opts.name        - Site name (required)
     * @param {string}  [opts.code]      - Site code prefix
     * @param {string}  [opts.category]  - Subtype / secondary label
     * @param {string}  [opts.image]     - Image URL
     * @param {boolean} [opts.showImage] - Show image slot (default true)
     * @param {string}  [opts.dotColor]  - Color for the legend dot beside the title
     * @param {Array}   [opts.sections]  - Array of { groupLabel?, rows[] }
     * @returns {HTMLElement}
     */
    WRMP.makeMarkerPopup = function (opts) {
        var card = document.createElement("div");
        card.className = "mp-card";

        // ── Image slot ─────────────────────────────────
        if (opts.showImage !== false) {
            var imageWrap = document.createElement("div");
            imageWrap.className = "mp-image";
            if (opts.image) {
                var img = document.createElement("img");
                img.src = opts.image;
                img.alt = opts.name || "";
                imageWrap.appendChild(img);
            } else {
                var noImg = document.createElement("span");
                noImg.className = "mp-image-label";
                noImg.textContent = "No image";
                imageWrap.appendChild(noImg);
            }
            card.appendChild(imageWrap);
        }

        // ── Body ───────────────────────────────────────
        var body = document.createElement("div");
        body.className = "mp-body";

        // Header: title + optional category + divider
        var headerGroup = document.createElement("div");
        headerGroup.className = "mp-group";

        var title = document.createElement("p");
        title.className = "mp-title";
        if (opts.code) {
            var codeSpan = document.createElement("span");
            codeSpan.className = "mp-title-code";
            codeSpan.textContent = opts.code;
            title.appendChild(codeSpan);
            title.appendChild(document.createTextNode("  \u2014  " + opts.name));
        } else {
            title.textContent = opts.name;
        }

        if (opts.dotColor) {
            var titleRow = document.createElement("div");
            titleRow.className = "mp-title-row";
            var dot = document.createElement("span");
            dot.className = "mp-dot";
            dot.style.background = opts.dotColor;
            titleRow.appendChild(dot);
            titleRow.appendChild(title);
            headerGroup.appendChild(titleRow);
        } else {
            headerGroup.appendChild(title);
        }

        if (opts.category) {
            var cat = document.createElement("p");
            cat.className = "mp-category";
            cat.textContent = opts.category;
            headerGroup.appendChild(cat);
        }

        headerGroup.appendChild(makeDivider());
        body.appendChild(headerGroup);

        // Sections
        var sections = opts.sections || [];
        sections.forEach(function (section, sIdx) {
            if (sIdx > 0) body.appendChild(makeDivider());

            var sectionEl = document.createElement("div");
            sectionEl.className = "mp-section";

            var rows = (section.rows || []).map(renderRow);
            sectionEl.appendChild(makeGroup(section.groupLabel || null, rows));
            body.appendChild(sectionEl);
        });

        card.appendChild(body);
        return card;
    };

    window.WRMP = WRMP;
})();
