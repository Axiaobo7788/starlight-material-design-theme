# AGENTS.md

This file is the working contract for coding agents operating in this repository.

## Project identity

`starlight-theme-md3` is a Material Design 3 / Material You inspired theme for Astro Starlight. The project intentionally remains a thin layer over Starlight rather than replacing Starlight's content model, router, search, table of contents, or MDX components.

Current public line: `0.2.x`.
Current package version on `main`: `0.2.3`.

## Read before changing code

Before a non-trivial change, inspect these files:

1. `README.md`
2. `docs/进度.md`
3. `docs/记忆.md`
4. `docs/design/DECISIONS.md`
5. `docs/design/TOKEN_CONTRACT.md`
6. `docs/design/COMPONENT_STATUS.md`
7. `docs/RELEASE_CHECKLIST.md`

If documentation conflicts with the implementation, verify the current source and tests first, then update the stale documentation in the same change when practical.

## Architecture invariants

- Keep the theme CSS-first and token-first.
- Preserve the public integration shape: `plugins: [md3Theme()]`.
- Prefer CSS variables and Starlight-compatible styling over component replacement.
- Add or expand Astro component overrides only when CSS cannot safely express the required DOM or behavior.
- Do not add Tailwind to the core theme.
- Do not add `@material/web` as a runtime or peer dependency.
- Material Web and Material Design 3 are design references, not runtime architecture.
- Keep runtime dependencies minimal. The current runtime dependency is `@material/material-color-utilities`.
- Preserve Starlight accessibility, navigation, search, TOC behavior, content collections, and MDX semantics.
- Do not replace tonal hierarchy with gradients, glass effects, glow, or heavy shadows.
- Respect `prefers-reduced-motion`.

## Design rules

Treat `docs/design/TOKEN_CONTRACT.md` as the visual contract.

Important defaults:

- Broad page areas use surface roles.
- Header/sidebar chrome may use surface-container roles.
- Persistent navigation uses secondary-container / on-secondary-container.
- Primary is reserved for high-emphasis actions, links, focus, and lightweight indicators.
- TOC active treatment is intentionally quiet.
- Menus are compact temporary surfaces, not pill-shaped floating cards.
- Static cards should not acquire decorative hover/lift behavior.
- Dark mode must avoid pure black.
- Docs density should remain documentation-like, not landing-page-like.

Existing accepted visual decisions should not be casually rewritten. If a change intentionally supersedes one, update `docs/design/DECISIONS.md` and explain why.

## Runtime controls

The current release includes an opt-in runtime Material color picker. It supports author and visitor usage modes and may persist visitor-selected palettes when configured.

Do not reintroduce claims that runtime dynamic color picking is absent.

## Toolchain and package constraints

- Node engine: `>=22.23.4`.
- CI currently uses Node 24.
- Package manager is pnpm.
- The repository commits `pnpm-lock.yaml`.
- Root package and `packages/create-starlight-theme-md3` are both part of the workspace.
- Astro peer range is currently `>=7.0.0 <8`.
- Starlight peer range is currently `>=0.41.0`.

When updating dependencies:

- Prefer compatible patch/minor updates first.
- Treat major upgrades as separate, reviewable work unless explicitly requested.
- Keep peer ranges honest; do not widen them without testing the lower bound.
- Inspect the creator package/template as well as the root package.
- Refresh the lockfile with pnpm, not npm.
- Do not update screenshot baselines merely to make a test pass. Confirm the visual change is intentional.

## Validation

For ordinary source changes, run the smallest relevant checks first, then the full gate before handoff.

Core gate:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run check:contrast
pnpm run build
pnpm run verify:package
pnpm pack --dry-run
```

For visual, interaction, CSS, Starlight compatibility, or screenshot-sensitive changes:

```sh
pnpm run test:screenshots
```

For color picker production behavior:

```sh
pnpm run test:color-picker:production
```

When baselines genuinely need to change, run the update command deliberately and report which screenshots changed and why.

## GitHub Actions

The repository currently has workflows for:

- CI
- GitHub Pages deployment
- npm publishing
- manual visual regression

Action-version upgrades are allowed, but major-version changes should be verified against their release/migration notes and kept separate from unrelated visual changes where possible.

## Release safety

Do not, unless explicitly requested:

- bump package versions,
- create release tags,
- publish to npm,
- merge a PR,
- rewrite public API names,
- widen peer dependency ranges without validation.

Publishing configuration and trusted publishing are maintainer-controlled release concerns.

## Documentation hygiene

After a meaningful implementation or maintenance pass:

- update `docs/进度.md` with the current state, completed work, remaining work, and validation,
- update `docs/记忆.md` only when a durable architectural/design/maintenance fact changes,
- update `CHANGELOG.md` only for user-visible release changes,
- update `docs/design/DECISIONS.md` when a design or architecture decision is accepted or superseded,
- keep `docs/RELEASE_CHECKLIST.md` aligned with the current release line.

`docs/进度.md` is a current snapshot and may change often.
`docs/记忆.md` is long-lived context and should stay compact and durable.

## Agent handoff format

At the end of work, report:

1. What changed.
2. Exact files changed.
3. Dependency/version changes, if any.
4. Commands run and whether each passed.
5. Any screenshot/baseline changes.
6. Remaining risks or follow-up work.
7. Whether `docs/进度.md` and `docs/记忆.md` were updated.

Prefer small, reviewable commits and avoid unrelated cleanup.
