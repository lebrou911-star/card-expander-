/**
 * Expander Card — header card that slides open to reveal child cards.
 * License: MIT
 */
const VERSION = "0.1.1";

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

window.customCards = window.customCards || [];
window.customCards.push({
  type: "expander-card",
  name: "Expander Card",
  description: "A header card that slides open to reveal child cards underneath.",
  preview: false,
});

console.info(
  `%c EXPANDER-CARD %c v${VERSION} `,
  "color: white; background: #3b82f6; font-weight: 700;",
  "color: #3b82f6; background: white; font-weight: 700;"
);
