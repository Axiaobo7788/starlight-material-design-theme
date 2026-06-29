# Changelog

## 0.1.2 - 2026-06-29

### Fixed

- Refined Pagefind search dialog interaction states so result press/focus states
  use MD3 tonal state layers instead of the default Pagefind outline.
- Recentered search and clear icons inside the search dialog with explicit 24px
  Material-style masks.

### Changed

- Expanded the `create-starlight-theme-md3` starter demo with a richer splash
  page, theme snapshot, and typography/content samples so first-run projects
  better show the theme surface.
- Documented the starter demo and search-dialog design decisions.

## 0.1.0 - 2026-06-23

Initial public preview release of `starlight-theme-md3`.

### Added

- Starlight plugin entrypoint exposed as `md3Theme()`.
- Material Design 3 inspired CSS layer stack for tokens, bridge variables,
  layout, prose, components, code blocks, density, motion, and utilities.
- Material color role generation through `@material/material-color-utilities`.
- Theme options for `seed`, `accent`, `preset`, `variant`, `density`, `shape`,
  `contrast`, `tonalSurface`, and `motion`.
- Bundled CSS exports at `starlight-theme-md3/css/index.css` and CSS subpaths.
- MD3-style treatment for high-impact Starlight surfaces: top app bar, sidebar,
  table of contents, search, theme select, cards, asides, tabs, badges, tables,
  code blocks, and pagination.
- Motion runtime for state layers, pointer-origin ripple feedback, disclosure
  motion, TOC tracking, search/menu surfaces, homepage entrance motion, and
  internal route feedback.
- Theme Lab, component samples, token reference, plugin option docs, and Chinese
  README documentation.
- CI workflows for typecheck, contrast checks, build, package consumption, pack
  dry-run, GitHub Pages deployment, and manual visual regression.

### Known Limits

- This is a v0.x public preview. Visual tokens and option names can still change
  before a stable release.
- `expressive` palette generation currently uses a HCT-based approximation while
  newer Material DynamicScheme entrypoints remain unstable in the target Node ESM
  matrix.
- Runtime dynamic color picking and large-scale Starlight component overrides are
  intentionally out of scope for this release.
- `--md3-comp-*` component tokens should be treated as public-preview tokens until
  they survive at least one release cycle.
