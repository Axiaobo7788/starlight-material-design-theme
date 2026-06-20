# Material Brief

## Project

`starlight-theme-md3` is an Astro Starlight theme inspired by Material Design 3 / Material You.

The theme must remain a Starlight-native documentation theme:

- Users install it as `plugins: [md3Theme()]`.
- The primary implementation path is CSS variables, Starlight plugin hooks, and a small number of Astro component overrides.
- The theme should not require Tailwind, Material Web Components, or a client-side component runtime as core dependencies.

## Design Goal

Create a compact documentation/wiki theme that feels aligned with Material Design 3 without becoming an Android app clone.

The visual target is:

- token-first
- calm
- dense enough for reference documentation
- readable in long sessions
- clear in state, hierarchy, and navigation
- restrained in elevation, color, and motion

## What MD3 Means Here

MD3 alignment should come from:

- color roles: `primary`, `secondary`, `tertiary`, `surface`, `surface-container-*`, `outline`, and matching `on-*` roles
- state layers: hover, focus, pressed, dragged using role-aware opacity
- tonal surfaces instead of heavy shadows
- compact but comfortable touch targets
- component anatomy that matches menus, navigation items, buttons, cards, dialogs, and text fields
- motion that is functional: ripple, state transitions, menu open/close, and short navigation feedback

## What To Avoid

Do not optimize for generic "modern web UI".

Avoid:

- glassmorphism
- large blurred gradients
- strong colored shadows
- decorative glow
- oversized marketing cards
- excessive full-pill shapes
- page-entry reveal animations
- hover lift effects
- heavy dark mode contrast that feels black-and-neon
- large mobile-app whitespace in dense docs views

## Role Split

Gemini acts as the Material Design 3 visual reviewer.

Gemini should:

- review screenshots
- judge surface hierarchy
- identify non-MD3 visual patterns
- recommend token-level changes
- produce patch specs for an engineer

Gemini should not:

- rewrite the whole theme
- invent new architecture
- add dependencies
- produce broad refactors
- ignore Starlight constraints

Codex acts as the repository implementer.

Codex should:

- read local code
- preserve plugin API and package shape
- convert Gemini patch specs into small scoped changes
- run type, contrast, build, package, and screenshot checks
- record accepted design decisions

## Review Rhythm

Handle one module per round:

1. Sidebar and navigation state
2. Header and search
3. Theme and language menus
4. Table of contents
5. Prose typography
6. Asides
7. Code blocks
8. Tables
9. Cards and link cards
10. Dark mode
11. Mobile layout

Each round should produce:

- before screenshots
- Gemini visual review
- selected patch spec
- Codex implementation
- validation results
- after screenshots
- entry in `DECISIONS.md`
