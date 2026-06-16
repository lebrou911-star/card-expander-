# Changelog

## v0.14.1

- Fix: with `breakout`, the expanded full-width children could be overlapped by
  neighbouring cards in a sections grid, which then swallowed taps (so toggling
  e.g. lights "worked badly"). The broken-out children are now lifted above
  (`position: relative; z-index`) so they reliably receive pointer events.

## v0.14.0

- The header editor now has a **`{}` YAML toggle**: edit the header card as YAML,
  including **from scratch when empty** (so you can paste/type a card without
  using the picker). The visual editor and trash button remain.

## v0.13.1

- Added a delete (trash) button on the header card in the editor — removing it
  brings back the card picker so you can choose a different header.

## v0.13.0

- The **header** now has a card **picker** in the editor (like the child cards):
  when no header is set you choose the card type from scratch, then edit it.
- New cards start **blank**: `getStubConfig` no longer pre-fills a header or child
  cards, so you build everything from scratch. The card tolerates an empty
  header (shows a "Select a header card" placeholder until you pick one).

## v0.12.0

- Removed the `remember` / `storage-id` options. The card simply starts from
  `expanded` (closed by default) and opens on tap — no persisted state.

## v0.11.0

- Removed the `force-header-toggle` option — the behaviour is now automatic:
  - `expand-on: header` (no chevron): a transparent overlay handles the tap, so
    the header (and its icon "disk") shows but its own tap/icon actions never
    fire.
  - `expand-on: chevron`: the header is left fully normal; only the chevron
    toggles.
  - `expand-on: both`: the chevron toggles and the header also toggles (genuine
    interactive controls still work).

## v0.10.1

- Fix `force-header-toggle`: a capture-phase click listener didn't stop the
  header card's own action (Mushroom fires it on pointer events, not click), so
  e.g. `more-info` still opened. It now uses a transparent overlay on top of the
  header that swallows the tap — the header (and its icon "disk") stays visible
  but never receives pointer events, so its tap/icon actions never fire.

## v0.10.0

- New `force-header-toggle` option. With `expand-on: header`/`both`, tapping
  anywhere on the header expands the card **even over the icon/inner actions**
  (handled in the capture phase). This lets you give the header card an
  `icon_tap_action` (e.g. so a Mushroom icon shows its circular "disk") without
  that action stealing the tap from the expander.

## v0.9.1

- Fix: a double gap appeared under the **collapsed** card. The top spacing
  (`padding-top`) is now applied only when expanded, so the collapsed children
  area is truly 0px tall.

## v0.9.0

- The child-cards editor now **embeds Home Assistant's native stack-card editor**:
  numbered tabs per card, **add (+)**, move, **duplicate**, **cut**, delete, and
  the **"Stack horizontally"** toggle — exactly like editing a built-in
  horizontal/vertical stack. The orientation toggle maps to `child-layout`.
- Removed the now-redundant `child-layout` dropdown from the options form (it is
  controlled by the stack editor's toggle). The `child-layout` config key still
  works.

## v0.8.0

- The child-cards editor now reliably behaves like the **horizontal/vertical
  stack** editor: HA's native nested card editors (`hui-card-element-editor`) and
  the card picker (`hui-card-picker`) are now force-loaded, so you get a real GUI
  to **add, remove, reorder and pick the type** of each child card (instead of
  falling back to YAML). A simple "Add card" button is used if the picker can't
  be loaded.
- Clearer `expand-on` labels — `header` is now described as
  "Header only — tap the card, no chevron", which is the option to expand by
  tapping the header with no chevron shown.

## v0.7.0

- New `breakout` option: let the expanded child cards **break out of the card's
  grid cell and span the full viewport width**, while the header stays inline at
  its normal size (so neighbouring cards on the header's row are not pushed
  away). Combine with `columns` to get a compact inline header that opens into a
  wide, multi-column panel. `breakout-margin` sets the side margin (px).
- The break-out width is measured per card, so it works even when the card is
  not centered, and it re-measures on window resize.

## v0.6.0

- New `header-width` option: shrink the **header** to a fraction of the card
  width (1–12 columns, or a CSS value like `33%` / `200px`) while the expanded
  **child cards keep the full card width**. Useful in *sections* views to get a
  compact header with a wide, multi-column expanded area (set the card itself to
  full width, then `header-width: 4`). `0` = full width (default).
- The chevron now follows the header's right edge even when the header is
  narrower than the card.

## v0.5.0

- New `columns` option (0–12): arrange the child cards in a grid with a fixed
  number of columns (wrapping to new rows as needed). `0` keeps the automatic
  behaviour (vertical stack, or a single row when `child-layout: horizontal`).
  When `columns >= 1` it takes precedence over `child-layout`. Available in the
  visual editor.

## v0.4.0

- The chevron now sits **on top of** the header card (overlay) instead of taking
  its own column, so the header card keeps the **exact same size** as other cards
  in a grid/row.
- New `child-layout` option: `vertical` (stacked below, default) or
  `horizontal` (child cards side by side, wrapping as needed). Also available in
  the visual editor.

## v0.3.0

- The **header** and each **child card** now have a full graphical editor
  (native `hui-card-element-editor`, with built-in GUI/YAML toggle).
- Child cards can be **added** via a card picker, **reordered** (up/down) and
  **deleted** directly in the visual editor.
- Falls back to the YAML editor on older Home Assistant versions.

## v0.2.0

- Added a **visual editor** (Home Assistant GUI): configure `expand-on`, `gap`,
  `expanded`, `remember` and `storage-id` with form controls, and edit the
  `header` / `cards` as YAML (via the native `ha-yaml-editor`, with a JSON
  textarea fallback).
- The card now shows a live **preview** in the "Add card" picker.

## v0.1.1

- Initial release of Expander Card.
- Header card that slides open to reveal child cards.
- Configurable trigger: `expand-on` (`header` / `chevron` / `both`).
- Options: `expanded`, `remember`, `storage-id`, `gap`.
- Automated GitHub releases on push to `main` (version read from `dist/expander-card.js`).
