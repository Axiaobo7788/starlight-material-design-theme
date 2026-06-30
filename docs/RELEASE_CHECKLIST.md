# Release Checklist

This checklist tracks the repository cleanup and release-readiness work for
`starlight-theme-md3`.

## Current Release Readiness

Status: **ready for final manual release review**.

The core theme is usable as a v0.x package: the Starlight plugin, CSS bundle,
Material color utilities integration, demo docs, CI, package-consumption fixture,
and Playwright visual checks are already in place. Release metadata, README
preview assets, and public docs have been cleaned up. The remaining work is final
manual review, CI confirmation after push, and publish execution.

## Blocking Before First Publish

- [x] Decide the first public version number.
  - Package version is prepared as `0.1.0`.
- [x] Fix README image publishing.
  - Root `README.md` references `docs/readme/*.webp`.
  - `package.json#files` now includes `docs/readme`.
  - README mobile preview images no longer depend on Playwright snapshot paths.
- [x] Decide whether `docs/README.zh-CN.md` should be included in the npm package.
  - Chinese README is included through `package.json#files`.
- [x] Add npm metadata that helps discovery.
  - `repository`, `bugs`, and `homepage` are defined.
  - Keywords cover Astro, Starlight, Material Design, Material You, theme, and docs.
- [x] Confirm the package name is available on npm.
  - Target name: `starlight-theme-md3`.
  - `npm view starlight-theme-md3 version --json` returned `E404` on 2026-06-23, so the public package name was not claimed at that time.

## Repository Hygiene

- [x] Keep generated build output untracked.
  - `.gitignore` already excludes `dist/`, `demo-dist/`, `.astro/`, `tmp/`, `test-results/`, and `playwright-report/`.
  - Current tracked file list does not include `.astro/`, `test-results/`, `dist/`, or `demo-dist/`.
- [x] Keep README-only images small and intentional.
  - Current README preview images in `docs/readme/` are compact WebP files.
  - Playwright baseline images remain under `tests/theme-screenshots.spec.ts-snapshots/`.
- [x] Avoid publishing design working notes unless intentional.
  - `docs/design/` is useful for repository collaboration.
  - It is not currently included in the npm tarball.
- [x] Re-run duplicate or oversized asset audit before release.
  - Check exact duplicate hashes.
  - Check files over 1MB.
  - Check unused tracked assets.
  - 2026-06-23 audit: no duplicate image hashes found; no non-build tracked files over 1MB found.

## Package Shape

- [x] Verify runtime dependencies stay minimal.
  - `@material/material-color-utilities` is the only runtime dependency.
  - `@material/web` must remain out of runtime and peer dependencies.
  - Tailwind must not become a runtime or peer dependency.
- [ ] Confirm peer dependency range.
  - Current peers: `@astrojs/starlight >=0.41.0`, `astro >=7.0.0 <8`.
  - Test against the lowest supported versions before declaring the range stable.
- [x] Confirm exports.
  - `.` should expose `dist/index.js` and `dist/index.d.ts`.
  - `./css/index.css` should expose `dist/css/index.css`.
  - `./css/*` should expose bundled CSS subpaths.
- [x] Confirm tarball contents with `pnpm pack --dry-run`.
  - Expected core files: `dist/**`, `README.md`, `LICENSE`, `package.json`.
  - README image assets, Chinese README, and `CHANGELOG.md` are intentionally published.
  - 2026-06-23 dry run confirmed `dist/**`, `docs/README.zh-CN.md`, `docs/readme/*.webp`, `CHANGELOG.md`, `README.md`, and `LICENSE`.

## Documentation

- [x] Root README is release-ready.
  - Install command is correct.
  - Usage example uses `plugins: [md3Theme()]`.
  - Preview images render outside the local repo.
  - Options table matches `src/index.ts`.
  - Current limits are honest for v0.x.
- [x] Chinese README is synchronized with the root README.
  - Location: `docs/README.zh-CN.md`.
  - Image paths work on GitHub.
  - Usage and option tables match English README.
- [x] Demo docs are release-ready.
  - Getting Started is consumer-focused.
  - Plugin Options matches implementation.
  - Design Tokens distinguishes stable system roles from preview component tokens.
  - Implementation Overview clearly marks current release boundaries.
- [x] Public docs do not expose internal design requirements.
  - `src/content/docs/**` should read as user-facing documentation.
  - Internal release tasks, handoff notes, and design-review requirements belong under repository-level `docs/**`.
- [x] Add a short changelog or release notes file before tagging.
  - Recommended file: `CHANGELOG.md`.
  - First entry should summarize v0.1.0 scope, limitations, and migration expectations.

## Visual QA

- [ ] Run desktop visual pass.
  - Homepage light/dark.
  - Getting Started light/dark.
  - Theme Lab light/dark.
  - Plugin Options light/dark.
  - Search dialog light/dark.
  - Theme menu light/dark.
- [ ] Run responsive visual pass.
  - Mobile top app bar.
  - Mobile drawer open/close.
  - Mobile TOC collapsed/open/scroll-to-last-heading.
  - Medium breakpoint with desktop sidebar plus compact TOC strip.
- [ ] Re-check the MD3 high-impact components.
  - Search field and search dialog.
  - Theme select menu.
  - Sidebar selected states.
  - TOC tracker and active state.
  - Cards and filled surfaces.
  - Code blocks and inline code.
- [ ] Confirm color harmony.
  - Light mode header/sidebar/content/TOC surface hierarchy.
  - Dark mode header/sidebar/content/TOC surface hierarchy.
  - Selected states use primary/secondary containers intentionally.

## npm Publishing Automation

- [x] Add GitHub Actions workflow for npm publishing.
  - Workflow: `.github/workflows/publish-npm.yml`.
  - Trigger: `v*` tags and manual `workflow_dispatch`.
  - The workflow verifies typecheck, contrast, build, package consumption, and pack dry-run before publishing.
  - It checks that the package version is not already published before a real publish.
- [ ] Configure npm trusted publishing for tokenless releases.
  - npm package: `starlight-theme-md3`.
  - Publisher: GitHub Actions.
  - Organization or user: `aXiaobo7788`.
  - Repository: `starlight-material-design-theme`.
  - Workflow filename: `publish-npm.yml`.
  - Allowed action: `npm publish`.
- [ ] Optional fallback: add a granular npm automation token as GitHub secret `NPM_TOKEN`.
  - Prefer trusted publishing when possible because it avoids long-lived tokens.
  - If `NPM_TOKEN` is present, the workflow publishes with that token.
  - If `NPM_TOKEN` is absent, the workflow publishes through npm trusted publishing/OIDC.

## Verification Gates

Run these before publishing or tagging:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run check:contrast
pnpm run build
pnpm run verify:package
pnpm pack --dry-run
```

Run these before accepting visual changes:

```sh
pnpm run test:screenshots
CI=1 pnpm run test:screenshots
```

2026-06-23 local verification completed:

- `pnpm run typecheck`
- `pnpm run check:contrast`
- `pnpm run build`
- `pnpm run test:screenshots`
- `pnpm run verify:package`
- `pnpm pack --dry-run`
- `git diff --check`

For CI parity, also confirm GitHub Actions:

- [ ] CI workflow passes on `main`.
- [ ] Deploy Pages workflow succeeds and docs routes work after deployment.
- [ ] Visual Regression workflow can be run manually and uploads artifacts.

## Publish Steps

- [ ] Ensure the worktree is clean.
- [ ] Update version in `package.json`.
- [ ] Update changelog or release notes.
- [ ] Run all verification gates.
- [ ] Inspect `pnpm pack --dry-run` output.
- [ ] Create a git commit for release metadata.
- [ ] Create an annotated tag, for example `v0.1.0`.
- [ ] Publish with npm using the intended access level.
- [ ] Push commit and tag.
- [ ] Verify npm package page, README images, exports, and install command.
- [ ] Verify GitHub Pages demo after deployment.

## Post-Release Follow-Up

- [ ] Open issues for non-blocking visual refinements.
- [ ] Track MD3 color harmony refinements separately from release blockers.
- [ ] Keep `--md3-comp-*` tokens marked as public-preview until they survive one release cycle.
- [ ] Revisit Material Color Utilities DynamicScheme entrypoints only after Node ESM imports are stable.
