# Component Status

This file tracks current MD3 alignment status by module.

## Legend

- `audit-needed`: needs Gemini review before more changes.
- `in-progress`: implementation exists but visual direction is not confirmed.
- `accepted`: visually reviewed and accepted.
- `blocked`: cannot proceed without a design decision.

## Header

Status: `accepted`

Current notes:

- Header uses tonal surface and compact controls.
- Header background is opaque `surface-container-low`; glass/backdrop blur is intentionally removed.
- Search loading color flash was fixed.
- Search field keeps full-pill shape because MD3 Search Bar anatomy is fully rounded.
- Desktop homepage and docs search fields share the same top app bar anchor.
- Search dialog uses an MD3 scrim without backdrop blur and a CSS-only search container transform approximation.
- Theme menu now uses a custom Astro override instead of native `select`.
- Gemini review accepted the current header/search shape, surface, and spacing direction.
- Desktop search uses `--sl-sidebar-width` for its title area anchor, keeping splash and docs templates aligned.

## Sidebar

Status: `accepted`

Current notes:

- Sidebar uses a selected pill treatment with `secondary-container` so active navigation reads as persistent location instead of a high-emphasis CTA.
- The previous primary/cyan-heavy state and leading selected indicator were removed.
- Sidebar section headings now use `on-surface-variant` at weight `500`.
- Nested tree guide lines were removed; hierarchy relies on indentation.
- Image-backed Gemini review accepted the selected pill as quiet and clear.

## Table Of Contents

Status: `accepted`

Current notes:

- TOC has compact link rows and active indicator.
- Active state uses primary color, medium weight, and one runtime-enhanced 4px floating tracker.
- The old per-link internal indicator remains only as a no-motion fallback.
- Gemini rejected a square/block tracker because it would feel too much like primary navigation.

## Theme Menu

Status: `accepted`

Current notes:

- Implemented in `src/components/ThemeSelect.astro`.
- Packaged into `dist/components/ThemeSelect.astro`.
- Desktop menu no longer uses browser-native selected blue.
- Menu styling is encapsulated in the component override instead of being duplicated in `layout.css`.
- The trigger rests as a transparent, borderless MD3 top app bar action instead of a filled or outlined combobox.
- The menu surface uses `shape-xs`, `surface-container`, level 2 elevation, 8px vertical padding, and flush list items with no item radius.
- Selected item uses a transparent row with primary-colored text and trailing checkmark.
- Menu opens with `medium2` emphasized-decelerate scale/opacity motion and closes with `short4` emphasized-accelerate motion before `hidden` is restored.
- Gemini accepted the revised icon-only trigger and flush MD3 menu after final screenshot review with `DO-NOT-CHANGE`.

## Prose

Status: `accepted`

Current notes:

- Type scale is closer to MD3 tokens than the initial MVP.
- Markdown headings use calmer `600` weight.
- Top-level page title moved from heavy `760` to standard display `400` after Gemini review.
- Image-backed Gemini review accepted Chinese paragraph rhythm, heading weight, and document density.
- TOC pages now keep a fixed `4rem` markdown bottom reserve instead of a large viewport-based scrollspy reserve.

## Cards

Status: `accepted`

Current notes:

- Cards use tonal surfaces and outlines.
- Gemini removed hover/focus treatment from static `.card` surfaces.
- Interactive `.sl-link-card` keeps tonal hover, level 1 elevation, focus outline, and pressed container feedback.
- Image-backed Gemini review accepted current card density and surface hierarchy.
- Static Starlight cards now use explicit column rhythm, `0.75rem` internal gap, zero title/body margins, and Title Medium `500` weight.

## Asides

Status: `accepted`

Current notes:

- Semantic asides use MD3 container fills without a navigation-style left stripe.
- Note uses `secondary-container`; tip uses `primary-container`; caution uses `tertiary-container`; danger uses `error-container`.
- Image-backed Gemini review accepted full-container tonal emphasis for long-form docs.

## Code Blocks

Status: `accepted`

Current notes:

- Code blocks use tonal surfaces.
- Code body uses `surface`; Expressive Code headers use `surface-container-low`.
- Image-backed Gemini review accepted current code frame surface hierarchy.

## Tables

Status: `accepted`

Current notes:

- Tables are included in Theme Lab and plugin option docs.
- Tables use a quiet `outline-variant` outer border, `lg` shape, lighter headers, direct token row dividers, and no final-row double border.
- Image-backed Gemini review accepted current table density and tonal treatment.

## Motion

Status: `accepted`
Validation:

- Playwright verifies default motion tokens are enabled.
- Playwright verifies reduced motion sets state duration to `0ms`.
- Playwright verifies no decorative page-entry animation or hover transform is present.
- Playwright verifies pointer-origin ripple exists and is skipped under reduced motion.
- Playwright verifies internal navigation uses a short pending state before route change.
- Playwright verifies homepage CTA navigation uses the same content-only route transition.
- Playwright verifies search dialog scrim/surface motion and TOC tracker contracts.
- Playwright verifies homepage/docs search alignment, ThemeSelect selected checkmark, and homepage hero entrance motion.
- Playwright verifies ThemeSelect trigger, menu surface metrics, flush selected row, open duration, close duration, and stricter menu screenshot thresholds.

Current notes:

- Page-entry and hover-transform effects are intentionally avoided.
- Ripple, sidebar disclosure, theme menu, search dialog, homepage hero entrance, TOC tracker, and short navigation pending feedback exist.
- Gemini accepted the functional-only motion direction: ripple, state layers, menu/search open feedback, TOC continuity, short navigation feedback, and restrained homepage entrance motion.
- Homepage entrance now extends to first content sections, cards, and showcase panels with smaller surface motion and staggered hierarchy.

## Dark Mode

Status: `accepted`

Current notes:

- Dark mode avoids pure black.
- Base dark mode now uses exact Material Color Utilities roles generated from the teal tonalSpot default seed `#00a99d`.
- Gemini reviewed dark semantic surfaces and returned `NO_PATCH`.
- Current full-container aside treatment remains intentional, including error container in dark mode.
- Image-backed Gemini review accepted current dark mode surface hierarchy.

## Mobile Layout

Status: `accepted`

Current notes:

- Mobile screenshots are covered by Playwright.
- Gemini reviewed mobile layout density and returned `NO_PATCH`.
- Mobile navigation defaults use 40px rows and header controls use 44px height; desktop restores compact density at `50rem`.
- Image-backed Gemini review accepted current mobile density and readable spacing.

## Homepage

Status: `accepted after human review`

Current notes:

- Homepage uses Starlight `template: splash`.
- A compact Material preview remains in the hero image slot.
- `CardGrid` no longer uses staggered layout.
- The earlier Gemini-accepted docs-chrome homepage direction was superseded by human visual review because the homepage looked like a normal documentation article.
- Homepage cards and theme snapshot panels now participate in restrained homepage-only entrance motion.
- Demo seed now uses teal tonalSpot roles so the first screen shows clearer Material You color pairing instead of a single lavender-gray cast.
- Top app bar, sidebar selected items, and TOC heading now use medium-weight MD3 title/label roles so document chrome stays quieter than page headings and CTAs.

## Ripple

Status: `implemented`

Current notes:

- Pointer-origin ripples use a two-stage press/release model.
- Grow duration is `450ms`, minimum pressed hold is `225ms`, and release fade is `150ms`.
- Pressed opacity comes from the MD3 pressed state-layer opacity token.

## Latest Validation

Status: `accepted after human review and regression checks`

2026-06-18 checks:

- Gemini 3.1 Pro accepted P0 fixes and low-risk P1 fixes after image-backed review.
- Human review superseded the docs-chrome homepage direction; homepage screenshot baselines now reflect the restored splash template.
- Ripple behavior now uses the two-stage press/release model and is covered by Playwright motion assertions.
- TOC active state now uses a single floating tracker with a static fallback.
- Theme menu selected state is on-surface text plus state layer and trailing checkmark, with component-local anchored menu animation.
- Search dialog now uses a CSS-only container transform approximation and a plain MD3 scrim without blur.
- Desktop search is aligned across homepage and docs pages.
- Homepage hero entrance motion runs on each homepage visit and remains reduced-motion safe.
- Homepage surface entrance motion now covers sections, cards, and snapshot panels with smaller staggered motion.
- Base fallback color roles and the demo seed now use teal tonalSpot roles for clearer Material You pairing; canonical purple remains available as an explicit accent and preset seed.
- Dark fallback surfaces separate `surface` from `surface-container-low` so filled cards and chrome have a visible tonal step without adding divider lines.
- Document pages now use a tighter top/bottom reserve and search alignment is driven by `--sl-sidebar-width`.
- Gemini 3.1 Pro post-implementation review accepted the aligned search anchor, ThemeSelect anchored MD3 menu, search container transform approximation, and repeated homepage hero entrance motion.
- Gemini 3.1 Pro post-implementation review returned `ACCEPTED` with no patch needed for TOC tracker, search dialog motion/scrim, ThemeSelect menu styling, or the new Playwright contracts.
- A later human review superseded the canonical purple baseline because the role relationship read too monochrome; tighter document spacing, homepage card rhythm, sidebar-width search anchor, and homepage surface entrance motion remain accepted.
- Gemini 3.1 Pro post-implementation review accepted the transparent, borderless ThemeSelect trigger as MD3-aligned and no longer Fluent-like.
- Remaining non-blocking visual risks: dense pages can still show multiple active states at once, and long inline-code headings may hard-wrap on narrow mobile screens.
- Next MD3 visual opportunities: audit search button surface, reduce structural divider reliance in favor of tonal surfaces, refine TOC active-marker language, revisit persistent menu selected-state tokens, and consider filled card variants for demo panels.
- `pnpm run typecheck` passed.
- `pnpm run check:contrast` passed.
- `pnpm run build` passed.
- `pnpm pack --dry-run` passed.
- `pnpm run verify:package` passed.
- `pnpm run test:screenshots` passed with 43 tests.

2026-06-19 checks:

- ThemeSelect was refined from a text-like dropdown toward a stricter MD3 top app bar icon action plus menu surface.
- Gemini 3.1 Pro recommended keeping the trigger icon-only and changing the menu to a flush MD3 list surface with `secondary-container` selected row.
- The implementation now uses `max-content` menu width within 112px/280px bounds so icons, labels, and trailing checkmarks do not feel cramped.
- Close motion now keeps the menu visible in `data-md3-menu-state="closing"` long enough for the CSS transition to complete before applying `hidden`.
- Theme menu and mobile drawer screenshot baselines were refreshed; ThemeSelect/mobile drawer interaction screenshots now use a stricter `0.001` diff ratio.
- Gemini 3.1 Pro final review returned `DO-NOT-CHANGE` with no blockers or followups.
- `pnpm run typecheck` passed.
- `pnpm run test:screenshots` passed with 43 tests.
- `pnpm run check:contrast` passed.
- `pnpm run build` passed.
- `pnpm pack --dry-run` passed.
- `pnpm run verify:package` passed after sandbox escalation for the temporary `pnpm install`.

2026-06-19 follow-up pass:

- Gemini could not be reached in the restricted sandbox at first because `agy` needed to write outside the workspace and open a local socket.
- After rerunning `agy` outside the sandbox, Gemini 3.1 Pro reviewed the current screenshots/code and returned a required patch spec.
- Official Material Web references were used for the next pass: menus are anchored temporary surfaces, menu tokens include `surface-container`, `shape extra-small`, and selected `secondary-container`; standard icon buttons are low-emphasis, backgroundless compact actions.
- Gemini rejected the `clip-path` menu mask as too rigid; ThemeSelect now uses top-right anchored scale plus opacity with MD3 emphasized easing.
- Gemini recommended a quieter transient menu selected state; selected theme rows now keep a transparent background and rely on primary-colored label/checkmark.
- Search field now explicitly removes the button border and box shadow so it reads as a filled search bar rather than a bordered pill.
- Header and content panel hard divider lines were removed; the sidebar divider is now transparent while tonal surfaces carry hierarchy.
- Gemini rejected the 6px TOC dot as badge-like; TOC active tracker now uses a thin 4px by 16px vertical pill.
- Demo showcase and seed preview panels moved from outlined cards toward filled tonal surfaces.
- New Playwright contracts were added/updated for the filled search field, vertical-pill TOC tracker, ThemeSelect scale/opacity motion, transparent menu selected state, filled cards, and reduced hard dividers.
- `pnpm run typecheck` passed.
- `pnpm run build` passed.
- `pnpm run check:contrast` passed.
- `pnpm pack --dry-run` passed.
- `pnpm run test:screenshots:update` passed with 45 tests and refreshed baselines.
- `pnpm run test:screenshots` passed with 45 tests after the refreshed baselines.

2026-06-19 human color-pairing and type-rhythm pass:

- Human review clarified that the important problem is color-role pairing, not the demo hue itself.
- Fallback tokens and generated seed schemes now share the same dark surface relationship: `surface` is a lower page plane and `surface-container-low` is the first filled component/chrome plane.
- Persistent navigation and tabs now use `secondary-container` / `on-secondary-container` pairs instead of borrowing primary action colors.
- Header title, active sidebar labels, and TOC heading now use medium-weight MD3 title/label roles so chrome reads quieter than page content.
- Playwright now asserts the teal tonalSpot role relationship, secondary-container selected navigation pairing, dark surface hierarchy, and medium-weight chrome typography.
- `pnpm run typecheck` passed.
- `pnpm run check:contrast` passed.
- `pnpm run build` passed.
- `pnpm run test:screenshots:update` passed with 46 tests and refreshed baselines.

2026-06-20 color role audit:

- Gemini 3.1 Pro reviewed the color-role problem and recommended keeping broad layout areas on surface roles instead of filling them with primary, secondary, or tertiary.
- Follow-up review accepted two viable header strategies: `surface` plus a divider, or a chrome-frame approach where the fixed header and left drawer share `surface-container-low`.
- Human review chose the chrome-frame approach because the previous header/article same-surface treatment visually collapsed the Starlight shell.
- Header and sidebar now share `surface-container-low`; the article remains `surface`.
- TOC active marker and active label now use tertiary so primary, secondary, and tertiary have distinct document roles.
- Sidebar selected items keep secondary semantics but use a component-level mix with `surface-container-low` to reduce teal seed brightness.
