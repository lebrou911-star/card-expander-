# Changelog

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
