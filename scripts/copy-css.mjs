import { cp, mkdir } from 'node:fs/promises';

await mkdir(new URL('../dist/css/', import.meta.url), { recursive: true });
await cp(new URL('../src/styles/md3/', import.meta.url), new URL('../dist/css/', import.meta.url), {
	recursive: true,
});
