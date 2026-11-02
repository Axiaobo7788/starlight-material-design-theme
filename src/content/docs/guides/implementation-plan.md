---
title: Implementation Overview
description: How starlight-theme-md3 is built and what the current release includes.
---

`starlight-theme-md3` is designed as a thin theme layer over Starlight. It does
not replace Starlight's content model, router, search, table of contents, or MDX
components. The package adds a Material Design 3 inspired token system, CSS
cascade layers, and small interaction enhancements where CSS alone cannot express
the behavior.

## Architecture

The public integration surface is a Starlight plugin:

```ts
plugins: [md3Theme()]
```

The plugin appends the bundled CSS entrypoint and writes option-driven custom
properties into the page head. The CSS stays static and reusable, while options
such as `seed`, `variant`, `density`, `shape`, `contrast`,
`tonalSurface`, `motion`, and `colorPicker` configure the generated and
runtime theme behavior.

## CSS Layer Stack

The theme declares Starlight's built-in layers first, then appends its own MD3
layers:

| Layer | Purpose |
| --- | --- |
| `md3.tokens` | Material-style system tokens, component tokens, density, shape, state, and motion values |
| `md3.bridge` | Mappings from `--md-sys-*` roles to Starlight's existing `--sl-*` variables |
| `md3.base` | Global page defaults that need to sit above Starlight base styles |
| `md3.layout` | Header, sidebar, table of contents, pagination, and responsive shell styling |
| `md3.prose` | Markdown typography, headings, lists, links, blockquotes, tables, and Chinese reading rhythm |
| `md3.components` | Starlight cards, asides, badges, tabs, steps, search, theme select, and demo surfaces |
| `md3.code` | Inline code and code block containers |
| `md3.motion` | Tokenized state transitions, ripple feedback, route feedback, and reduced-motion handling |
| `md3.utilities` | Documentation demo helpers |

## Included Surface

The current release styles the high-impact Starlight surfaces that shape the
daily reading experience:

- Top app bar, search button, and theme selection.
- Sidebar navigation, selected states, and disclosure motion.
- Desktop table of contents, mobile table of contents, and scrollspy feedback.
- Markdown prose, links, headings, lists, blockquotes, tables, and Chinese paragraphs.
- Cards, link cards, asides, badges, tabs, steps, code blocks, and inline code.
- Homepage splash preview and dense Theme Lab examples.
- Optional runtime Material color picker for author preview and visitor palette
  changes.

## Runtime Color Picker

The runtime color picker is opt-in and does not replace the build-time seed
configuration.

It can be configured for author-only, visitor-only, both, or disabled usage. The
visitor flow previews a generated palette before applying it, can optionally
persist the selected palette, and resets to the palette deployed by the site
author.

The picker uses the same Material Color Utilities based palette generation as
the build-time integration, while keeping its browser UI dependency-free.

Browsers do not expose a reliable representation of the user's real operating
system accent color, so the current picker intentionally supports the deployed
default and explicit custom colors rather than claiming to read the OS accent.

## Material Design 3 Alignment

The implementation follows Material Design 3 ideas without making Material Web a
runtime dependency:

- Color is role-based through `--md-sys-color-*` tokens.
- Surface hierarchy uses tonal containers before heavy borders or shadows.
- Shape is tokenized and applied consistently to navigation, cards, buttons,
  code, asides, search, and menu surfaces.
- State layers are shared across hover, focus, pressed, and selected states.
- Motion is restrained, respects `prefers-reduced-motion`, and focuses on
  interaction feedback rather than decorative page animation.

## Package Surface

The package is in the v0.x public-preview line. The core plugin, CSS bundle,
package exports, seed color generation, runtime color picker, demo documentation,
package-consumption fixture, and visual regression coverage are in place.

| Area | Status |
| --- | --- |
| Plugin API | Stable enough for preview use as `md3Theme()` |
| CSS exports | Bundled to `dist/css/index.css` with subpath exports |
| Color generation | Uses `@material/material-color-utilities` for seed roles |
| Runtime color picker | Optional author/visitor control, introduced in 0.2.2 |
| Component tokens | Available as public-preview `--md3-comp-*` custom properties |
| Motion runtime | Optional through the `motion` plugin option |
| Visual regression | Covered by Playwright screenshot tests |

## Current Boundaries

- `@material/web` is a design reference only and is not a runtime dependency.
- Tailwind is not part of the theme runtime or peer dependency surface.
- Runtime color picking is optional; the default deployed theme still works
  entirely from the author-provided configuration.
- Large-scale Starlight component rewrites are intentionally avoided.
- `--md3-comp-*` tokens are public-preview tokens and may still change before a
  stable release.
- `expressive` palette generation keeps a HCT-based approximation while newer
  Material DynamicScheme imports remain unstable in the target Node ESM matrix.
- Peer lower-bound compatibility should be validated before the current Astro and
  Starlight minimum ranges are treated as long-term stable guarantees.

For repository-maintenance notes, see `docs/进度.md`, `docs/记忆.md`, and the
repository-level `docs/design/` decision files.
