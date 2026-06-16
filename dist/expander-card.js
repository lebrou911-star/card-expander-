/**
 * Expander Card — header card that slides open to reveal child cards.
 * License: MIT
 */
const VERSION = "0.3.0";

class ExpanderCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._expanded = false;
    this._headerEl = null;
    this._childEls = [];
    this._built = false;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    if (!config.header) throw new Error("You need to define a 'header' card");
    if (!config.cards || !Array.isArray(config.cards)) {
      throw new Error("You need to define a 'cards' list (the children)");
    }
    this._config = {
      "expand-on": "both",
      expanded: false,
      remember: false,
      "storage-id": null,
      gap: 8,
      ...config,
    };
    let initial = !!this._config.expanded;
    if (this._config.remember) {
      const key = this._storageKey();
      const saved = key ? window.localStorage.getItem(key) : null;
      if (saved !== null) initial = saved === "1";
    }
    this._expanded = initial;
    this._built = false;
    if (this.shadowRoot) this._build();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._headerEl) this._headerEl.hass = hass;
    this._childEls.forEach((el) => (el.hass = hass));
  }

  getCardSize() {
    let size = 1;
    if (this._expanded) {
      this._childEls.forEach((el) => {
        size += typeof el.getCardSize === "function" ? el.getCardSize() : 1;
      });
    }
    return size;
  }

  _storageKey() {
    const id = this._config["storage-id"];
    return id ? `expander-card:${id}` : null;
  }

  async _createCardElement(cardConfig) {
    const helpers = await window.loadCardHelpers();
    const el = helpers.createCardElement(cardConfig);
    if (this._hass) el.hass = this._hass;
    el.addEventListener(
      "ll-rebuild",
      (ev) => {
        ev.stopPropagation();
        this._rebuildCard(el, cardConfig);
      },
      { once: true }
    );
    return el;
  }

  async _rebuildCard(oldEl, cardConfig) {
    const newEl = await this._createCardElement(cardConfig);
    if (oldEl.parentElement) oldEl.parentElement.replaceChild(newEl, oldEl);
    return newEl;
  }

  async _build() {
    if (this._built) return;
    this._built = true;
    const gap = Number(this._config.gap) || 0;
    const expandOn = this._config["expand-on"];
    const showChevron = expandOn === "chevron" || expandOn === "both";

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; }
      .wrapper { position: relative; }
      .header-row { display: flex; align-items: stretch; position: relative; }
      .header-card { flex: 1 1 auto; min-width: 0; }
      .chevron {
        flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
        width: 44px; cursor: pointer; color: var(--secondary-text-color);
        transition: transform 0.3s ease;
      }
      .chevron.open { transform: rotate(180deg); }
      .chevron:hover { color: var(--primary-text-color); }
      .header-clickable { cursor: pointer; }
      .children {
        display: grid; grid-template-rows: 0fr;
        transition: grid-template-rows 0.3s ease; overflow: hidden;
      }
      .children.open { grid-template-rows: 1fr; }
      .children-inner {
        min-height: 0; overflow: hidden; display: flex; flex-direction: column;
        gap: ${gap}px; padding-top: ${gap}px;
      }
      @supports not (grid-template-rows: 1fr) {
        .children { display: block; max-height: 0; transition: max-height 0.3s ease; }
        .children.open { max-height: 1500px; }
      }
    `;

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    const headerRow = document.createElement("div");
    headerRow.className = "header-row";

    this._headerEl = await this._createCardElement(this._config.header);
    const headerHolder = document.createElement("div");
    headerHolder.className = "header-card";
    if (expandOn === "header" || expandOn === "both") {
      headerHolder.classList.add("header-clickable");
      headerHolder.addEventListener("click", (ev) => {
        const path = ev.composedPath();
        const interactive = path.some(
          (n) =>
            n.nodeName &&
            /^(HA-SWITCH|HA-SLIDER|INPUT|SELECT|MWC-|HA-ICON-BUTTON)/.test(n.nodeName)
        );
        if (interactive) return;
        this._toggle();
      });
    }
    headerHolder.appendChild(this._headerEl);
    headerRow.appendChild(headerHolder);

    if (showChevron) {
      const chevron = document.createElement("div");
      chevron.className = "chevron" + (this._expanded ? " open" : "");
      chevron.innerHTML = `<ha-icon icon="mdi:chevron-down"></ha-icon>`;
      chevron.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._toggle();
      });
      this._chevronEl = chevron;
      headerRow.appendChild(chevron);
    }
    wrapper.appendChild(headerRow);

    const children = document.createElement("div");
    children.className = "children" + (this._expanded ? " open" : "");
    const inner = document.createElement("div");
    inner.className = "children-inner";
    this._childEls = [];
    for (const childConfig of this._config.cards) {
      const el = await this._createCardElement(childConfig);
      this._childEls.push(el);
      inner.appendChild(el);
    }
    children.appendChild(inner);
    wrapper.appendChild(children);
    this._childrenEl = children;

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(wrapper);
  }

  _toggle() {
    this._expanded = !this._expanded;
    if (this._childrenEl) this._childrenEl.classList.toggle("open", this._expanded);
    if (this._chevronEl) this._chevronEl.classList.toggle("open", this._expanded);
    if (this._config.remember) {
      const key = this._storageKey();
      if (key) window.localStorage.setItem(key, this._expanded ? "1" : "0");
    }
    this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
  }

  connectedCallback() {
    if (!this._built && this._config) this._build();
  }

  static getConfigElement() {
    return document.createElement("expander-card-editor");
  }

  static getStubConfig() {
    return {
      "expand-on": "both",
      expanded: false,
      header: { type: "markdown", content: "## Header (tap to expand)" },
      cards: [
        { type: "markdown", content: "Child card 1" },
        { type: "markdown", content: "Child card 2" },
      ],
    };
  }
}

customElements.define("expander-card", ExpanderCard);

/* ------------------------------------------------------------------ *
 * Visual editor (Home Assistant GUI)
 * ------------------------------------------------------------------ */

const EDITOR_SCHEMA = [
  {
    name: "expand-on",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "header", label: "Header (tap the header card)" },
          { value: "chevron", label: "Chevron (tap the arrow)" },
          { value: "both", label: "Both" },
        ],
      },
    },
  },
  { name: "gap", selector: { number: { min: 0, max: 64, mode: "box", unit_of_measurement: "px" } } },
  { name: "expanded", selector: { boolean: {} } },
  { name: "remember", selector: { boolean: {} } },
  { name: "storage-id", selector: { text: {} } },
];

const EDITOR_LABELS = {
  "expand-on": "Expand on",
  gap: "Gap between child cards",
  expanded: "Start expanded",
  remember: "Remember open/closed state",
  "storage-id": "Storage id (required for 'remember')",
};

const MDI_DELETE =
  "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z";
const MDI_ARROW_UP = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z";
const MDI_ARROW_DOWN = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z";

class ExpanderCardEditor extends HTMLElement {
  constructor() {
    super();
    this._listEds = [];
  }

  setConfig(config) {
    this._config = {
      "expand-on": "both",
      expanded: false,
      remember: false,
      "storage-id": null,
      gap: 8,
      ...config,
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    this._propagate("hass", hass);
  }

  // HA only sets `lovelace` on the config element when the property exists,
  // so defining this setter is what makes nested GUI card editors work.
  set lovelace(lovelace) {
    this._lovelace = lovelace;
    this._propagate("lovelace", lovelace);
  }

  _propagate(prop, value) {
    [this._headerEd, this._picker, ...(this._listEds || [])].forEach((el) => {
      if (el && prop in el) el[prop] = value;
    });
  }

  get _hasNativeEditor() {
    return !!customElements.get("hui-card-element-editor");
  }

  _formData() {
    return {
      "expand-on": this._config["expand-on"],
      gap: Number(this._config.gap) || 0,
      expanded: !!this._config.expanded,
      remember: !!this._config.remember,
      "storage-id": this._config["storage-id"] || "",
    };
  }

  _emit() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _section(title, description) {
    const el = document.createElement("div");
    const t = document.createElement("div");
    t.textContent = title;
    t.style.fontWeight = "600";
    t.style.marginBottom = "4px";
    const d = document.createElement("div");
    d.textContent = description;
    d.style.fontSize = "0.85em";
    d.style.color = "var(--secondary-text-color)";
    d.style.marginBottom = "8px";
    el.appendChild(t);
    el.appendChild(d);
    return el;
  }

  _iconButton(path, label, disabled, onClick) {
    const b = document.createElement("ha-icon-button");
    b.path = path;
    b.label = label;
    b.disabled = !!disabled;
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (!disabled) onClick();
    });
    return b;
  }

  // Full GUI editor for a single card config (with built-in GUI/YAML toggle),
  // falling back to a YAML/JSON editor on older HA versions.
  _makeCardEditor(value, onChange) {
    if (this._hasNativeEditor) {
      const ed = document.createElement("hui-card-element-editor");
      ed.hass = this._hass;
      ed.lovelace = this._lovelace;
      ed.value = value;
      ed.addEventListener("config-changed", (ev) => {
        ev.stopPropagation();
        onChange(ev.detail.config);
      });
      return ed;
    }
    return this._makeObjectEditor(value, onChange);
  }

  // Object/array editor: prefer HA's native ha-yaml-editor, fall back to a JSON textarea.
  _makeObjectEditor(value, onChange) {
    if (customElements.get("ha-yaml-editor")) {
      const ed = document.createElement("ha-yaml-editor");
      ed.hass = this._hass;
      ed.defaultValue = value;
      ed.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        if (ev.detail.isValid === false) return;
        onChange(ev.detail.value);
      });
      return ed;
    }
    const ta = document.createElement("textarea");
    ta.value = JSON.stringify(value, null, 2);
    ta.style.width = "100%";
    ta.style.minHeight = "140px";
    ta.style.fontFamily = "var(--code-font-family, monospace)";
    ta.style.boxSizing = "border-box";
    ta.addEventListener("input", () => {
      try {
        onChange(JSON.parse(ta.value));
      } catch (e) {
        /* ignore until valid JSON */
      }
    });
    return ta;
  }

  _render() {
    if (!this._config) return;
    if (this._rendered) {
      if (this._form) this._form.data = this._formData();
      return;
    }

    this.innerHTML = "";
    const root = document.createElement("div");
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "16px";

    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.data = this._formData();
    form.schema = EDITOR_SCHEMA;
    form.computeLabel = (s) => EDITOR_LABELS[s.name] || s.name;
    form.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._config = { ...this._config, ...ev.detail.value };
      this._emit();
    });
    this._form = form;
    root.appendChild(form);

    root.appendChild(
      this._section("Header card", "The always-visible card. Tap to expand.")
    );
    this._headerEd = this._makeCardEditor(this._config.header || {}, (v) => {
      this._config = { ...this._config, header: v };
      this._emit();
    });
    root.appendChild(this._headerEd);

    root.appendChild(
      this._section("Child cards", "Cards revealed when the header is expanded.")
    );
    this._cardsContainer = document.createElement("div");
    this._cardsContainer.style.display = "flex";
    this._cardsContainer.style.flexDirection = "column";
    this._cardsContainer.style.gap = "12px";
    root.appendChild(this._cardsContainer);
    this._renderCardsList();

    this.appendChild(root);
    this._rendered = true;
  }

  _renderCardsList() {
    const cards = Array.isArray(this._config.cards) ? this._config.cards : [];
    this._listEds = [];
    this._cardsContainer.innerHTML = "";

    // Fallback: a single YAML editor for the whole list.
    if (!this._hasNativeEditor) {
      const ed = this._makeObjectEditor(cards, (v) => {
        this._config = { ...this._config, cards: v };
        this._emit();
      });
      this._cardsContainer.appendChild(ed);
      return;
    }

    cards.forEach((card, index) => {
      const row = document.createElement("div");
      row.style.border = "1px solid var(--divider-color, #e0e0e0)";
      row.style.borderRadius = "8px";
      row.style.padding = "8px";

      const bar = document.createElement("div");
      bar.style.display = "flex";
      bar.style.alignItems = "center";
      bar.style.justifyContent = "space-between";

      const title = document.createElement("span");
      title.textContent = `Card ${index + 1}`;
      title.style.fontWeight = "600";

      const tools = document.createElement("div");
      tools.appendChild(
        this._iconButton(MDI_ARROW_UP, "Move up", index === 0, () =>
          this._moveCard(index, -1)
        )
      );
      tools.appendChild(
        this._iconButton(MDI_ARROW_DOWN, "Move down", index === cards.length - 1, () =>
          this._moveCard(index, 1)
        )
      );
      tools.appendChild(
        this._iconButton(MDI_DELETE, "Delete", false, () => this._deleteCard(index))
      );

      bar.appendChild(title);
      bar.appendChild(tools);
      row.appendChild(bar);

      const ed = this._makeCardEditor(card, (v) => {
        const next = [...this._config.cards];
        next[index] = v;
        this._config = { ...this._config, cards: next };
        this._emit();
      });
      this._listEds.push(ed);
      row.appendChild(ed);
      this._cardsContainer.appendChild(row);
    });

    // Card picker to add a new child card.
    const picker = document.createElement("hui-card-picker");
    picker.hass = this._hass;
    picker.lovelace = this._lovelace;
    picker.addEventListener("config-changed", (ev) => {
      ev.stopPropagation();
      const next = [...(this._config.cards || []), ev.detail.config];
      this._config = { ...this._config, cards: next };
      this._emit();
      this._renderCardsList();
    });
    this._picker = picker;
    this._cardsContainer.appendChild(picker);
  }

  _moveCard(index, delta) {
    const next = [...this._config.cards];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    this._config = { ...this._config, cards: next };
    this._emit();
    this._renderCardsList();
  }

  _deleteCard(index) {
    const next = [...this._config.cards];
    next.splice(index, 1);
    this._config = { ...this._config, cards: next };
    this._emit();
    this._renderCardsList();
  }
}

customElements.define("expander-card-editor", ExpanderCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "expander-card",
  name: "Expander Card",
  description: "A header card that slides open to reveal child cards underneath.",
  preview: true,
  documentationURL: "https://github.com/lebrou911-star/card-expander-",
});

console.info(
  `%c EXPANDER-CARD %c v${VERSION} `,
  "color: white; background: #3b82f6; font-weight: 700;",
  "color: #3b82f6; background: white; font-weight: 700;"
);
