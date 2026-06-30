# create-starlight-theme-md3

Create a new Astro Starlight project with `starlight-theme-md3` already
configured.

```sh
pnpm create starlight-theme-md3 my-docs
```

Equivalent npm command:

```sh
npm create starlight-theme-md3@latest my-docs
```

The generated project does not pin a `packageManager`, so it can be installed
with npm, pnpm, Yarn, or Bun.

The current template targets Astro 7 and Starlight 0.41 or newer.

The creator follows the same command shape as Astro's official create flow:

```sh
pnpm create starlight-theme-md3 my-docs -- --install --git
pnpm create starlight-theme-md3 my-docs -- --no-install --no-git
pnpm create starlight-theme-md3 my-docs -- --yes
pnpm create starlight-theme-md3 my-docs -- --dry-run
```

The generated project keeps the normal Starlight structure and adds the theme as
a plugin:

```js
plugins: [md3Theme()]
```

The starter content is intentionally more than a blank page. The first run
includes a splash hero preview, capability cards, color/control/navigation
samples, and a welcome page with prose, tables, code, and mixed English/Chinese
text. These files are meant as a quick visual check for the theme and can be
deleted when real documentation takes over.
