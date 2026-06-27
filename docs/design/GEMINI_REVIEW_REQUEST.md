# Gemini MD3 Review Request

Use this file to run the required Gemini 3.1 Pro visual review when the CLI can open a local socket.

## Current Blocker In Codex Sandbox

Previous `agy` runs failed inside the Codex sandbox before they could contact Gemini:

```text
listen tcp 127.0.0.1:0: socket: operation not permitted
```

This is not a login failure. The CLI starts its local language server and the sandbox denies the socket.

On 2026-06-27, the interactive `agy` TUI opened with Gemini 3.1 Pro selected, but
the search-dialog review prompt only echoed in the terminal and did not return a
usable Gemini response during the Codex run.

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

## Search Dialog Follow-Up Prompt

Use this prompt when specifically reviewing the Pagefind search dialog:

```text
请作为 Material Design 3 / Material You 视觉评审，针对 Astro Starlight 的 Pagefind 搜索弹窗提出具体 CSS 方案，不要直接改文件，只给方案和注意事项。

上下文：starlight-theme-md3 是 Starlight plugin，不能依赖 @material/web runtime，主要用 CSS variables。当前移动端搜索弹窗中：

1. Pagefind 的 clear 按钮显示为 X，需要确认 40px touch target、24px icon、状态层和垂直居中是否符合 MD3。
2. 搜索结果列表已经从透明普通列表改成 tonal list groups：result group 使用 surface-container，nested rows 使用 surface-container-high，并移除了 4px left guide line。命中 mark 使用 soft primary-container mix。

请判断：

- clear/X 按钮尺寸、位置、图标绘制方式、状态层是否正确？
- search results 更应该像 MD3 list item、filled tonal card，还是搜索视图里的 flat list？
- title/excerpt/mark/nested result 的层级是否过重或过轻？
- 移动端和桌面端有没有必要差异化？
- 哪些东西不要做，避免变成网红卡片/过度动画？

请输出 Patch Spec 风格：selector、current issue、recommended token/style、expected result。
```
