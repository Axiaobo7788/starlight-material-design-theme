# starlight-theme-md3

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

A Material Design 3 / Material You inspired theme prototype for Astro Starlight.
The MVP keeps Starlight's defaults intact and layers Material color, shape,
surface, state, and typography tokens through CSS variables and a Starlight
plugin.

## Install

```sh
npm install starlight-theme-md3
```

## Usage

```ts
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import md3Theme from 'starlight-theme-md3';

export default defineConfig({
	integrations: [
		starlight({
			title: 'My Docs',
			plugins: [
				md3Theme({
					seed: '#00a99d',
					variant: 'tonalSpot',
					density: 'compact',
					shape: 'medium',
				}),
			],
		}),
	],
});
```

## Options

| Option | Values | Default | Status |
| --- | --- | --- | --- |
| `preset` | `neutral`, `playful`, `highContrast` | none | Named option bundles |
| `seed` | `#rgb` or `#rrggbb` | none | Generates light/dark color roles |
| `variant` | `tonalSpot`, `expressive`, `content` | `tonalSpot` | Seed palette style |
| `accent` | `teal`, `purple`, `blue`, `green`, `orange`, `rose` | `teal` | Named fallback presets |
| `density` | `compact`, `comfortable` | `compact` | MVP token override |
| `shape` | `small`, `medium`, `large` | `medium` | MVP token override |
| `tonalSurface` | `boolean` | `true` | MVP token override |
| `motion` | `boolean` | `true` | MVP token override |
| `experimentalComponents` | `boolean` | `false` | Reserved |

`preset` fills in default options only. Explicit options such as `seed`, `shape`,
or `tonalSurface` override the preset.

## Design Direction

- **Token-first**: map Material You system colors to Starlight's CSS custom properties.
- **Docs-native**: preserve Starlight's accessible navigation, search, table of contents, and content collections.
- **Expressive but quiet**: use tonal surfaces, rounded components, and soft elevation without making docs feel like a marketing page.
- **No Material Web runtime**: reference Material Web token and component guidance without depending on `@material/web`.
- **CSS before overrides**: add Astro component overrides only when CSS cannot express the design safely.

## CSS Layer Model

The package declares Starlight's built-in layers before its own MD3 layers, then
ships theme rules in `md3.tokens`, `md3.bridge`, `md3.layout`, `md3.prose`,
`md3.components`, `md3.code`, and `md3.utilities`. This keeps Starlight's DOM and
behavior intact while allowing the theme to reliably style high-impact surfaces.

## Project Structure

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   ├── index.ts
│   ├── styles/
│   │   └── md3/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`                 | Starts demo dev server at `localhost:4321`       |
| `pnpm build:theme`         | Builds package files to `./dist/`                |
| `pnpm build:demo`          | Builds the demo site to `./demo-dist/`           |
| `pnpm build`               | Builds both the package and demo site            |
| `pnpm check:contrast`      | Audits core MD3 foreground/background pairs      |
| `pnpm typecheck`           | Runs `astro check`                               |
| `pnpm pack --dry-run`      | Verifies package contents                        |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## Current Status

- Starlight is installed with Astro and configured in `astro.config.mjs`.
- `src/index.ts` exposes the local Starlight plugin.
- `src/styles/md3/` contains the split CSS MVP.
- `src/palette.ts` contains the deterministic seed color helper used by the plugin.
- `dist/` contains the package output after `pnpm build:theme`.
- `demo-dist/` contains the demo output after `pnpm build:demo`.
- Concept, implementation, component sample, and token reference docs live in `src/content/docs/`.
- The demo includes homepage and component-page snapshots for MD3 color roles, state layers, navigation density, and core Starlight MDX components.

## Current Limits

- Seed color generation is deterministic and local to the plugin. It does not yet use the official Material color utilities package.
- Component overrides are intentionally deferred until CSS-only styling reaches a real limitation.
- The package is v0.x; option names and visual tokens may change while the theme stabilizes.
