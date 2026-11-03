# Release Checklist

This checklist tracks release and maintenance readiness for the current
`starlight-theme-md3` v0.x line.

Last maintenance rewrite: 2026-11-03.

## Current Release Readiness

Status: **published v0.x project under active maintenance**.

The repository is no longer in a "before first publish" state. The current
package version on `main` is `0.2.3`, with Astro 7 / Starlight 0.41+ support,
runtime color picking, package-consumption checks, Playwright visual regression,
GitHub Pages deployment, and npm publishing automation already present.

The current focus is keeping dependencies, compatibility claims, public docs,
tests, and release automation aligned.

## Current Compatibility

- Package: `starlight-theme-md3`
- Current version: `0.2.3`
- Node: `>=22.23.4`
- Astro peer: `>=7.0.0 <8`
- Starlight peer: `>=0.41.0`
- Runtime dependency: `@material/material-color-utilities`

### Compatibility work still required

- [ ] Verify the lower supported Astro version in a clean fixture.
- [ ] Verify the lower supported Starlight version in a clean fixture.
- [x] Keep current-version compatibility covered by CI and screenshot tests.
- [ ] Revisit peer ranges only when actual compatibility evidence exists.

Do not widen or tighten peer ranges solely to match the latest installed demo
versions.

## Repository Hygiene

- [x] Generated output remains untracked.
- [x] README preview assets are committed intentionally.
- [x] Internal design notes remain outside the npm package.
- [x] Package-consumption fixture exists.
- [x] Repository agent guidance exists in `AGENTS.md`.
- [x] Current state is tracked in `docs/进度.md`.
- [x] Durable project memory is tracked in `docs/记忆.md`.
- [ ] Re-run duplicate / oversized tracked-asset audits before a larger release.
- [ ] Keep repository maintenance documentation synchronized with each release.

## Package Shape

- [x] Runtime dependencies remain intentionally minimal.
- [x] `@material/web` is not a runtime or peer dependency.
- [x] Tailwind is not a runtime or peer dependency.
- [x] Main package exports JavaScript and declarations.
- [x] CSS entrypoint and CSS subpath exports are present.
- [x] README assets, Chinese README, changelog, and license are intentionally
  included in the package.
- [ ] Re-run `pnpm pack --dry-run` before every release.
- [ ] Re-run the package-consumption fixture before every release.
- [x] Confirm the creator package/template still installs a compatible set.

## Public Documentation

- [x] Root README documents npm/pnpm installation and `md3Theme()`.
- [x] Chinese README is included.
- [x] Runtime color picker is documented in the README.
- [x] Implementation Overview now reflects the 0.2.2 runtime color picker.
- [ ] Keep option tables synchronized with `src/index.ts`.
- [ ] Keep compatibility text synchronized with package peer ranges.
- [ ] Check English/Chinese README parity before release.

Public docs under `src/content/docs/**` should remain consumer-facing.
Internal design, maintenance, reviewer, and handoff material belongs under
repository-level `docs/**`.

## Visual QA

Run a focused manual pass before a user-visible visual release.

### Desktop

- [ ] Homepage light/dark.
- [ ] Getting Started light/dark.
- [ ] Theme Lab light/dark.
- [ ] Plugin Options light/dark.
- [ ] Search dialog light/dark.
- [ ] Theme menu light/dark.
- [ ] Runtime color picker light/dark.

### Responsive

- [ ] Mobile top app bar.
- [ ] Mobile drawer open/close.
- [ ] Mobile TOC collapsed/open/scroll-to-last-heading.
- [ ] Runtime color picker mobile bottom sheet.
- [ ] Medium breakpoint with desktop sidebar plus compact TOC strip.

### High-impact MD3 surfaces

- [ ] Search field and Pagefind results.
- [ ] ThemeSelect trigger/menu.
- [ ] Sidebar selected states.
- [ ] TOC tracker and active state.
- [ ] Cards and tonal surfaces.
- [ ] Code blocks and inline code.
- [ ] Light/dark surface hierarchy.
- [ ] Reduced-motion behavior.

Do not update screenshot baselines simply because a dependency update caused a
diff. First determine whether the new output is intended.

## Dependency Maintenance

Dependency upgrades should normally be split into reviewable batches.

### Batch 1: compatible npm/pnpm dependency refresh

- [x] Inspect `pnpm outdated`.
- [x] Update compatible patch/minor releases.
- [x] Check root, workspace package, and creator template.
- [x] Refresh `pnpm-lock.yaml`.
- [x] Run the full verification gate.
- [x] Record the resulting version matrix in `docs/进度.md`.

### Batch 2: GitHub Actions

- [x] Review current stable versions and migration notes.
- [x] Upgrade Actions in a separate commit/PR from visual changes.
- [x] Verify CI.
- [ ] Verify Pages build/deploy.
- [ ] Verify visual-regression artifact upload.
- [ ] Verify npm publish dry-run path.

### Major upgrades

Node, pnpm, TypeScript, Astro, Starlight, and other major-version changes should
be evaluated separately unless a task explicitly asks for a coordinated major
migration.

## npm Publishing Automation

The repository has `.github/workflows/publish-npm.yml` with:

- tag and manual triggers,
- pre-publish verification,
- unpublished-version guard,
- token path when `NPM_TOKEN` exists,
- trusted-publishing path when a token is absent.

Trusted publishing was verified by the `starlight-theme-md3@0.2.3` release on
2026-11-03. GitHub Actions publishes with OIDC when `NPM_TOKEN` is absent.

- [x] Confirm npm trusted publishing / OIDC in npm settings before relying on it.
- [ ] If intentionally using token fallback, confirm the granular automation token
  and repository secret exist.

Do not mark either external configuration complete without checking the actual
npm/GitHub settings.

## Verification Gates

Run before a release or after a dependency batch:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run check:contrast
pnpm run build
pnpm run verify:package
pnpm pack --dry-run
```

For visual or interaction-sensitive changes:

```sh
pnpm run test:screenshots
CI=1 pnpm run test:screenshots
```

For production runtime color picker behavior:

```sh
pnpm run test:color-picker:production
```

Also run `git diff --check` before handoff.

## GitHub Actions Confirmation

Before release:

- [x] CI workflow passes for the target commit.
- [ ] GitHub Pages deployment succeeds.
- [ ] Demo routes and assets load from the deployed base path.
- [ ] Manual visual regression can upload artifacts.
- [x] npm publish workflow and Trusted Publishing succeed when intentionally tested.

## Release Steps

Only perform these when a release is explicitly intended.

- [ ] Ensure the worktree/branch is clean.
- [ ] Decide the release version.
- [ ] Update `package.json` and any workspace package version that is actually
  being released.
- [ ] Update `CHANGELOG.md`.
- [ ] Update compatibility/public docs if needed.
- [ ] Update `docs/进度.md`.
- [ ] Run all verification gates.
- [ ] Inspect `pnpm pack --dry-run`.
- [ ] Review visual regression.
- [ ] Commit release metadata.
- [ ] Create the intended release tag.
- [ ] Publish through the configured workflow.
- [ ] Verify the npm package page, exports, README assets, and install flow.
- [ ] Verify the GitHub Pages demo.

## Stable-Version Follow-Up

Before moving beyond the v0.x preview line:

- [ ] Decide which plugin options are stable.
- [ ] Decide which `--md3-comp-*` tokens become contractual.
- [ ] Validate peer dependency lower bounds.
- [ ] Re-check creator template parity.
- [ ] Review any remaining Search Dialog `in-progress` status.
- [ ] Decide whether current `expressive` palette approximation remains acceptable.
- [ ] Review accumulated design decisions for obsolete or superseded entries.
