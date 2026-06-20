# Selector Map

This maps Starlight DOM surfaces to the theme files that currently style them.

## Plugin Entrypoint

- `src/index.ts`
  - Adds the MD3 CSS entrypoint.
  - Injects option CSS for seed, density, shape, contrast, tonal surfaces, and motion.
  - Registers the MD3 `ThemeSelect` override unless the user already provides one.

## CSS Layer Order

- `src/styles/md3/index.css`
  - `md3.tokens`
  - `md3.bridge`
  - `md3.base`
  - `md3.layout`
  - `md3.prose`
  - `md3.components`
  - `md3.code`
  - `md3.motion`
  - `md3.utilities`

## Core Token Files

- `src/styles/md3/tokens.css`
  - MD system color roles, type scale, shape, elevation, motion, state opacity.
- `src/styles/md3/component-tokens.css`
  - Local `--md3-comp-*` component tokens.
- `src/styles/md3/bridge.css`
  - Bridges MD3 tokens to Starlight's `--sl-*` contract.
- `src/styles/md3/density.css`
  - Compact documentation density values.

## Header

Selectors:

- `.page > .header`
- `.site-title`
- `site-search`
- `button[data-open-modal]`
- `starlight-theme-select`
- `.right-group`

Primary files:

- `src/styles/md3/layout.css`
- `src/styles/md3/component-tokens.css`
- `src/components/ThemeSelect.astro`

## Sidebar

Selectors:

- `.sidebar-pane`
- `.sidebar-content`
- `.sidebar-content .large`
- `.sidebar-content a`
- `.sidebar-content summary`
- `.sidebar-content [aria-current='page']`

Primary files:

- `src/styles/md3/layout.css`
- `src/styles/md3/component-tokens.css`
- `src/styles/md3/density.css`

## Table Of Contents

Selectors:

- `.right-sidebar-panel`
- `.right-sidebar-container`
- `starlight-toc nav`
- `starlight-toc h2`
- `starlight-toc a`
- `starlight-toc a[aria-current='true']`

Primary files:

- `src/styles/md3/layout.css`
- `src/styles/md3/component-tokens.css`

## Prose

Selectors:

- `.sl-markdown-content`
- headings
- links
- blockquote
- inline code
- lists

Primary files:

- `src/styles/md3/prose.css`
- `src/styles/md3/tokens.css`

## Starlight Components

Selectors:

- `.card`
- `.sl-link-card`
- `.sl-link-button`
- `.starlight-aside`
- `.sl-badge`
- `starlight-tabs`
- `.pagination-links`

Primary files:

- `src/styles/md3/components.css`
- `src/styles/md3/layout.css`
- `src/styles/md3/component-tokens.css`

## Code

Selectors:

- `.sl-markdown-content pre`
- Expressive Code frame selectors
- inline code

Primary files:

- `src/styles/md3/code.css`
- `src/styles/md3/prose.css`
- `src/styles/md3/component-tokens.css`

## Motion

Selectors:

- interactive controls and links
- `.md3-ripple`
- `.md3-navigation-pending`

Primary files:

- `src/styles/md3/motion.css`
- runtime script in `src/index.ts`
