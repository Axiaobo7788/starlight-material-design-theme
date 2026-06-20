---
title: Design Tokens
description: Token mapping notes for the Material You Starlight theme prototype.
---

The prototype defines Material-style `--md-sys-*` tokens first, then maps the
Starlight `--sl-*` variables to those roles. This follows Material Web's CSS
custom property approach without requiring Material Web components at runtime.

| Token group | Purpose | Starlight mapping |
| --- | --- | --- |
| `--md-sys-color-primary` | Main brand and selected state | `--sl-color-accent`, `--sl-color-text-accent` |
| `--md-sys-color-surface*` | Page, navigation, sidebar, cards | `--sl-color-bg`, `--sl-color-bg-nav`, `--sl-color-bg-sidebar` |
| `--md-sys-color-outline*` | Dividers and component borders | `--sl-color-hairline*`, card/search borders |
| `--md-sys-shape-corner-*` | Radius scale for controls and containers | Buttons, links, cards, code, callouts |
| `--md-sys-elevation-level*` | Soft depth for raised surfaces | Header, cards, search dialog |
| `--md-sys-state-*` | Hover, focus, and pressed state layers | Sidebar, tabs, buttons, search |
| `--md-sys-typescale-*` | Documentation typography scale | `--sl-text-*`, heading sizes |
| `--md3-comp-*` | Theme-local component decisions | Sidebar, TOC, search, cards, buttons, tabs, code |

## CSS Modules

| File | Responsibility |
| --- | --- |
| `index.css` | Declares cascade layer order so Starlight layers load before MD3 theme layers |
| `tokens.css` | MD3-style system color, type, shape, elevation, motion, and state tokens |
| `component-tokens.css` | Local `--md3-comp-*` component tokens for navigation, TOC, search, cards, asides, badges, tabs, code, and pagination |
| `src/palette.ts` | Material Color Utilities based seed color generation for light and dark roles |
| `bridge.css` | Mapping from `--md-sys-*` to Starlight `--sl-*` variables |
| `layout.css` | Header, sidebar, search, table of contents, and pagination styling |
| `prose.css` | Markdown typography, lists, links, blockquotes, and tables |
| `components.css` | Starlight cards, asides, badges, tabs, steps, buttons, and splash preview |
| `code.css` | Inline code and code block surfaces |
| `motion.css` | Restrained MD3-style state transitions for color, outline, focus, and elevation feedback |

## Cascade Model

The theme declares Starlight's public layers first, then the MD3 layers:

```css
@layer starlight.base, starlight.reset, starlight.core, starlight.content,
	starlight.components, starlight.utils, md3.tokens, md3.bridge, md3.base,
	md3.layout, md3.prose, md3.components, md3.code, md3.motion,
	md3.utilities;
```

This keeps the package CSS override-friendly while preserving Starlight's
component structure and accessibility behavior.

## Current Seed

The demo and fallback tokens use `seed: '#00a99d'` with the `tonalSpot` variant.
This gives the first visual pass a clearer Material You role relationship: a
distinct primary, quieter secondary, blue-leaning tertiary, and more neutral
surface containers. Purple remains available as a named accent and expressive
preset, but it is no longer the default visual baseline. When a seed is
configured, the plugin generates primary, secondary, tertiary, error, surface,
outline, inverse, and scrim roles for both dark and light themes through
`@material/material-color-utilities`.

`tonalSpot` and `content` use Material Color Utilities core palettes.
`expressive` currently keeps a HCT-based approximation because the package's
newer DynamicScheme modules still rely on imports that are not stable across the
target Node and bundler matrix.

## Public Token Boundary

The public token surface is intentionally smaller than the internal selector
surface. System tokens are the safest override layer. Component tokens are
available for focused customization, but may still change while the package is
v0.x.

| Stability | Tokens | Intended use |
| --- | --- | --- |
| Public | `--md-sys-color-*`, `--md-sys-shape-corner-*`, `--md-sys-typescale-*`, `--md-sys-elevation-level*`, `--md-sys-state-*` | Site-wide theme customization |
| Public preview | `--md3-density-*`, `--md3-comp-nav-item-*`, `--md3-comp-toc-link-*`, `--md3-comp-search-field-*`, `--md3-comp-card-*`, `--md3-comp-tabs-*`, `--md3-comp-code-*` | Targeted Starlight surface customization |
| Internal | Selector-specific helper classes such as `.md3-showcase`, `.md3-mini-nav`, `.material-hero-preview` | Demo and visual-regression fixtures only |

## Typography Scale

The theme now exposes the complete Material-style type role matrix: display,
headline, title, label, and body, each with large, medium, and small sizes. The
tokens include `size`, `line-height`, `weight`, and `tracking`; tracking is kept
at `0` for this documentation theme to avoid cramped text in mixed English and
Chinese content.

## Reading Rhythm

The theme keeps the default density compact, but prose rhythm now has explicit
tokens for line height, paragraph gaps, heading gaps, list gaps, block gaps, and
table cell padding. This lets documentation stay information-dense while keeping
the MD3 quality of calm, readable spacing.

## Motion

Motion is tokenized and intentionally quiet. The theme uses Material-style state
layers, pointer-origin ripples, sidebar disclosure motion, TOC tracker motion,
anchored menu transitions, search container-transform motion, homepage entrance
motion for the hero and homepage surfaces, short pressed feedback, and
content-only internal route transitions. The route transition runs only after
same-origin theme navigation, leaving the header, search, and primary chrome
stable. Interior documentation pages avoid initial page-entry animation, hover
translation, decorative scale effects, and blanket `transition: all` rules.

| Token | Purpose |
| --- | --- |
| `--md-sys-motion-duration-short*` | Fast state and control transitions |
| `--md-sys-motion-duration-medium*` | Reserved Material duration scale for future component work |
| `--md-sys-motion-easing-standard*` | State and surface feedback |
| `--md-sys-motion-easing-emphasized*` | Reserved Material easing scale for future component work |
| `--md3-motion-duration-*` | Theme-local aliases for state, nav, and control feedback |
| `--md3-motion-duration-ripple-grow` | Pointer-origin ripple expansion duration |
| `--md3-motion-duration-ripple-fade` | Ripple release fade-out duration |
| `--md3-motion-ripple-minimum-press` | Minimum pressed-state hold before release |
| `--md3-motion-duration-route-leave` | Content fade/settle duration before internal navigation |
| `--md3-motion-duration-route-enter` | Content fade/settle duration after internal navigation |
| `--md3-motion-route-delay` | Tiny internal-link delay used to reveal pressed navigation feedback |
| `--md3-ripple-pressed-opacity` | Opacity for the pointer-origin ripple state layer |

When `prefers-reduced-motion: reduce` is active, the theme reduces motion token
durations and route delay to `0ms`. The plugin's `motion: false` option applies
the same token override and skips the interactive motion runtime without
requiring users to write CSS.

## Elevation Policy

Tonal surface is the default depth tool. Shadows are reserved for interactive or
modal surfaces.

| Surface | Default role | Shadow |
| --- | --- | --- |
| Page and prose | `surface` / `background` | `level0` |
| Sidebar, cards, code, tables | `surface-container-low` to `surface-container-high` | `level0` at rest |
| Hovered cards and preview chips | Elevated container tone | `level1` |
| Floating previews | Raised container tone | `level2` |
| Dialogs and hero preview | Highest local surface | `level3` |

## Next Token Work

- Keep the public-preview `--md3-comp-*` list stable through the next visual pass.
- Add examples for overriding component tokens in a consuming Starlight project.
- Revisit DynamicScheme entrypoints after the Material Color Utilities package publishes Node ESM-compatible imports.

## Plugin Options

The plugin keeps the package CSS static and writes preset-level customizations
into an unlayered inline `<style data-starlight-theme-md3="options">` entry in
Starlight's document head. Those values override the layered package defaults
without requiring users to import generated CSS.

| Option | Token impact |
| --- | --- |
| `preset` | Provides audited seed, variant, shape, and tonal surface defaults |
| `seed` | Generates full dark and light color roles from one hex color |
| `variant` | Adjusts secondary, tertiary, and neutral relationships for generated seed roles |
| `accent` | Overrides primary color roles for named fallback presets |
| `density` | Overrides navigation height, content rhythm, card padding, and control height |
| `shape` | Overrides the MD3 corner scale |
| `contrast` | Adjusts state opacity, outlines, and selected state emphasis |
| `tonalSurface` | Can flatten elevated surface containers |
| `motion` | Can reduce theme transition durations to `0ms` |
