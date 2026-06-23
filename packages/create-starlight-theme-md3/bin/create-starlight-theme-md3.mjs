#!/usr/bin/env node

import { constants, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DEFAULT_PROJECT_NAME = 'starlight-md3-docs';
const textFileExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.mdx', '.mjs', '.svg', '.ts', '.txt', '.yml']);

const color = createColors();
const args = process.argv.slice(2);
const flags = parseFlags(args);

if (flags.help) {
	printHelp();
	process.exit(0);
}

try {
	await main();
} catch (error) {
	console.error(`\n${color.error('error')} ${error.message}`);
	process.exit(1);
}

async function main() {
	printIntro();

	const packageManager = detectPackageManager();
	const targetDirectory = await getTargetDirectory(flags.target);
	const projectRoot = resolve(process.cwd(), targetDirectory);
	const projectName = normalizePackageName(basename(projectRoot));
	const relativeProjectRoot = relative(process.cwd(), projectRoot) || '.';
	const shouldInstall = await resolveBooleanOption({
		value: flags.install,
		defaultValue: true,
		question: `Install dependencies with ${packageManager.name}?`,
	});
	const shouldInitGit = await resolveBooleanOption({
		value: flags.git,
		defaultValue: true,
		question: 'Initialize a git repository?',
	});

	if (existsSync(projectRoot) && !flags.force && readdirSync(projectRoot).length > 0) {
		console.error(`${color.error('error')} Target directory is not empty: ${relativeProjectRoot}`);
		console.error(`      Use ${color.code('--force')} to write into an existing directory.`);
		process.exit(1);
	}

	if (flags.dryRun) {
		console.log('Dry run: no files will be written.');
		printSummary({
			'Project directory': relativeProjectRoot,
			'Package name': projectName,
			'Install dependencies': shouldInstall ? packageManager.install : 'no',
			'Initialize git': shouldInitGit ? 'yes' : 'no',
		});
		return;
	}

	mkdirSync(projectRoot, { recursive: true });

	const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../template');
	await runStep('Scaffolding project files', async () => copyTemplate(templateRoot, projectRoot, {
		__PROJECT_NAME__: projectName,
		__PROJECT_TITLE__: titleFromPackageName(projectName),
	}));

	printSummary({
		'Project directory': relativeProjectRoot,
		'Package name': projectName,
		Theme: 'starlight-theme-md3',
	});

	if (shouldInstall) {
		await runStep(`Installing dependencies with ${packageManager.name}`, () => runCommand(packageManager.install, projectRoot));
	}

	if (shouldInitGit) {
		await runStep('Initializing git repository', () => runCommand('git init --initial-branch main', projectRoot), { optional: true });
	}

	printDone(relativeProjectRoot, packageManager, { installed: shouldInstall });
}

function printIntro() {
	console.log('');
	console.log(` ${color.brand('◆')}  ${color.bold('starlight-theme-md3')}`);
	console.log(`    ${color.dim('Create a Starlight docs site with Material Design 3 styling.')}`);
	console.log('');
}

function printSummary(entries) {
	console.log('');
	for (const [label, value] of Object.entries(entries)) {
		console.log(`${color.dim('│')} ${color.accent(label.padEnd(22))} ${value}`);
	}
}

function printDone(projectPath, manager, { installed }) {
	console.log('');
	console.log(`${color.success('✔')} ${color.bold('Project ready')}`);
	console.log('');
	console.log(`${color.dim('next')} ${color.code(`cd ${projectPath}`)}`);
	if (!installed) {
		console.log(`${color.dim('next')} ${color.code(manager.install)}`);
	}
	console.log(`${color.dim('next')} ${color.code(manager.dev)}`);
	console.log('');
	if (installed) {
		console.log(color.dim('Open the printed local URL after the dev server starts.'));
	}
}

async function getTargetDirectory(target) {
	if (target) return target;

	if (!process.stdin.isTTY) return DEFAULT_PROJECT_NAME;

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	const answer = await rl.question(`${color.prompt('?')} Project directory ${color.dim(`(${DEFAULT_PROJECT_NAME})`)} `);
	rl.close();
	return answer.trim() || DEFAULT_PROJECT_NAME;
}

async function resolveBooleanOption({ value, defaultValue, question }) {
	if (typeof value === 'boolean') return value;
	if (flags.yes) return defaultValue;
	if (flags.no) return false;
	if (!process.stdin.isTTY) return false;

	const suffix = defaultValue ? 'Y/n' : 'y/N';
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	const answer = await rl.question(`${color.prompt('?')} ${question} ${color.dim(`(${suffix})`)} `);
	rl.close();
	const normalized = answer.trim().toLowerCase();
	if (!normalized) return defaultValue;
	return normalized === 'y' || normalized === 'yes';
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

async function runStep(label, task, options = {}) {
	const spinner = createSpinner(label);
	spinner.start();
	try {
		await task();
		spinner.succeed();
	} catch (error) {
		spinner.fail();
		if (options.optional) {
			console.log(color.dim(`  ${error.message}`));
			return;
		}
		throw error;
	}
}

function runCommand(command, cwd) {
	const [binary, ...args] = command.split(' ');
	return new Promise((resolvePromise, reject) => {
		const child = spawn(binary, args, {
			cwd,
			shell: process.platform === 'win32',
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let output = '';
		child.stdout.on('data', (chunk) => {
			output += chunk;
		});
		child.stderr.on('data', (chunk) => {
			output += chunk;
		});
		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) {
				resolvePromise();
				return;
			}
			reject(new Error(`Command failed: ${command}\n${output.trim()}`));
		});
	});
}

function createSpinner(label) {
	const frames = ['◐', '◓', '◑', '◒'];
	let index = 0;
	let timer;
	const enabled = process.stdout.isTTY && !process.env.CI;
	const render = (symbol, text) => {
		process.stdout.write(`\r${symbol} ${text}`);
	};

	return {
		start() {
			if (!enabled) {
				console.log(`${color.dim('•')} ${label}`);
				return;
			}
			render(color.brand(frames[index]), label);
			timer = setInterval(() => {
				index = (index + 1) % frames.length;
				render(color.brand(frames[index]), label);
			}, 80);
		},
		succeed() {
			if (timer) clearInterval(timer);
			if (enabled) {
				process.stdout.write(`\r${color.success('✔')} ${label}\n`);
			}
		},
		fail() {
			if (timer) clearInterval(timer);
			if (enabled) {
				process.stdout.write(`\r${color.error('✖')} ${label}\n`);
			}
		},
	};
}

function parseFlags(argv) {
	const parsed = {
		dryRun: false,
		force: false,
		git: undefined,
		help: false,
		install: undefined,
		no: false,
		target: undefined,
		yes: false,
	};

	for (let index = 0; index < argv.length; index++) {
		const arg = argv[index];
		switch (arg) {
			case '--':
				break;
			case '--dry-run':
				parsed.dryRun = true;
				break;
			case '--force':
			case '-f':
				parsed.force = true;
				break;
			case '--git':
				parsed.git = true;
				break;
			case '--no-git':
				parsed.git = false;
				break;
			case '--help':
			case '-h':
				parsed.help = true;
				break;
			case '--install':
				parsed.install = true;
				break;
			case '--no-install':
				parsed.install = false;
				break;
			case '--yes':
			case '-y':
				parsed.yes = true;
				break;
			case '--no':
			case '-n':
				parsed.no = true;
				break;
			default:
				if (arg.startsWith('--')) {
					console.error(`${color.error('error')} Unknown option: ${arg}`);
					process.exit(1);
				}
				if (!parsed.target) {
					parsed.target = arg;
					break;
				}
				console.error(`${color.error('error')} Unexpected argument: ${arg}`);
				process.exit(1);
		}
	}

	return parsed;
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
		return { name: 'npm', install: 'npm install', dev: 'npm run dev' };
	}
	if (agent === 'yarn') {
		return { name: 'yarn', install: 'yarn install', dev: 'yarn dev' };
	}
	if (agent === 'bun') {
		return { name: 'bun', install: 'bun install', dev: 'bun run dev' };
	}

	return { name: 'pnpm', install: 'pnpm install', dev: 'pnpm dev' };
}

function createColors() {
	const enabled = process.stdout.isTTY && !process.env.NO_COLOR;
	const wrap = (code, value) => (enabled ? `\u001B[${code}m${value}\u001B[0m` : value);
	return {
		accent: (value) => wrap('36', value),
		bold: (value) => wrap('1', value),
		brand: (value) => wrap('96', value),
		code: (value) => wrap('36', value),
		dim: (value) => wrap('2', value),
		error: (value) => wrap('31', value),
		prompt: (value) => wrap('35', value),
		success: (value) => wrap('32', value),
	};
}

function printHelp() {
	console.log(`${color.bold('create-starlight-theme-md3')}

Usage:
  pnpm create starlight-theme-md3 [directory]
  npm create starlight-theme-md3@latest [directory]

Options:
  --install / --no-install  Install dependencies (or not).
      --git / --no-git      Initialize git repo (or not).
          --yes (-y)        Skip prompts by accepting defaults.
           --no (-n)        Skip prompts by declining defaults.
           --dry-run        Walk through steps without executing.
      --force (-f)          Write into an existing non-empty directory.
       --help (-h)          Show this help message.
`);
}
