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
- [ ] Test responsive navigation, search modal, generated sidebars, and MDX components.
- [ ] Add focused visual regression screenshots for common docs pages.
- [x] Add demo coverage for long-form content, Chinese paragraphs, tables, tabs, badges, cards, steps, and code.
- [x] Add homepage and component-page theme snapshots for color roles, control states, and navigation density.

## Phase 3: Package Shape

- [x] Set the local package name and plugin name to `starlight-theme-md3`.
- [x] Extract CSS into a distributable package entrypoint.
- [x] Add build output for `dist/index.js`, `dist/index.d.ts`, and `dist/css/index.css`.
- [x] Validate `exports` for `starlight-theme-md3` and `starlight-theme-md3/css/index.css`.
- [x] Document seed color, radius, density, and component override options.

## Phase 4: Material You Depth

- [x] Add generated tonal palettes with a build-time palette helper.
- [x] Offer named presets for neutral, playful, and high-contrast docs.
- [ ] Consider a small client-side color seed demo for theme documentation, not as a runtime dependency for every docs site.
- [ ] Revisit official Material color utilities when its package exports are stable in the target Node and bundler matrix.

## MVP Exclusions

- Backlinks and graph view.
- Runtime dynamic color picker.
- Command palette or custom search backend.
- A full Material Web Components wrapper layer.
- Large-scale Starlight component rewrites.
