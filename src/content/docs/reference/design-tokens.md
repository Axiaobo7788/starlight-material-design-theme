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

## CSS Modules

| File | Responsibility |
| --- | --- |
| `index.css` | Declares cascade layer order so Starlight layers load before MD3 theme layers |
| `tokens.css` | MD3-style system color, type, shape, elevation, motion, and state tokens |
| `src/palette.ts` | Material Color Utilities based seed color generation for light and dark roles |
| `bridge.css` | Mapping from `--md-sys-*` to Starlight `--sl-*` variables |
| `layout.css` | Header, sidebar, search, table of contents, and pagination styling |
| `prose.css` | Markdown typography, lists, links, blockquotes, and tables |
| `components.css` | Starlight cards, asides, badges, tabs, steps, buttons, and splash preview |
| `code.css` | Inline code and code block surfaces |

## Cascade Model

The theme declares Starlight's public layers first, then the MD3 layers:

```css
@layer starlight.base, starlight.reset, starlight.core, starlight.content,
	starlight.components, starlight.utils, md3.tokens, md3.bridge, md3.base,
	md3.layout, md3.prose, md3.components, md3.code, md3.utilities;
```

This keeps the package CSS override-friendly while preserving Starlight's
component structure and accessibility behavior.

## Current Seed

The demo uses `seed: '#00a99d'` with the `tonalSpot` variant. When a seed is
configured, the plugin generates primary, secondary, tertiary, error, surface,
outline, inverse, and scrim roles for both dark and light themes through
`@material/material-color-utilities`.

`tonalSpot` and `content` use Material Color Utilities core palettes.
`expressive` currently keeps a HCT-based approximation because the package's
newer DynamicScheme modules still rely on imports that are not stable across the
target Node and bundler matrix.

## Next Token Work

- Add explicit contrast-level options beyond the current `highContrast` preset.
- Expand component-level tokens for nav items, search, cards, tabs, badges, asides, and code blocks.
- Document which tokens are public API and which are implementation details.

## Plugin Options

The plugin currently generates a small virtual CSS module after the base theme
CSS. This keeps package CSS static while allowing preset-level customization.

| Option | Token impact |
| --- | --- |
| `preset` | Provides audited seed, variant, shape, and tonal surface defaults |
| `seed` | Generates full dark and light color roles from one hex color |
| `variant` | Adjusts secondary, tertiary, and neutral relationships for generated seed roles |
| `accent` | Overrides primary color roles for named fallback presets |
| `density` | Overrides navigation height, content rhythm, card padding, and control height |
| `shape` | Overrides the MD3 corner scale |
| `tonalSurface` | Can flatten elevated surface containers |
| `motion` | Can reduce theme transition durations to `0ms` |
