# Gemini MD3 Review Request

Use this file to run the required Gemini 3.1 Pro visual review when the CLI can open a local socket.

## Current Blocker In Codex Sandbox

`agy` currently fails inside the Codex sandbox before it can contact Gemini:

```text
listen tcp 127.0.0.1:0: socket: operation not permitted
```

This is not a login failure. The CLI starts its local language server and the sandbox denies the socket.

## Review Goal

Re-validate the current `starlight-theme-md3` implementation against Material Design 3, focusing on UI and motion quality rather than generic animation polish.

## Screenshot Inputs

- `tests/theme-screenshots.spec.ts-snapshots/theme-menu-desktop-light-chromium-linux.png`
- `tests/theme-screenshots.spec.ts-snapshots/theme-menu-desktop-dark-chromium-linux.png`
- `tests/theme-screenshots.spec.ts-snapshots/theme-lab-desktop-light-chromium-linux.png`
- `tests/theme-screenshots.spec.ts-snapshots/plugin-options-desktop-light-chromium-linux.png`
- `tests/theme-screenshots.spec.ts-snapshots/home-desktop-light-chromium-linux.png`

## Code Inputs

- `src/components/ThemeSelect.astro`
- `src/styles/md3/layout.css`
- `src/styles/md3/components.css`
- `src/styles/md3/motion.css`
- `src/styles/md3/component-tokens.css`
- `src/index.ts`

## Current Implementation Summary

- Theme select trigger is an icon-only 48px top app bar action.
- Theme menu is a small anchored MD3 menu surface.
- Selected menu item uses a transparent row with primary-colored label/checkmark after Gemini review.
- Theme menu motion uses anchored top-right scale plus opacity after Gemini rejected `clip-path` as too rigid.
- Search field is a filled `surface-container-high` search bar with no border or shadow.
- Header/content hard dividers are reduced in favor of tonal surfaces.
- TOC active marker is a thin 4px by 16px vertical pill after Gemini rejected the dot as badge-like.
- Demo panels are moving from outlined cards toward filled tonal surfaces.

## Review Prompt

```text
You are acting as the Material Design 3 visual and motion reviewer for this local Astro Starlight theme project.

Do not edit files. Review the current implementation and the screenshots at these paths:

- tests/theme-screenshots.spec.ts-snapshots/theme-menu-desktop-light-chromium-linux.png
- tests/theme-screenshots.spec.ts-snapshots/theme-menu-desktop-dark-chromium-linux.png
- tests/theme-screenshots.spec.ts-snapshots/theme-lab-desktop-light-chromium-linux.png
- tests/theme-screenshots.spec.ts-snapshots/plugin-options-desktop-light-chromium-linux.png
- tests/theme-screenshots.spec.ts-snapshots/home-desktop-light-chromium-linux.png

Also inspect these files if needed:

- src/components/ThemeSelect.astro
- src/styles/md3/layout.css
- src/styles/md3/components.css
- src/styles/md3/motion.css
- src/styles/md3/component-tokens.css
- src/index.ts

Context:

The user thinks the dark/light theme menu animation still does not feel MD3 and may need an expand animation. Recent changes made ThemeSelect icon-only, menu selected item secondary-container, search field filled with no border/shadow, layout hard dividers reduced, TOC marker softened to a floating dot, and demo panels changed toward filled surfaces.

Please answer in this exact format:

## Verdict
## MD3 Problems
## Better MD3 Approach
## Patch Spec
## Do Not Change

Focus especially on:

1. Theme menu UI and motion.
2. Whether the search field reads as an MD3 filled search bar or still as a bordered pill.
3. Whether layout still relies too much on 1px dividers instead of tonal surfaces.
4. Whether the TOC active marker is too left-border-like.
5. Whether persistent selected state inside the menu should use `secondary-container` or a quieter state-layer/checkmark treatment.
6. Whether demo/card surfaces should be filled, outlined, or mixed.
```

## Suggested Command

Run from the project root in a normal terminal, not inside the restricted Codex sandbox:

```bash
agy --model "Gemini 3.1 Pro (High)" --print-timeout 10m -p "$(cat docs/design/GEMINI_REVIEW_REQUEST.md)"
```
