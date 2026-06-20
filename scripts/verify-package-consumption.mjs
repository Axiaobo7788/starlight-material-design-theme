import { execFile } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const rootUrl = new URL('../', import.meta.url);
const fixtureUrl = new URL('../fixtures/package-consumption/', import.meta.url);
const workspaceUrl = new URL('../tmp/package-consumption/', import.meta.url);
const workspacePath = fileURLToPath(workspaceUrl);
const rootPath = fileURLToPath(rootUrl);
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const tarballName = `${packageJson.name}-${packageJson.version}.tgz`;

await rm(workspaceUrl, { recursive: true, force: true });
await mkdir(workspaceUrl, { recursive: true });
await cp(fixtureUrl, workspaceUrl, { recursive: true });

await exec('pnpm', ['run', 'build:theme'], rootPath);
await exec('pnpm', ['pack', '--pack-destination', workspacePath], rootPath);

await writeFile(
	new URL('package.json', workspaceUrl),
	JSON.stringify(
		{
			private: true,
			type: 'module',
			scripts: {
				build: 'astro build',
				'check:exports': 'node scripts/resolve-exports.mjs',
			},
			dependencies: {
				'@astrojs/starlight': packageJson.devDependencies['@astrojs/starlight'],
				astro: packageJson.devDependencies.astro,
				'starlight-theme-md3': `file:./${tarballName}`,
			},
			devDependencies: {
				typescript: packageJson.devDependencies.typescript,
			},
		},
		null,
		2
	)
);

await writeFile(new URL('pnpm-workspace.yaml', workspaceUrl), 'packages:\n  - .\n');
await exec('pnpm', ['install', '--no-frozen-lockfile'], workspacePath);
await exec('pnpm', ['run', 'check:exports'], workspacePath);
await exec('pnpm', ['run', 'build'], workspacePath);

async function exec(command, args, cwd) {
	const { stdout, stderr } = await execFileAsync(command, args, {
		cwd,
		env: { ...process.env, CI: '1', PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' },
		maxBuffer: 1024 * 1024 * 16,
	});

	if (stdout) process.stdout.write(stdout);
	if (stderr) process.stderr.write(stderr);
}
