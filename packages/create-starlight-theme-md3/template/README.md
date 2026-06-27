# __PROJECT_TITLE__

This is an Astro Starlight project using `starlight-theme-md3`.

## Commands

| Command | Action |
| --- | --- |
| `npm install` / `pnpm install` | Install dependencies |
| `npm run dev` / `pnpm dev` | Start the local dev server |
| `npm run build` / `pnpm build` | Build the site |
| `npm run preview` / `pnpm preview` | Preview the built site |

## Theme

The theme is configured in `astro.config.mjs`:

```js
plugins: [md3Theme()]
```

The initial docs content is a small visual demo, not required project structure.
It shows the MD3 hero preview, cards, color roles, controls, navigation states,
tables, code, and mixed-language prose so you can inspect the theme immediately.
Delete or replace the demo pages as your real docs grow.
