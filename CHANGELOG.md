# Changelog

## 0.2.2 - 2026-09-05

### Added

- Added an opt-in MD3 runtime color picker with `off`, `author`, `visitor`, and
  `both` modes. Author mode previews palettes and copies plugin configuration;
  visitor mode applies, resets, and optionally persists generated light/dark
  color roles without requiring Material Web Components at runtime.
- Added a desktop modal dialog and mobile navigation-drawer row with a modal
  bottom sheet, including a dependency-free saturation/value color surface,
  hue track, hex input, animated segmented controls, and palette variants.

### Changed

- Shared Material Color Utilities palette generation between build-time plugin
  configuration and the optional browser runtime.
- Updated the mobile runtime color picker to a compact 48px MD3 swatch button
  beside social actions while retaining the labelled appearance switcher.
- Refined the picker with selected checkmarks for single-choice segmented
  buttons, an animated filled-field active indicator, and a fully inset color
  preview outline that cannot be clipped by the expanding control surface.
- Updated the demo toolchain to Astro 7.3, Starlight 0.42, Playwright 1.63, and
  compatible current build/check dependencies.
- Added Starlight 0.41/0.42 mobile navigation compatibility for both the legacy
  expanded-state element and the current Popover-based sidebar.
- Removed the unreliable experimental operating-system accent source because
  browsers may return privacy-preserving fixed system colors instead of the
  user's real accent.

### Fixed

- Kept dialog and bottom-sheet contents attached to their container during exit
  motion so applying a visitor palette no longer leaves a briefly empty surface.

## 0.2.1 - 2026-07-22

### Fixed

- Synchronized desktop and mobile table-of-contents state through Starlight's
  current-link setter, including exact-bottom correction and duplicate
  `aria-current` cleanup during interrupted navigation.
- Replaced the lagging duration-based desktop TOC marker with a real indicator
  that uses an interruptible spring while scrolling and a cancellable 250ms
  emphasized FLIP transition for direct navigation.

### Changed

- Added nested-heading coverage to Theme Lab and expanded Playwright coverage
  for final-item alignment, hierarchy offsets, rapid direction reversal,
  click-state contention, and reduced motion.
- Documented the TOC motion tokens and refreshed visual baselines for the
  current Astro 7 and Starlight 0.41 demo.

## 0.2.0 - 2026-06-30

### Changed

- Updated the supported runtime line to Astro 7 and Starlight 0.41.
- Updated the demo, package-consumption fixture, and create-project template to
  build against Astro 7.
- Recentered the header social icon button contents so screen-reader-only text
  does not affect icon alignment.

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
- Large-scale Starlight component overrides remain intentionally out of scope.
- `--md3-comp-*` component tokens should be treated as public-preview tokens until
  they survive at least one release cycle.
