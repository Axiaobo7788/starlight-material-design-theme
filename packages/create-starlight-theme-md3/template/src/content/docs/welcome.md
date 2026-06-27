---
title: Welcome
description: Start building with starlight-theme-md3.
---

`starlight-theme-md3` is already configured in `astro.config.mjs`.

The starter intentionally includes enough content to exercise the theme's
navigation, prose, code, table, and tonal surface styles. Keep what is useful and
delete the rest when your real documentation takes over.

## Customize The Theme

Change the `seed` option to recolor the whole site:

```js
md3Theme({
	seed: '#6750a4',
	variant: 'tonalSpot',
	});
```

The default starter uses a teal `tonalSpot` palette because it gives primary,
secondary, tertiary, and neutral surfaces clear separation.

## Component Check

Use this page as a quick visual check after changing theme options.

| Surface | What to inspect |
| --- | --- |
| Header | Search bar shape, theme menu, and icon spacing |
| Sidebar | Selected pill, section density, and drawer motion |
| Content | Headings, links, inline code, tables, and paragraphs |
| Search | Production search dialog and result surfaces |

> Calm surfaces and clear state are more important than decorative gradients.

中文段落用于检查字体比例、行高和中英文混排。`--md-sys-color-primary`
这类 token 出现在正文里时，不应该打断阅读节奏。

```css
:root {
	--md3-demo-note: "Override Material roles only when you need a site-specific tone.";
}
```

## Next Steps

- Edit content in `src/content/docs/`.
- Update navigation in `astro.config.mjs`.
- Run `pnpm dev` to start the local docs server.
- Run `pnpm build && pnpm preview` when you want to test the production search index.
