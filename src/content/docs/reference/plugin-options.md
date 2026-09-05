---
title: Plugin Options
description: Configuration reference for starlight-theme-md3.
---

## `accent`

Named fallback presets for primary color roles. If `seed` is provided, `seed`
takes precedence over `accent`.

| Value | Intent |
| --- | --- |
| `teal` | Default green-teal Material You docs palette |
| `purple` | Canonical Material 3 style accent for purple-led sites |
| `blue` | Technical and product documentation |
| `green` | Knowledge bases, operations, and sustainability themes |
| `orange` | Warm editorial or tutorial sites |
| `rose` | Expressive community or product documentation |

## `preset`

Named option bundles for common documentation moods. Explicit options override
the preset values.

| Value | Defaults | Use case |
| --- | --- | --- |
| `neutral` | `seed: '#607d8b'`, `variant: 'content'`, `shape: 'small'` | Quiet reference docs |
| `playful` | `seed: '#6750a4'`, `variant: 'expressive'`, `shape: 'large'` | Product and community docs |
| `highContrast` | `seed: '#005a54'`, `variant: 'content'`, `tonalSurface: false`, `shape: 'small'`, `contrast: 'high'` | Dense operational docs |

## `seed`

Generates light and dark Material-style color roles from a single hex color.
Accepts `#rgb` or `#rrggbb`.

```ts
md3Theme({
	seed: '#00a99d',
});
```

Seed roles are generated with `@material/material-color-utilities` during Astro
configuration. `tonalSpot` and `content` use Material core palettes directly;
`expressive` currently uses a HCT-based approximation while newer DynamicScheme
entrypoints remain unstable in the target Node and bundler matrix.

## `variant`

Controls how the seed color is interpreted.

| Value | Use case |
| --- | --- |
| `tonalSpot` | Calm default docs palette with restrained secondary and tertiary roles |
| `expressive` | More hue separation for product or community documentation |
| `content` | Roles stay closer to the seed color for branded documentation |

## `density`

Controls spacing tokens used by navigation, content rhythm, cards, and controls.

| Value | Use case |
| --- | --- |
| `compact` | Default for dense docs and wiki-style sites |
| `comfortable` | Better for tutorial-heavy docs with more breathing room |

## `shape`

Controls the Material corner token scale.

| Value | Use case |
| --- | --- |
| `small` | Conservative docs that should feel closer to stock Starlight |
| `medium` | Default Material Design 3 inspired shape scale |
| `large` | More expressive Material You presentation |

## `contrast`

Controls CSS-level state, outline, and selected-tone emphasis without relying on
unstable DynamicScheme entrypoints.

| Value | Use case |
| --- | --- |
| `standard` | Default balance for long-form documentation |
| `medium` | Stronger focus, pressed, and outline states while keeping tonal selected containers |
| `high` | Strongest state opacity and primary filled selected states for dense operational docs |

## `tonalSurface`

When `true`, navigation, cards, code, and asides use layered tonal containers.
When `false`, elevated surfaces flatten closer to the base surface color.

## `motion`

When `true`, tokenized state layers, pointer-origin ripple feedback, focus
transitions, sidebar disclosure motion, TOC tracker motion, menu/search dialog
surface transitions, homepage hero entrance motion, and content-only same-site
route transitions are enabled for high-impact interactive surfaces. When
`false`, the interactive motion runtime is skipped and theme transition duration
tokens are set to `0ms`.

The CSS also respects `prefers-reduced-motion: reduce`, so users who request
reduced motion do not need a separate Starlight configuration.

The appearance switcher itself does not require a plugin option. Desktop uses
an icon-and-label control in the top app bar, and mobile retains the labelled
control in the navigation drawer. Both triggers open the same labelled Dark,
Light, and Auto menu and retain a dynamic accessible name.

## `colorPicker`

Adds an optional Material Design 3 color tool without requiring users to add a
component library. The feature is disabled by default, so existing sites do not
ship its browser palette runtime.

```ts
md3Theme({
	colorPicker: {
		mode: 'both',
		persist: true,
	},
});
```

| Mode | `astro dev` | Production build |
| --- | --- | --- |
| `off` | Hidden | Hidden |
| `author` | Live preview and copyable plugin config | Hidden |
| `visitor` | Preview, apply, reset, and optional persistence | Same |
| `both` | Author mode | Visitor mode |

Passing `colorPicker: true` is shorthand for visitor mode. The desktop trigger
opens a modal dialog; mobile places a compact 48px color-swatch button beside
social actions in the navigation drawer and opens a bottom sheet. Visitor
previews do not persist until **Apply** is selected. **Reset** clears the browser
override and restores the deployed `seed` or `accent` palette.

`persist` defaults to `true` and stores the generated light and dark role maps
in local storage so they can be restored before first paint. The picker uses a
dependency-free saturation/value surface, hue track, and hex field. Browser
system colors may be fixed by the user agent for privacy and do not reliably
expose the operating-system accent, so the source control offers only the
deployed default and an explicit custom color.

## `experimentalComponents`

Currently disabled. The current release keeps component overrides out of the
public API and focuses on CSS-first styling.
