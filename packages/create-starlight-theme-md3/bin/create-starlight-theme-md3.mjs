#!/usr/bin/env node

import { constants, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const DEFAULT_PROJECT_NAME = 'starlight-md3-docs';
const textFileExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.mdx', '.mjs', '.svg', '.ts', '.txt', '.yml']);

const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');
const help = args.includes('--help') || args.includes('-h');
const targetArg = args.find((arg) => !arg.startsWith('-'));

if (help) {
	printHelp();
	process.exit(0);
}

const targetDirectory = await getTargetDirectory(targetArg);
const projectRoot = resolve(process.cwd(), targetDirectory);
const projectName = normalizePackageName(basename(projectRoot));
const packageManager = detectPackageManager();

if (existsSync(projectRoot) && !force && readdirSync(projectRoot).length > 0) {
	console.error(`Target directory is not empty: ${relative(process.cwd(), projectRoot)}`);
	console.error('Use --force to write into an existing directory.');
	process.exit(1);
}

mkdirSync(projectRoot, { recursive: true });

const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../template');
copyTemplate(templateRoot, projectRoot, {
	__PROJECT_NAME__: projectName,
	__PROJECT_TITLE__: titleFromPackageName(projectName),
});

console.log(`\nCreated ${relative(process.cwd(), projectRoot) || '.'}`);
console.log('\nNext steps:');
console.log(`  cd ${relative(process.cwd(), projectRoot) || '.'}`);
console.log(`  ${packageManager.install}`);
console.log(`  ${packageManager.dev}`);

async function getTargetDirectory(target) {
	if (target) return target;

	if (!process.stdin.isTTY) return DEFAULT_PROJECT_NAME;

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	const answer = await rl.question(`Project directory (${DEFAULT_PROJECT_NAME}): `);
	rl.close();
	return answer.trim() || DEFAULT_PROJECT_NAME;
}

function copyTemplate(source, destination, replacements) {
	for (const entry of readdirSync(source, { withFileTypes: true })) {
		const sourcePath = join(source, entry.name);
		const destinationName = entry.name === '_gitignore' ? '.gitignore' : entry.name;
		const destinationPath = join(destination, destinationName);

		if (entry.isDirectory()) {
			mkdirSync(destinationPath, { recursive: true });
			copyTemplate(sourcePath, destinationPath, replacements);
			continue;
		}

		if (!entry.isFile()) continue;

		mkdirSync(dirname(destinationPath), { recursive: true });

		if (isTextFile(sourcePath)) {
			let content = readFileSync(sourcePath, 'utf8');
			for (const [placeholder, value] of Object.entries(replacements)) {
				content = content.replaceAll(placeholder, value);
			}
			writeFileSync(destinationPath, content);
			continue;
		}

		copyFileSync(sourcePath, destinationPath, constants.COPYFILE_FICLONE);
	}
}

function isTextFile(path) {
	const dotIndex = path.lastIndexOf('.');
	return dotIndex === -1 || textFileExtensions.has(path.slice(dotIndex));
}

function normalizePackageName(name) {
	return name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '') || DEFAULT_PROJECT_NAME;
}

function titleFromPackageName(name) {
	return name
		.split(/[-_.]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function detectPackageManager() {
	const userAgent = process.env.npm_config_user_agent ?? '';
	const agent = userAgent.split('/')[0];

	if (agent === 'npm') {
		return { install: 'npm install', dev: 'npm run dev' };
	}
	if (agent === 'yarn') {
		return { install: 'yarn install', dev: 'yarn dev' };
	}
	if (agent === 'bun') {
		return { install: 'bun install', dev: 'bun run dev' };
	}

	return { install: 'pnpm install', dev: 'pnpm dev' };
}

function printHelp() {
	console.log(`create-starlight-theme-md3

Usage:
  pnpm create starlight-theme-md3 [directory]
  npm create starlight-theme-md3@latest [directory]

Options:
  -f, --force   Write into an existing non-empty directory.
  -h, --help    Show this help message.
`);
}
