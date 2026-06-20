# MD3 Visual Audit - 2026-06-18

This audit was run module-by-module with Gemini 3.1 Pro using actual screenshots plus the local design contract.

## Inputs

Screenshots were generated under `/tmp/starlight-md3-audit/screens`:

- desktop light and dark home pages
- Theme Lab top, full-page light/dark, and component sections
- theme menu light/dark
- search dialog
- plugin options light/dark
- mobile top and drawer light/dark

Raw Gemini reports were saved under `/tmp/starlight-md3-audit/reviews`.

Design references:

- `docs/design/MATERIAL_BRIEF.md`
- `docs/design/VISUAL_CHECKLIST.md`
- `docs/design/TOKEN_CONTRACT.md`
- relevant `src/styles/md3/*.css` files
- relevant Astro/MDX component files

## Overall Result

The theme is stable enough for continued iteration, but the visual system is not final. The audit found several concrete MD3 alignment fixes.

Summary:

- 5 modules returned `NO_PATCH`.
- 9 modules returned patch candidates or review items.
- No module recommended adding Tailwind or `@material/web` as a runtime dependency.
- Most findings are small CSS/token changes, not architecture changes.

## Implementation Update

Status: `accepted`

The P0 and low-risk P1 changes from this audit were implemented and reviewed again with Gemini 3.1 Pro using screenshots.

Accepted P0 changes:

- passive navigation/surface components now use `on-surface` state layers instead of global primary state layers
- header and dialog scrim no longer use `backdrop-filter`
- header/nav background is opaque `surface-container-low`
- sidebar section headings use `on-surface-variant` at weight `500`
- sidebar nested list guide lines were removed
- Markdown list markers use `on-surface-variant`
- mobile defaults use larger touch targets while desktop restores compact density at `50rem`

Accepted P1 changes:

- badges and tabs use `shape-sm` instead of full pill
- tables use a quiet `outline-variant` outer border, lighter headers, direct token dividers, and no final-row double border
- code blocks use `surface` body with `surface-container-low` header
- homepage now renders in normal docs chrome and keeps a compact Material preview in page content

Search field decision:

- Keep `--md3-comp-search-field-shape: var(--md-sys-shape-full)`.
- Gemini confirmed that full-pill shape is aligned with MD3 Search Bar anatomy, so the earlier `shape-sm` suggestion should not be applied.

Validation after implementation:

- `pnpm run typecheck` passed.
- `pnpm run check:contrast` passed.
- `pnpm run build` passed.
- `pnpm pack --dry-run` passed.
- `pnpm run verify:package` passed.
- `pnpm run test:screenshots` passed after accepting updated baselines.

## Accepted Modules

These modules were accepted without changes in this pass:

- TOC / right rail
- Theme select menu
- Asides / semantic tonal containers
- Dark mode surface hierarchy
- Motion / state layers / ripple

Notes:

- TOC active state is quiet and clear.
- Theme menu no longer resembles a native select.
- Aside full-container tonal treatment remains intentional.
- Dark mode avoids pure black and neon contrast.
- Motion is limited to state transitions, ripple, short navigation feedback, and reduced-motion support.

## Patch Candidates

### P0 - High Confidence

Status: `implemented and accepted`

These should be handled first because they are direct contract violations or visible chrome issues.

1. Replace global primary state layers on passive surface/navigation components.
   - File: `src/styles/md3/component-tokens.css`
   - Change nav item, TOC link, header control, and tabs hover/focus/pressed container tokens from `--md3-state-*` to `--md3-state-on-surface-*`.
   - Keep primary state layers for text/outlined buttons where primary emphasis is expected.

2. Remove glassmorphism from header and dialog scrim.
   - File: `src/styles/md3/layout.css`
   - Remove `backdrop-filter` and `-webkit-backdrop-filter` from header and `dialog::backdrop`.
   - This aligns with the contract rule against glass effects.

3. Fix sidebar tree-view cues.
   - File: `src/styles/md3/layout.css`
   - Make `.sidebar-content .large` use `on-surface-variant` and weight `500`.
   - Remove nested list vertical guide lines so hierarchy relies on indentation.

4. Fix list marker accent overuse.
   - File: `src/styles/md3/prose.css`
   - Change `.sl-markdown-content li::marker` from primary to `on-surface-variant`, or let it inherit.

5. Improve mobile touch targets while keeping desktop compact.
   - File: `src/styles/md3/density.css`
   - Make mobile defaults larger:
     - `--md3-density-nav-item-min-height: 2.5rem`
     - `--md3-density-header-control-height: 2.75rem`
   - Restore compact desktop values in `@media (min-width: 50rem)`.

### P1 - Needs Careful Visual Review After Patch

Status: `partially implemented and accepted`

These are likely valid but may shift the theme's visual personality more noticeably.

1. Reconsider search field shape.
   - Gemini suggested changing `--md3-comp-search-field-shape` from `shape-full` to `shape-sm`.
   - This follows the local contract for text-field-like controls, but should be checked against MD3 Search Bar anatomy before applying because MD3 search bars often have highly rounded containers.
   - Final follow-up decision: keep `shape-full`.

2. Reduce full-pill overuse in tabs and badges.
   - File: `src/styles/md3/component-tokens.css`
   - Gemini suggested changing:
     - `--md3-comp-tabs-shape`
     - `--md3-comp-badge-shape`
   - Suggested value: `var(--md-sys-shape-sm)`.

3. Rework tables.
   - File: `src/styles/md3/prose.css`
   - Add a quiet outer border using `outline-variant`.
   - Remove table header background.
   - Reduce table header weight to `600`.
   - Use direct `outline-variant` row dividers rather than `color-mix`.
   - Remove bottom border on the last row to avoid double borders.

4. Rework code block contrast and header token.
   - Files:
     - `src/styles/md3/component-tokens.css`
     - `src/styles/md3/code.css`
   - Suggested:
     - `--md3-comp-code-block-container-color: var(--md-sys-color-surface)`
     - `--md3-comp-code-header-container-color: var(--md-sys-color-surface-container-low)`
     - `.expressive-code .frame .header` should use `--md3-comp-code-header-container-color`.

5. Change homepage from splash demo to docs-chrome demo.
   - File: `src/content/docs/index.mdx`
   - Suggested:
     - remove `template: splash` or change to `template: doc`
     - remove `<CardGrid stagger>`
   - Goal: first viewport should show Starlight docs chrome, not a landing-page composition.
   - Follow-up: human visual review rejected this result because the homepage looked like a normal documentation article. The project restored `template: splash`; this audit item is superseded.

### P2 - Conflicts Or Needs Human Decision

Status: `resolved`

1. Header blur conflict.
   - Header/search audit says remove `backdrop-filter`.
   - Mobile audit praised the header blur.
   - Local contract explicitly forbids glass effects, so default decision should be to remove blur unless the human reviewer intentionally keeps it.
   - Final decision: remove blur and make header background opaque.

2. Motion/state-layer wording conflict.
   - Motion audit returned `NO_PATCH`.
   - Token audit correctly found that `--md3-state-hover/focus/pressed` are primary-based and overused by passive components.
   - Resolution: keep the motion model, but change component token mappings for passive components to `on-surface` state layers.
   - Final decision: implemented.

3. Search field shape.
   - `shape-sm` may satisfy the local "text-field-like" rule.
   - `shape-full` may better match MD3 search bar patterns and the current Starlight command-button anatomy.
   - Needs one focused follow-up review before changing.
   - Final decision: keep full pill.

## Recommended Implementation Order

1. P0 token and chrome cleanup:
   - state-layer mappings
   - remove blur
   - sidebar heading/tree lines
   - prose list marker
   - mobile density defaults

2. Run:
   - `pnpm run typecheck`
   - `pnpm run check:contrast`
   - `pnpm run build`
   - targeted Playwright screenshots

3. Send new screenshots back to Gemini for P0 acceptance.

4. Apply P1 in smaller batches:
   - tables
   - code blocks
   - tabs/badges
   - homepage
   - search shape only after explicit decision

5. Update screenshot baselines only after Gemini accepts each batch.

## Progress Reassessment

After implementing the accepted P0/P1 changes, the project is still alpha but closer to beta:

- Engineering/package foundation: about 80-85%.
- Visual system: about 65-70%.
- Overall project: about 70%.

The main gain from this audit is clarity: the next iteration no longer needs broad guessing. It has a concrete list of small MD3-focused patches.
