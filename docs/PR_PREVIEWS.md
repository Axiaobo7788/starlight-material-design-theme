# Pull Request Previews

This repository keeps its production demo on GitHub Pages and uses Netlify only
for isolated pull request previews. This matches Starlight's own review flow:
each pull request receives a stable preview URL that updates when new commits
are pushed.

## One-Time Maintainer Setup

1. In Netlify, choose **Add new project > Import an existing project**.
2. Connect GitHub and select `aXiaobo7788/starlight-material-design-theme`.
3. Keep the build settings supplied by `netlify.toml`:
   - Base directory: repository root (`.`)
   - Package directory: empty
   - Build command: `ASTRO_SITE="$DEPLOY_PRIME_URL" ASTRO_BASE=/ pnpm build`
   - Publish directory: `demo-dist`
4. Under **Project configuration > Build & deploy > Continuous Deployment >
   Branches and deploy contexts**, confirm that Deploy Previews are enabled.
5. Under **Project configuration > Notifications > Deploy notifications**,
   keep the GitHub commit status enabled. Enable the pull request comment too if
   a visible preview link in the conversation is useful.
6. For untrusted fork pull requests, use Netlify's **Deploy without sensitive
   variables** policy. The demo build does not require repository secrets.

No `NETLIFY_AUTH_TOKEN`, deploy hook, or `pull_request_target` workflow is
required. The Netlify GitHub App reads the pull request and publishes the
preview without exposing a repository deployment credential to contributor
code.

## Expected Pull Request Result

After Netlify is connected, opening or updating a pull request should add a
status similar to:

```text
netlify/<site-name>/deploy-preview - Deploy Preview ready!
```

The preview URL follows this pattern:

```text
https://deploy-preview-<pr-number>--<site-name>.netlify.app
```

The URL remains stable for the lifetime of the pull request, while its contents
are rebuilt for each new commit. The existing GitHub Pages workflow remains the
canonical production deployment for `main`.

## Build Details

Netlify provides `DEPLOY_PRIME_URL` for each deploy context. `netlify.toml`
passes that value to Astro as `ASTRO_SITE` and forces a root `ASTRO_BASE`, so
canonical URLs, assets, and Starlight routes point at the current preview host.
The full `pnpm build` command builds both the package and the demo, which also
catches package compilation failures before a visual review.
