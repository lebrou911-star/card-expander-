# Changelog

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
