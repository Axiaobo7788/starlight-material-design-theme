# Visual Checklist

Use this checklist for Gemini reviews and human review.

## Review Input

Provide Gemini:

1. This checklist.
2. `MATERIAL_BRIEF.md`.
3. `TOKEN_CONTRACT.md`.
4. Relevant CSS slice.
5. Light and dark screenshots.
6. The exact component or module being reviewed.

## Review Questions

### MD3 Color Roles

- Are surface roles being used instead of arbitrary colors?
- Are active states using the right container and label roles?
- Is primary overused?
- Does dark mode avoid pure black and neon contrast?

### State Layers

- Are hover/focus/pressed states subtle?
- Are state layers based on the content color of the component?
- Is focus visible without becoming decorative?
- Does pressed feedback feel like Material state, not a color flash?

### Surface Hierarchy

- Can the user distinguish page, chrome, panel, menu, code, and card surfaces?
- Is hierarchy carried by tonal surface before shadow?
- Are borders quiet and role-based?

### Shape

- Are full pills used only where component anatomy supports them?
- Are menus and text-field-like controls too rounded?
- Are cards/dialogs shaped consistently?

### Typography

- Is text hierarchy clear without excessive weight?
- Are labels using label scale?
- Are headings readable but not marketing-heavy?
- Is Chinese paragraph rhythm comfortable?

### Density

- Does the docs/wiki view remain compact?
- Are touch targets still usable?
- Is spacing comfortable without becoming landing-page spacing?

### Motion

- Is motion functional?
- Are there page-entry, hover-lift, bounce, or spectacle effects?
- Does reduced motion remove interactive animation?

## Gemini Output Format

Gemini should use this exact format:

```md
## Visual Review

### 1. Main Issues
- ...

### 2. MD3 Alignment Problems
- ...

### 3. Recommended Token Changes
- component/selector:
- current issue:
- recommended token:
- expected visual result:

### 4. Do Not Change
- ...

### 5. Patch Spec For Engineer
- file:
- selector:
- change:
- acceptance criteria:
```

## Engineering Acceptance Criteria

Every accepted patch should:

- keep `plugins: [md3Theme()]`
- avoid new runtime dependencies
- avoid Tailwind in the core theme
- keep docs density compact
- pass `pnpm run typecheck`
- pass `pnpm run check:contrast`
- pass `pnpm run build`
- update screenshot baselines only when intentional visual changes occur
