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
