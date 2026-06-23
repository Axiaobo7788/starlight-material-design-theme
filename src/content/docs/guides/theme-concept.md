---
title: Theme Direction
description: The first design direction for a Material You inspired Starlight theme.
---

This theme starts as a thin visual layer over Starlight. The goal is not to clone
Android settings screens, but to bring the Material You qualities that make sense
for long-form documentation: adaptive color, generous hit targets, calm surfaces,
clear state, and a little warmth in the chrome.

## Principles

- **Respect Starlight first.** Navigation, search, content collections, and MDX components remain Starlight-native.
- **Make color systematic.** A small Material Design 3 style token set feeds Starlight's existing `--sl-*` variables.
- **Use Material as a design reference.** Material Design 3 and Material Web guide token names, color roles, shape, state layers, and component tone; `@material/web` is not a core runtime dependency.
- **Prefer CSS before overrides.** Component overrides should be reserved for behavior or markup that CSS cannot reach.
- **Keep docs scannable.** Density stays practical; the theme should feel softer without reducing information clarity.

## Visual Direction

The demo uses a teal seed color and a `tonalSpot` variant to generate the main
light and dark color roles. Light mode uses warm surfaces instead of pure white.
Dark mode uses deep neutral surfaces with lifted containers for sidebars, code,
and cards.

Shape is more expressive than stock Starlight: larger corners on navigation
items, search, callouts, and cards, while content typography remains restrained.

## Current Theme Surface

The package lives in `src/styles/md3/` and currently covers:

- Material-style color roles mapped to Starlight theme variables.
- Seed color generation for deterministic light and dark token roles.
- Rounded nav, search, buttons, cards, code blocks, and asides.
- A Starlight plugin entry at `src/index.ts`.
- A splash-page preview that demonstrates the palette without adding a heavy UI runtime.

## Reusable Package Surface

The reusable surface is intentionally small:

- A CSS entrypoint for the default theme.
- Plugin options for seed colors, palette variant, density, and radius scale.
- Public-preview component tokens for targeted customization.
- Optional component overrides only when CSS cannot express a required markup or behavior change.
