---
title: Implementation Plan
description: A practical build plan for turning the concept into a reusable Starlight theme.
---

## Design Guardrails

- Use Material Design 3 and Material Web as references for token names, color roles, shape, elevation, state layers, and component tone.
- Do not make `@material/web` a core runtime dependency.
- Keep Starlight's content model, search, navigation, and MDX components intact.
- Prefer CSS variables and a Starlight plugin before Astro component overrides.
- Use overrides only when CSS cannot express a necessary DOM or behavior change.

## Phase 1: Local Theme Prototype

- [x] Install and verify Starlight.
- [x] Map Material You system tokens onto Starlight CSS variables.
- [x] Replace starter content with concept and token documentation.
- [x] Add a local Starlight plugin entrypoint.
- [x] Split CSS into token, bridge, layout, prose, component, code, and utility layers.
- [x] Declare CSS cascade layers so MD3 theme rules sit after Starlight's built-in layers.

## Phase 2: Theme Hardening

- [x] Audit light and dark contrast for core MD3 foreground/background token pairs.
- [x] Test responsive navigation, generated sidebars, TOC, and MDX components through Theme Lab.
- [x] Add focused visual regression screenshots for desktop/mobile and light/dark modes.
- [x] Add demo coverage for long-form content, Chinese paragraphs, tables, tabs, badges, cards, steps, and code.
- [x] Add homepage and component-page theme snapshots for color roles, control states, and navigation density.

## Phase 3: Package Shape

- [x] Set the local package name and plugin name to `starlight-theme-md3`.
- [x] Extract CSS into a distributable package entrypoint.
- [x] Bundle `src/styles/md3/index.css` to `dist/css/index.css` with Lightning CSS while keeping CSS subpath exports.
- [x] Add build output for `dist/index.js`, `dist/index.d.ts`, and `dist/css/index.css`.
- [x] Validate `exports` for `starlight-theme-md3` and `starlight-theme-md3/css/index.css`.
- [x] Document seed color, radius, density, and component override options.
- [x] Add CI for install, typecheck, contrast, build, screenshots, and pack dry-run.

## Phase 4: Material You Depth

- [x] Generate seed color roles with `@material/material-color-utilities`.
- [x] Offer named presets for neutral, playful, and high-contrast docs.
- [ ] Consider a small client-side color seed demo for theme documentation, not as a runtime dependency for every docs site.
- [ ] Revisit newer Material DynamicScheme entrypoints when their package imports are stable in the target Node and bundler matrix.

## MVP Exclusions

- Backlinks and graph view.
- Runtime dynamic color picker.
- Command palette or custom search backend.
- A full Material Web Components wrapper layer.
- Large-scale Starlight component rewrites.

## Next Codex Handoff

Current baseline:

- The package API must remain `plugins: [md3Theme()]`.
- Do not add Tailwind to the main theme chain. If Tailwind is ever needed, keep it as a demo-only or custom-component `devDependency`; never make it a `peerDependency`.
- `@material/web` is a reference only and must not become a core runtime dependency.
- Seed colors now use `@material/material-color-utilities` in `src/palette.ts`.
- `src/styles/md3/index.css` is bundled to `dist/css/index.css` with Lightning CSS during `pnpm run build:theme`.
- Theme Lab exists at `src/content/docs/guides/theme-lab.mdx`.
- Screenshot baselines exist under `tests/theme-screenshots.spec.ts-snapshots/`.
- CI exists at `.github/workflows/ci.yml`.

Recommended next tasks:

- Add explicit component-level CSS tokens, likely `--md3-comp-*`, for sidebar nav items, TOC links, search field, cards, tabs, badges, asides, code blocks, and pagination.
- Expand typography tokens toward the full MD3 type scale: display, headline, title, body, and label roles with size, line-height, weight, and tracking decisions.
- Add clearer elevation and tonal-surface policy: when to use `surface-container-*`, when to use shadow, and which Starlight surfaces map to each level.
- Expand state layers beyond hover/focus: selected, pressed, disabled, and focus-visible states should be consistent across navigation, tabs, cards, buttons, and search.
- Add screenshot coverage for the homepage, implementation plan page, and plugin options page after component tokens are introduced.
- Add a package-consumption fixture that installs the built package into a separate minimal Starlight project and verifies `md3Theme()` plus `starlight-theme-md3/css/index.css` exports.
- Consider adding `site` to `astro.config.mjs` for the demo to remove the sitemap warning during `pnpm run build`.
- Revisit newer Material DynamicScheme modules only if their package imports work reliably in the Node/bundler matrix; do not regress the currently passing CorePalette path.

Required verification before handing back:

```sh
pnpm run typecheck
pnpm run check:contrast
pnpm run build
pnpm run test:screenshots
CI=1 pnpm run test:screenshots
pnpm pack --dry-run
```

Known caveats:

- `tonalSpot` and `content` use Material Color Utilities core palettes directly.
- `expressive` currently keeps the public option but uses a HCT-based approximation until newer DynamicScheme entrypoints are stable.
- Build currently succeeds with a sitemap warning if `site` is not configured.
