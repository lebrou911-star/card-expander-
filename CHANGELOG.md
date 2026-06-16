# Changelog

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
