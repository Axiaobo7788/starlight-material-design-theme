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
- [x] Add local `--md3-comp-*` tokens for sidebar navigation, TOC links, search, cards, asides, badges, tabs, code blocks, and pagination.

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
- [x] Add a small demo-only seed preview for theme documentation without adding runtime work to every docs site.
- [x] Revisit newer Material DynamicScheme entrypoints and keep them deferred until their package imports work in the target Node ESM matrix.

## Official MD3 Comparison

What is now aligned:

- The theme is token-first: `--md-sys-*` system roles hold color, type, shape, elevation, motion, and state decisions.
- Color roles are semantic rather than page-specific: Starlight surfaces, selected states, asides, badges, and code blocks consume role names instead of raw hex values.
- Component styling now has a local `--md3-comp-*` layer for the same kind of indirection Material components use internally.
- State layers are shared across navigation, search, tabs, buttons, and TOC instead of each component inventing a separate hover color.
- Material Web remains a design reference only; the runtime stays CSS variables plus the Starlight plugin.

Remaining post-MVP choices:

- Component tokens are local names, not a full Material Web token contract. This remains intentional so Starlight users get a small CSS API instead of a Material Web wrapper layer.
- Runtime dynamic color remains a documentation demo rather than a default runtime feature for every consuming docs site.
- Newer expressive DynamicScheme classes remain out of scope until the package import path is stable in this Node/bundler matrix.

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
- `contrast: 'standard' | 'medium' | 'high'` is available for state, outline, and selected-tone emphasis.
- `src/styles/md3/index.css` is bundled to `dist/css/index.css` with Lightning CSS during `pnpm run build:theme`.
- Theme Lab exists at `src/content/docs/guides/theme-lab.mdx`.
- Screenshot baselines cover homepage, Theme Lab, implementation plan, and plugin options in desktop/mobile plus light/dark.
- A package consumption fixture exists under `fixtures/package-consumption/`.
- CI exists at `.github/workflows/ci.yml`.

Post-MVP release hardening:

- Keep `--md3-comp-*` public-preview tokens stable for at least one release cycle before promoting them to stable public API.
- Add more consuming-project examples for token overrides.
- Revisit DynamicScheme only after Material Color Utilities publishes Node-compatible ESM imports; do not regress the currently passing CorePalette path.

Required verification before handing back:

```sh
pnpm run typecheck
pnpm run check:contrast
pnpm run build
pnpm run test:screenshots
CI=1 pnpm run test:screenshots
pnpm run verify:package
pnpm pack --dry-run
```

Known caveats:

- `tonalSpot` and `content` use Material Color Utilities core palettes directly.
- `expressive` currently keeps the public option but uses a HCT-based approximation because newer DynamicScheme entrypoints are not stable under Node ESM.
