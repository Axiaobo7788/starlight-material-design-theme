import { execFile } from 'node:child_process';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const creatorUrl = new URL('../packages/create-starlight-theme-md3/', import.meta.url);
const workspaceUrl = new URL('../tmp/creator-consumption/', import.meta.url);
const generatedUrl = new URL('generated/', workspaceUrl);
const creatorPath = fileURLToPath(creatorUrl);
const workspacePath = fileURLToPath(workspaceUrl);
const rootPackage = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const creatorPackage = JSON.parse(await readFile(new URL('package.json', creatorUrl), 'utf8'));
const templatePackage = JSON.parse(await readFile(new URL('template/package.json', creatorUrl), 'utf8'));
const tarballName = `${creatorPackage.name}-${creatorPackage.version}.tgz`;
const tarballPath = fileURLToPath(new URL(tarballName, workspaceUrl));

assertEqual(templatePackage.dependencies['starlight-theme-md3'], `^${rootPackage.version}`, 'template theme range');
assertEqual(templatePackage.engines.node, creatorPackage.engines.node, 'creator/template Node engine');

await rm(workspaceUrl, { recursive: true, force: true });
await mkdir(workspaceUrl, { recursive: true });
await exec('pnpm', ['pack', '--pack-destination', workspacePath], creatorPath);
await exec(
	'npm',
	[
		'exec',
		'--yes',
		`--package=${tarballPath}`,
		'--',
		'create-starlight-theme-md3',
		'generated',
		'--no-install',
		'--no-git',
	],
	workspacePath
);

const generatedPackage = JSON.parse(await readFile(new URL('package.json', generatedUrl), 'utf8'));
assertEqual(generatedPackage.name, 'generated', 'generated package name');
assertEqual(generatedPackage.engines.node, templatePackage.engines.node, 'generated Node engine');
assertEqual(generatedPackage.dependencies.astro, templatePackage.dependencies.astro, 'generated Astro range');
assertEqual(
	generatedPackage.dependencies['@astrojs/starlight'],
	templatePackage.dependencies['@astrojs/starlight'],
	'generated Starlight range'
);
assertEqual(
	generatedPackage.dependencies['starlight-theme-md3'],
	templatePackage.dependencies['starlight-theme-md3'],
	'generated theme range'
);

await access(new URL('.gitignore', generatedUrl));
const generatedConfig = await readFile(new URL('astro.config.mjs', generatedUrl), 'utf8');
const generatedIndex = await readFile(new URL('src/content/docs/index.mdx', generatedUrl), 'utf8');
if (generatedConfig.includes('__PROJECT_') || generatedIndex.includes('__PROJECT_')) {
	throw new Error('Generated project still contains template placeholders.');
}

await writeFile(new URL('pnpm-workspace.yaml', generatedUrl), 'packages:\n  - .\n');
await exec('pnpm', ['install', '--no-frozen-lockfile'], fileURLToPath(generatedUrl));
await exec('pnpm', ['run', 'build'], fileURLToPath(generatedUrl));

async function exec(command, args, cwd) {
	const { stdout, stderr } = await execFileAsync(command, args, {
		cwd,
		env: { ...process.env, CI: '1', PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' },
		maxBuffer: 1024 * 1024 * 16,
	});

	if (stdout) process.stdout.write(stdout);
	if (stderr) process.stderr.write(stderr);
}

function assertEqual(actual, expected, label) {
	if (actual !== expected) {
		throw new Error(`${label} mismatch: expected ${expected}, received ${actual}`);
	}
}
