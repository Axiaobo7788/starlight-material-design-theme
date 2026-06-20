# MD3 Token Contract

This file is the contract for all visual work in `starlight-theme-md3`.

## Hard Rules

1. Component colors must come from `--md-sys-color-*` or local `--md3-comp-*` tokens.
2. Do not write raw hex colors outside token generation code.
3. Do not add Tailwind to the core theme path.
4. Do not add `@material/web` as a runtime dependency.
5. Do not use gradients, glass effects, glow, or colored shadows as a substitute for MD3 surfaces.
6. Do not use heavy box shadows for ordinary docs hierarchy. Prefer tonal surfaces.
7. Do not make every component a full pill. Use shape tokens according to component anatomy.
8. Do not make hover/focus/pressed states globally primary-colored.
9. Do not use pure black for dark mode surfaces.
10. Do not reduce docs information density to landing-page spacing.

## Color Role Rules

### Page and Chrome

- Main page background: `--md-sys-color-background` or `--md-sys-color-surface`.
- Header/sidebar chrome: `--md-sys-color-surface-container-low`.
- Elevated or floating menu/dialog surfaces: `--md-sys-color-surface-container` or `--md-sys-color-surface-container-high`.
- Dividers and quiet borders: `--md-sys-color-outline-variant`.
- Stronger focus outlines: `--md-sys-color-primary` only when an actual focus ring is needed.

### Navigation

- Navigation label: `--md-sys-color-on-surface-variant`.
- Navigation hover/focus/pressed: state layers based on `on-surface`, not a global primary wash.
- Active navigation container: prefer `--md-sys-color-secondary-container` so persistent location state stays quieter than high-emphasis actions.
- Active navigation label: prefer `--md-sys-color-on-secondary-container`.
- Primary should be reserved for high-emphasis actions, links, focus rings, and lightweight active indicators.

### Buttons

- Filled action: `primary` / `on-primary`.
- Filled tonal action: `secondary-container` / `on-secondary-container`.
- Outlined action: transparent container, `outline`, and primary label.
- Text action: transparent container and primary label.
- Hover/focus/pressed must use a state layer over the current button container.

### Menus

- Menu container: `surface-container`.
- Menu labels: `on-surface`.
- Menu hover/focus/pressed: state layer using `on-surface`.
- Selected menu item: transparent row with primary label/checkmark.
- Menu shape should be extra-small or small, not full pill.

### Cards

- Cards use tonal surfaces and outline.
- Default card elevation should be level 0 unless the component is interactive.
- Hover may use a slightly higher surface, not large lift or glow.

### Code and Tables

- Code blocks and tables should prioritize readability.
- Use `surface-container-low` or `surface-container`.
- Borders should be `outline-variant`.
- Avoid strong accent-colored code backgrounds.

## State Layer Rules

State layer opacity should follow MD3 style:

- hover: `--md-sys-state-hover-opacity`
- focus: `--md-sys-state-focus-opacity`
- pressed: `--md-sys-state-pressed-opacity`
- dragged: `--md-sys-state-dragged-opacity`

State layer color should usually be the component content color:

- surface components: `on-surface`
- navigation selected container: `on-primary-container`
- filled primary button: `on-primary`
- tonal button: `on-secondary-container`

Do not use one global primary state layer for all components.

## Shape Rules

- Full: action buttons, chips, selected navigation pills when appropriate.
- Large: cards, dialogs, larger containers.
- Medium: cards, embedded component panels, code blocks.
- Small / extra-small: menus, text-field-like controls, inline code.

## Motion Rules

Allowed:

- pointer-origin ripple
- state color transitions
- menu open/close motion
- short navigation pending feedback
- reduced-motion compliance

Avoid:

- page-entry reveal
- hover transform/lift
- decorative shimmer
- scroll-driven spectacle
- bouncy spring effects that are not present in MD3 component behavior
