# MD3 Color Role Audit

This document records the current color-role decisions for the Starlight MD3 theme.

## Current Direction

The theme uses a docs-shell frame:

- Main article plane: `surface`
- Top app bar: `surface-container-low`
- Left navigation drawer: `surface-container-low`
- Right table of contents rail: `surface`, with tertiary active feedback
- Filled search field: `surface-container-high`
- Static cards and demo panels: `surface-container-low` or `surface-container`
- Code blocks: quiet surface roles, not accent fills

This intentionally makes the top app bar and left drawer read as one chrome frame around a cleaner article plane.

## Primary Secondary Tertiary

- `primary`: high-emphasis actions, links, focus rings, and primary CTA controls.
- `secondary`: persistent navigation state, especially selected drawer items and selected tabs.
- `tertiary`: complementary page-local reading state, especially TOC active marker and semantic supporting surfaces.

Avoid using primary, secondary, or tertiary as broad layout backgrounds. MD3 layout structure should come mostly from `surface` and `surface-container-*` roles.

## Decisions

### Header Surface

Gemini noted that a `surface` top app bar plus an `outline-variant` divider is the lighter, standard MD3 option. For this Starlight docs shell, the human review identified a stronger problem: the header and article collapsed into one flat plane.

Decision: use `surface-container-low` for the top app bar and keep article content on `surface`.

Expected result: header and sidebar become a quiet chrome frame, while the article remains the cleanest reading surface.

### Sidebar Selected State

MD3 navigation drawer selected state maps to `secondary-container` / `on-secondary-container`, but the teal tonalSpot palette makes the raw selected container visually bright.

Decision: keep the secondary semantic role but soften the component token by mixing `secondary-container` with `surface-container-low`.

Expected result: selected navigation remains visible without competing with primary CTAs.

### TOC Active State

The TOC is page-local reading context, not the primary site navigation.

Decision: use tertiary for the TOC active marker and active label.

Expected result: primary handles links and CTAs, secondary handles site navigation selection, and tertiary handles page-local reading position.

## Verification Targets

- Header background resolves to `surface-container-low`.
- Main content background remains `surface`.
- Sidebar background matches the header chrome plane.
- Selected sidebar items are not primary-container colored.
- TOC active marker resolves to the tertiary role.
- Contrast remains above WCAG AA for all checked token pairs.
