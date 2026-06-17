---
title: Getting Started
description: Install and configure the Material Design 3 Starlight theme.
---

`starlight-theme-md3` is a Starlight plugin. It appends a Material Design 3
inspired CSS layer to your docs site without replacing Starlight's content,
navigation, search, or MDX component model.

## Install

```sh
npm install starlight-theme-md3
```

## Configure Starlight

```ts
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import md3Theme from 'starlight-theme-md3';

export default defineConfig({
	integrations: [
		starlight({
			title: 'My Docs',
			plugins: [md3Theme()],
		}),
	],
});
```

## Customize The Preset

```ts
md3Theme({
	seed: '#6750a4',
	variant: 'expressive',
	density: 'compact',
	shape: 'medium',
	tonalSurface: true,
	motion: true,
});
```

Use `seed` when you want the theme to generate a light and dark color scheme
from one color. If `seed` is omitted, the `accent` option provides named
fallback presets for primary color roles.

## What The Plugin Changes

- Adds Material-style system tokens with `--md-sys-*` names.
- Bridges common Starlight `--sl-*` variables to those tokens.
- Styles high-impact docs surfaces: header, sidebar, table of contents, prose, code, asides, cards, tabs, badges, and pagination.
- Leaves Starlight's runtime and content model intact.
