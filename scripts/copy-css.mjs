import { execFile } from 'node:child_process';
import { copyFile, cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

await mkdir(new URL('../dist/css/', import.meta.url), { recursive: true });
await mkdir(new URL('../dist/components/', import.meta.url), { recursive: true });
await cp(new URL('../src/styles/md3/', import.meta.url), new URL('../dist/css/', import.meta.url), {
	recursive: true,
});
await copyFile(
	new URL('../src/components/ThemeSelect.astro', import.meta.url),
	new URL('../dist/components/ThemeSelect.astro', import.meta.url)
);

await execFileAsync('pnpm', [
	'exec',
	'lightningcss',
	'--bundle',
	fileURLToPath(new URL('../src/styles/md3/index.css', import.meta.url)),
	'--output-file',
	fileURLToPath(new URL('../dist/css/index.css', import.meta.url)),
]);
