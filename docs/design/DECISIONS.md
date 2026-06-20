# Design Decisions

This is the decision log for `starlight-theme-md3`.

## Accepted

### 2026-06-18: Keep Theme CSS-First

The theme should remain primarily CSS variables plus a Starlight plugin. Astro component overrides are allowed only when CSS cannot express the needed DOM or behavior.

Reason:

- Maintains the simple user API: `plugins: [md3Theme()]`.
- Avoids forcing a component runtime into Starlight docs.

### 2026-06-18: Do Not Add Tailwind To Core Theme

Tailwind should not be a dependency or required user configuration for the core theme.

Reason:

- Tailwind does not solve MD3 visual judgment.
- It can accelerate generic template output if design constraints are weak.
- The current architecture is already token-first CSS.

### 2026-06-18: Use Material Web And MD3 As References, Not Runtime

Material Web Components and Material Design 3 specifications should guide token naming, component anatomy, state layers, shape, and motion. They should not be required runtime dependencies.

Reason:

- Keeps the package lightweight.
- Keeps Starlight content, navigation, search, and MDX behavior intact.

### 2026-06-18: Replace Native Theme Select With A Small Override

The theme includes a small `ThemeSelect.astro` override because browser-native `select` popups cannot be reliably styled to match MD3 menus.

Reason:

- Native popup selected states can expose system blue.
- A small override keeps the user API unchanged.
- The implementation still uses Starlight's theme storage and document theme behavior.

### 2026-06-18: Use Gemini As MD3 Visual Reviewer And Codex As Implementer

Gemini 3.1 Pro should provide visual review and patch specs for Material Design 3 alignment. Codex should translate accepted specs into scoped code changes, preserve Starlight constraints, and run validation.

Reason:

- Separates MD3 visual judgment from repository integration.
- Keeps changes small, reviewable, and testable.
- Prevents visual advice from turning into broad architecture rewrites.

### 2026-06-18: Keep Menu And TOC Active States Quiet

Right-side TOC active states should not use navigation drawer-style selected pills. TOC active items use primary label color plus a compact tracker. Theme menu active state should remain quieter than navigation, but may use a menu-appropriate selected row when the menu surface itself is small and transient.

Reason:

- Leading indicators are too visually noisy outside navigation drawer contexts.
- Menus and dense right rails should remain quieter than primary navigation.

### 2026-06-19: Treat ThemeSelect As Top App Bar Icon Action Plus MD3 Menu

The ThemeSelect trigger should be a 48px icon-only top app bar action. The open state should reveal a small MD3 menu surface with `shape-xs`, `surface-container`, level 2 elevation, 8px vertical padding, no horizontal container padding, and flush list items. The selected item originally used a full-width `secondary-container` row, but later Gemini review and human review moved it to a quieter transparent row with primary-colored label/checkmark.

Reason:

- Text or filled/outlined trigger treatments made the control read like a desktop combobox or Fluent-style selector.
- The top app bar action should stay low-emphasis until invoked.
- MD3 menu items are list rows inside a surface; rounded item pills made the component feel like nested navigation.
- Open motion uses `medium2` emphasized-decelerate scale/opacity from the top-right anchor; close motion uses `short4` emphasized-accelerate before the menu restores `hidden`.
- Gemini 3.1 Pro final screenshot review returned `DO-NOT-CHANGE`.

### 2026-06-19: Prefer Anchored Expansion Over Generic Menu Pop

Superseded. ThemeSelect menu motion should feel like an anchored temporary surface expanding from the top app bar action, but Gemini's required follow-up review rejected the `clip-path` mask as too rigid and mechanical.

Reason:

- The user identified the previous motion as still feeling off for Material Design.
- Material Web menus are anchored temporary surfaces, and the icon button trigger remains the correct low-emphasis action.
- The accepted follow-up keeps top-right `transform-origin`, opacity, and scale with MD3 emphasized easing, but removes `clip-path`.
- The selected menu item now relies on primary-colored label/checkmark over a transparent row instead of a persistent `secondary-container` fill.

### 2026-06-18: Let Gemini Own MD3 Visual CSS

Gemini 3.1 Pro should directly author visual CSS patches for MD3 alignment. Codex should apply those patches, preserve Starlight and package constraints, and report regressions back to Gemini when validation fails.

Reason:

- Gemini has stronger MD3 visual judgment.
- Codex is better used for repository context, integration, tests, and packaging.
- The collaboration should be peer review, not Codex translating Gemini's visual taste through its own style assumptions.

### 2026-06-18: Use MD3 Container-Fill Asides

Semantic asides should use MD3 tonal container fills without a leading stripe. Gemini selected `secondary-container` for neutral notes, `primary-container` for tips, `tertiary-container` for caution, and `error-container` for danger.

Reason:

- The component should read as a tonal Material card rather than a legacy documentation warning box.
- The icon/title/text should inherit the matching `on-*container` role.
- Removing the side stripe keeps the aside closer to MD3 card anatomy.

### 2026-06-18: Keep Static Cards Quiet

Static Starlight cards should not gain hover or focus effects. Only interactive link cards should receive hover tonal changes, focus outlines, and elevated feedback.

Reason:

- MD3 elevation/state feedback should communicate interactivity.
- Static documentation cards should remain calm surfaces.
- This keeps dense docs pages from feeling like a dashboard of clickable widgets.

### 2026-06-18: Use Quiet Dense Tables And Code Frames

Tables should use a dense tonal surface with a quiet `outline-variant` outer border. Code frames should use `surface` for the code body and `surface-container-low` for the header.

Reason:

- Tables are repeated reading structures, not emphasized cards.
- Code block chrome should not compete with syntax content.
- Soft dividers and a quiet outer outline preserve structure while reducing visual noise.

### 2026-06-18: Keep Current Dark And Mobile Treatments

Gemini reviewed dark semantic surfaces and mobile layout density after the latest component pass and returned `NO_PATCH`.

Reason:

- Dark mode surface separation remains within the intended MD3 tonal hierarchy.
- Full-container semantic asides are intentional, including the error container in dark mode.
- Mobile layout remains compact enough for docs while preserving readable spacing and hit targets.

### 2026-06-18: Accept Image-Backed MD3 Visual Baselines

Gemini 3.1 Pro reviewed actual screenshots via `agy` image references, including light, dark, mobile, theme menu, and plugin option pages, and returned `NO_PATCH`.

Reason:

- The current header/search, sidebar, TOC, theme menu, prose rhythm, tonal surfaces, dark mode, and mobile density match the project MD3 design contract.
- Playwright screenshot baselines should represent this accepted visual state.
- Future visual changes should be treated as intentional design changes and reviewed against these baselines.

### 2026-06-18: Restore Splash Homepage After Human Review

The homepage should use Starlight's `template: splash`. The previous docs-chrome homepage direction was reviewed in-browser and rejected because it made the landing page feel like an ordinary documentation article.

Reason:

- The homepage is the package's first visual signal and needs a compact theme preview, not only the normal docs reading shell.
- Interior pages already demonstrate the real MD3 navigation, right rail, and surface hierarchy.
- This decision supersedes the earlier Gemini-accepted docs-chrome recommendation.

### 2026-06-18: Use Two-Stage MD3 Ripple Timing

Pointer-origin ripple feedback should follow a Material Web style press/release model: grow while pressed, keep the pressed state visible for a short minimum hold, and fade only after release.

Reason:

- Material ripples are state layers, not decorative one-shot animations.
- A 450ms grow, 225ms minimum press, and 150ms release fade matches the Material Web timing model closely enough without adding `@material/web` as a runtime dependency.
- The pressed opacity should come from the MD3 state opacity token.

### 2026-06-18: Keep Search Field Full Pill

The search entry keeps `--md3-comp-search-field-shape: var(--md-sys-shape-full)`.

Reason:

- Gemini's follow-up review confirmed that MD3 Search Bar anatomy is fully rounded.
- The control behaves as a command/search entry in the top app bar, so full pill is appropriate.
- Earlier `shape-sm` guidance is superseded by this focused search-shape decision.

### 2026-06-18: Use Functional MD3 Motion Only

Global motion should stay limited to Material-style state feedback: pointer-origin ripple, pressed state retention, sidebar disclosure motion, quiet TOC marker changes, and short navigation pending feedback.

Reason:

- Gemini rejected page-entry, hover-lift, bounce, and decorative reveal effects as non-MD3.
- Ripple follows the Material Web press/release timing model: 450ms grow, 225ms minimum press, and 150ms release fade.
- Sidebar disclosure uses expand/collapse duration asymmetry with opacity and content-size changes rather than spectacle animation.
- Reduced motion must remove interactive animation.

### 2026-06-18: Use A Single Floating TOC Tracker

The right-side TOC active marker uses one quiet 4px vertical capsule that follows the active link. Runtime-enhanced pages move the single tracker between links; no-motion pages keep the static internal-link fallback.

Reason:

- Gemini rejected a square/block tracker because it reads too much like primary navigation selection.
- A single moving capsule gives continuity while staying quieter than the sidebar selected state.
- The no-runtime fallback keeps the active state visible when `motion: false`.
- The active label uses `primary` and medium weight while remaining quieter than the sidebar selected state.

### 2026-06-18: Treat Mobile Menu As A Top App Bar Icon Button

The mobile menu button should be a transparent MD3 top app bar icon button with a 48px hit target.

Reason:

- Gemini identified the filled `primary-container` menu button as too visually heavy for a top app bar navigation icon.
- The button must keep Starlight's fixed positioning while allowing ripple clipping, so the theme explicitly restores `position: fixed`.
- `--sl-menu-button-size: 48px` aligns the hit target with MD3 accessibility expectations and prevents viewport-edge clipping.

### 2026-06-18: Use Content-Only Route Transition

Internal same-origin documentation navigation should use a short content-only transition: the current content fades and shifts up slightly before navigation, and the next page content settles in from a small downward offset.

Reason:

- Gemini confirmed this is navigation continuity rather than a generic page-entry reveal because it only runs after internal theme navigation.
- Header, search, and primary chrome remain stable to avoid color or layout flashes during page changes.
- Leaving uses 80ms with standard accelerate easing; entering uses 180ms with emphasized decelerate easing.
- The transition is disabled for reduced motion and for `motion: false`.

### 2026-06-18: Keep Desktop Search Vertical Spacing

Do not reduce the desktop top app bar or search field size in the compact preset.

Reason:

- Gemini confirmed the current 64px top app bar with a 48px search control gives an 8px top/bottom rhythm that matches MD3 expectations.
- Reducing the search below 48px would weaken touch target consistency.
- The search field should remain visually stable while route transitions animate only the content area.

### 2026-06-18: Align Homepage And Docs Search In The Top App Bar

The homepage and documentation pages should use the same desktop search field anchor in the top app bar.

Reason:

- The search field belongs to the top app bar, not the page content grid.
- Keeping a stable X position reduces spatial fragmentation and preserves muscle memory across splash and docs templates.
- The implementation standardizes the desktop title area width instead of tying search to the sidebar or content column.
- Search still keeps the 48px MD3 hit target.

### 2026-06-18: Use A CSS-Only Search Container Transform Approximation

The search dialog should open and close with a CSS-only approximation of the MD3 Search Bar to Search View container transform. It starts from `scale(0.9) translateY(-4%)` and settles to full size with opacity. The backdrop uses the MD3 scrim role without blur.

Reason:

- Gemini confirmed this maps better to search container transform behavior than a generic dialog pop.
- Removing `backdrop-filter` avoids glassmorphism and prevents page color flashes during dialog entry.
- The transition is CSS-only and disabled through reduced-motion tokens.

### 2026-06-18: Keep Theme Menu Styling Encapsulated In The Override

All custom theme menu surface, item, selected-state, and menu open/close styles should live in `ThemeSelect.astro`. The menu uses an anchored expand motion from the top-right trigger, extra-small shape, elevation level 2, standard state layers, and a trailing checkmark for the selected option.

Reason:

- The component override exists because native select popups cannot be reliably styled as MD3 menus.
- Keeping the menu CSS with the override prevents duplicated layout/component rules from drifting.
- Selected state should remain subtle: on-surface label, a standard state layer, and a trailing checkmark, not a full selected navigation pill.

### 2026-06-19: Use Borderless ThemeSelect Top App Bar Action

The ThemeSelect trigger should rest as a transparent, borderless MD3 top app bar action with a text label, not as an outlined or filled combobox.

Reason:

- The previous persistent border, surface fill, fixed pill width, and mobile inset shadow made the control read like Fluent UI.
- MD3 top app bar actions rely on state layers for hover/focus/pressed feedback instead of a permanent field chrome.
- The visible label remains for clarity, but the component avoids native select or combobox styling.

### 2026-06-18: Allow Repeated Homepage Hero Entrance Motion

The splash homepage may animate its hero content each time the homepage is loaded or revisited.

Reason:

- The homepage is a presentation surface where a short hierarchy-revealing entrance motion can support the MD3 feeling of continuity.
- The motion is limited to opacity plus a small upward settle on hero title, tagline, actions, and preview.
- It remains under 500ms, uses emphasized decelerate easing, and respects `prefers-reduced-motion`.
- Interior documentation pages should not receive this entry animation.

### 2026-06-18: Use Canonical MD3 Purple As The Baseline

Superseded. The canonical purple sample remains useful as a named accent and as
the `playful` preset seed, but it should not be the default visual baseline for
this docs theme.

Reason:

- In screenshots, purple tonalSpot made primary, secondary, tertiary, and
  surfaces read as one lavender-gray cast.
- The user clarified that the demo hue itself is less important than balanced
  MD3 role pairing.
- Fallback color roles should still be generated-style exact HEX values instead
  of hand-tuned HSL approximations.
- Users can opt into purple with `accent: 'purple'`, `preset: 'playful'`, or a
  custom `seed`.

### 2026-06-19: Prioritize Color Pairing Over Canonical Demo Hue

The demo site, fallback token file, and default `accent` use `seed: '#00a99d'`
with `variant: 'tonalSpot'` so the default screenshots show clearer primary,
secondary, tertiary, and neutral surface relationships. Purple remains valid as
an explicit accent and example seed, but it made the demo read as a single
lavender-gray theme rather than a balanced Material You palette.

Reason:

- The user identified that MD3 authenticity depends on role pairing, not merely
  using official token names.
- Teal tonalSpot keeps the surface stack more neutral while giving tertiary a
  useful blue relationship.
- This is a demo/documentation choice, not a removal of purple support.

### 2026-06-19: Rebalance Chrome Typography

Top app bar, sidebar, right rail, and demo surface labels should use calmer
`600` weights instead of scattered `650` to `780` values.

Reason:

- MD3 typography relies on clear scale and role hierarchy more than heavy
  weight.
- Navigation selected states should be carried by container color and shape
  before boldness.
- Long-form docs need a quieter text texture across chrome and content.

### 2026-06-18: Tighten Document Vertical Reserves

Documentation pages should use a smaller content-panel vertical padding and a fixed `4rem` markdown bottom reserve when a TOC exists.

Reason:

- The previous `max(10rem, 42vh)` bottom reserve kept scrollspy comfortable but created strange empty space before pagination.
- MD3 reading surfaces should feel breathable without making short reference sections look unfinished.
- Playwright keeps the TOC active-marker behavior under regression coverage.

### 2026-06-18: Align Search To The Sidebar Width Token

The desktop search anchor should be driven by `--sl-sidebar-width`, not a hardcoded title width.

Reason:

- The search field belongs to the top app bar and should keep the same anchor on splash and documentation templates.
- Using Starlight's sidebar width token reduces visual drift when sidebar density or layout tokens change.
- The search field still keeps the 48px MD3 hit target and full-pill search-bar shape.

### 2026-06-18: Extend Homepage Entrance To Surfaces

Homepage-only entrance motion may include the first content sections, static cards, and showcase panels after the hero.

Reason:

- The homepage is a presentation surface, so a restrained hierarchy reveal supports the MD3 continuity feeling.
- Surface motion must stay smaller than the hero motion: opacity plus at most `0.5rem` vertical settle, 450ms emphasized decelerate easing, and small staggered delays.
- Interior docs remain free of initial page-entry animation.

## Proposed, Awaiting Review

None.
