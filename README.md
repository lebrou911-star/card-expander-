# Expander Card

A generic, reusable **Lovelace custom card** for Home Assistant.

You pick **any** card as a *header*. When you tap it (or a chevron on the
right), the card **slides open** with a smooth animation to reveal child cards
underneath. Tap again to slide it closed.

Great for building collapsible menus, grouping related controls, or hiding
rarely-used cards behind a single tap.

![type:video](https://user-images.githubusercontent.com/expander-card-demo.gif)

---

## Features

- Use **any** Home Assistant card as the header.
- Reveal **any** number of child cards with a slide-down animation.
- Choose what triggers the toggle: the **header**, a **chevron**, or **both**.
- Optionally **remember** the open/closed state across reloads (per card).
- Configurable spacing between child cards.
- No build step, no dependencies — a single `.js` file.

---

## Installation

### Via HACS (recommended)

This card is distributed as a **custom repository** in HACS.

1. In Home Assistant, go to **HACS**.
2. Click the **three-dot menu** (top right) → **Custom repositories**.
3. Paste the URL of this GitHub repository.
4. Choose the category **Lovelace** (also called *Dashboard* on newer HACS).
5. Click **Add**.
6. Find **Expander Card** in the HACS list, open it and click **Download**.
7. **Hard-refresh** your browser (see below) so the new resource loads.

HACS registers the Lovelace resource automatically. If you ever need to add it
manually (e.g. YAML-mode dashboards), the resource is:

```yaml
url: /hacsfiles/expander-card/expander-card.js
type: module
```

### Hard refresh

Browsers cache Lovelace resources aggressively. After installing or updating:

- **Windows/Linux:** `Ctrl` + `F5` (or `Ctrl` + `Shift` + `R`)
- **macOS:** `Cmd` + `Shift` + `R`
- On mobile companion apps: clear the app's frontend cache from
  **Settings → Companion App → Debugging → Reset frontend cache**, then restart
  the app.

---

## Usage

The card ships with a full **visual editor**. Edit your dashboard → **Add Card**
→ find **Expander Card** in the picker (with a live preview). The GUI lets you:

- set `expand-on`, `gap`, `expanded`, `remember` and `storage-id` with form
  controls;
- edit the **header card** with its own graphical editor (GUI/YAML toggle);
- **add** child cards via the card picker, edit each one graphically, and
  **reorder** or **delete** them.

(On older Home Assistant versions, `header`/`cards` fall back to a YAML editor.)

You can also configure it purely in YAML (**Add Card → Manual**). Minimal
example:

```yaml
type: custom:expander-card
expand-on: both
header:
  type: markdown
  content: "## Tap me to expand"
cards:
  - type: markdown
    content: "Child card 1"
  - type: markdown
    content: "Child card 2"
```

---

## Options

| Option        | Type            | Default  | Description                                                                                 |
| ------------- | --------------- | -------- | ------------------------------------------------------------------------------------------- |
| `type`        | string          | —        | Required. Must be `custom:expander-card`.                                                    |
| `header`      | card object     | —        | **Required.** Any Lovelace card config used as the always-visible header.                    |
| `cards`       | list of cards   | —        | **Required.** The child cards revealed when expanded.                                        |
| `expand-on`   | string          | `both`   | What toggles the card: `header`, `chevron`, or `both`.                                       |
| `child-layout`| string          | `vertical` | How child cards are arranged: `vertical` (stacked below) or `horizontal` (side by side).   |
| `columns`     | number          | `0`      | Arrange child cards in a grid of N columns (1–12). `0` = auto (follows `child-layout`). Wins over `child-layout` when ≥ 1. |
| `header-width`| number / string | `0`      | Shrink only the header: `1`–`12` = that many of 12 columns, or a CSS value (`33%`, `200px`). `0` = full width. Children keep the full card width. |
| `breakout`    | boolean         | `false`  | Let the expanded children span the **full viewport width**, breaking out of the card's grid cell. The header stays inline at its normal size. |
| `breakout-margin` | number (px) | `8`      | Side margin used when `breakout` is on.                                                      |
| `expanded`    | boolean         | `false`  | Whether the card starts open.                                                                |
| `remember`    | boolean         | `false`  | Remember the open/closed state in the browser's `localStorage`. Requires `storage-id`.       |
| `storage-id`  | string          | `null`   | A unique id used as the storage key when `remember` is enabled. Give each card its own id.   |
| `gap`         | number (px)     | `8`      | Vertical space (in pixels) between child cards.                                              |

### Notes

- `expand-on: header` shows **no chevron** and expands when you tap the header
  card itself. Interactive header controls (switches, sliders, icon buttons,
  inputs…) keep working — tapping them will **not** toggle the expander.
- `expand-on: chevron` shows a chevron on the right of the header; only the
  chevron toggles.
- `expand-on: both` does both (header tap **and** chevron).
- The chevron is drawn **on top of** the header card (top-right), so the header
  card keeps the same width as any neighbouring card in a grid.
- `child-layout: horizontal` lays the child cards out in a row (wrapping to new
  rows as needed); `gap` then controls both horizontal and vertical spacing.
- `columns: N` (1–12) arranges the child cards in a grid of exactly N equal
  columns, wrapping onto more rows as needed — e.g. `columns: 3` shows three per
  row. It overrides `child-layout` when set to 1 or more.
- `header-width` keeps the **header compact while the children stay full width**.
  In a *sections* view a card has a single width, so to get a small header with a
  wide multi-column expanded area: set the card itself to full width (its HA
  *Layout → Columns* = 12), then e.g. `header-width: 4` (header = 1/3) and
  `columns: 3` (children in three columns across the full width).
- `breakout: true` is the **best of both** in a *sections* view: keep the card at
  its small size so it stays inline next to its neighbours, and the expanded
  children will still span the full viewport width (combine with `columns: 3` for
  a wide three-column panel). The children float out below the header and push
  the content underneath down.
- `remember` only persists if you also set a `storage-id`. The state is stored
  per-browser under the key `expander-card:<storage-id>`.

---

## Example: a "Lock" menu

A [Mushroom](https://github.com/piitaya/lovelace-mushroom) template card as the
header (a padlock icon) that expands to reveal three openings — a Nuki lock, the
garage door, and the gate. Each child toggles its entity, with a confirmation
prompt.

```yaml
type: custom:expander-card
expand-on: both
remember: true
storage-id: lock-menu
gap: 8
header:
  type: custom:mushroom-template-card
  primary: Sécurité
  secondary: Serrures & ouvrants
  icon: mdi:lock
  icon_color: blue
  tap_action:
    action: none
cards:
  - type: custom:mushroom-template-card
    primary: Nuki
    secondary: "{{ states('lock.nuki_lattes_1') }}"
    icon: mdi:lock-smart
    icon_color: "{{ 'green' if is_state('lock.nuki_lattes_1', 'locked') else 'red' }}"
    tap_action:
      action: toggle
      confirmation:
        text: Verrouiller / déverrouiller le Nuki ?
    entity: lock.nuki_lattes_1
  - type: custom:mushroom-template-card
    primary: Garage
    secondary: "{{ states('cover.garage_door_ext') }}"
    icon: mdi:garage
    icon_color: "{{ 'red' if is_state('cover.garage_door_ext', 'open') else 'green' }}"
    tap_action:
      action: toggle
      confirmation:
        text: Ouvrir / fermer le garage ?
    entity: cover.garage_door_ext
  - type: custom:mushroom-template-card
    primary: Portail
    secondary: "{{ states('cover.bust4_z_wave_interface') }}"
    icon: mdi:gate
    icon_color: "{{ 'red' if is_state('cover.bust4_z_wave_interface', 'open') else 'green' }}"
    tap_action:
      action: toggle
      confirmation:
        text: Ouvrir / fermer le portail ?
    entity: cover.bust4_z_wave_interface
```

> The Mushroom cards above require the
> [Mushroom](https://github.com/piitaya/lovelace-mushroom) frontend integration
> (also installable via HACS). The expander card itself works with **any** card
> type.

---

## License

[MIT](LICENSE)
