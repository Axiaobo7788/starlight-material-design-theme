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

## Stage Review

Estimated overall completion: **about 82%** toward a polished v0.x release.

The theme has moved beyond a visual prototype. The core plugin shape, package
exports, CSS layer architecture, token generation, demo docs, CI, and regression
tests are in place. The remaining work is less about proving the theme can work
and more about making the visual language feel consistently Material Design 3
across every Starlight edge case.

| Area | Completion | Current read |
| --- | ---: | --- |
| Plugin and package API | 90% | `md3Theme()` works as the primary integration surface, with CSS exports and package-consumption checks in place. |
| Token and color system | 84% | Material Color Utilities generate the main roles, presets exist, and contrast checks pass; final polish is still needed for brand-like palette harmony. |
| Component styling | 80% | Navigation, TOC, search, cards, asides, tabs, badges, code, tables, and pagination have MD3-style tokens and states; some surfaces still need visual audit against official MD3 patterns. |
| Motion and interaction | 76% | State layers, pointer-origin ripple, disclosure motion, TOC tracking, dialogs, route feedback, and homepage entrance motion exist; timing and hierarchy should continue to be tuned by component. |
| Responsive shell | 78% | Desktop, medium, and mobile layouts are covered, including mobile drawer and mobile TOC behavior; compact breakpoints remain the highest-risk visual area. |
| Documentation and demo | 86% | Getting Started, concept, implementation plan, Theme Lab, component samples, token reference, and plugin options are present. More real-world usage examples would help. |
| Testing and release workflow | 88% | Typecheck, contrast, build, package verification, CI, and Playwright visual/contract tests are established. Screenshot baselines have been pruned to focus on high-signal states. |

What feels stable enough for a v0.x release:

- The public installation model: `plugins: [md3Theme()]`.
- The CSS-first implementation strategy.
- The decision not to make Tailwind or `@material/web` runtime requirements.
- The Material-style system token bridge and local `--md3-comp-*` component token layer.
- The package build pipeline and GitHub Actions coverage.
- The Theme Lab as the main visual regression and design-review surface.

What should still be treated as active design work:

- Palette relationships across header, sidebar, content, and TOC in both light and dark mode.
- MD3 authenticity of high-touch controls such as search, theme selection, mobile drawer, and mobile TOC.
- Motion timing for ripple, disclosure, menu, and route transitions.
- Typography scale across top app bar, sidebars, article headings, dense reference pages, and Chinese paragraphs.
- The naming and stability promise of public-preview `--md3-comp-*` tokens.

Next quality bar:

- Keep the current package API stable while iterating visuals.
- Compare each high-impact component against official MD3 references before further broad restyling.
- Prefer small token-level corrections over one-off selectors.
- Continue using Playwright contracts for every recurring visual bug, especially mobile TOC, sidebar disclosure, search dialog, and route transition behavior.

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
- Screenshot baselines cover homepage and Theme Lab in desktop/mobile, implementation plan and plugin options in desktop, plus search dialog, mobile drawer, mobile TOC, and theme menu interaction states in light/dark.
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
