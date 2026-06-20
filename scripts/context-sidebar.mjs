import { readFileSync } from 'node:fs';

const files = {
	brief: new URL('../docs/design/MATERIAL_BRIEF.md', import.meta.url),
	contract: new URL('../docs/design/TOKEN_CONTRACT.md', import.meta.url),
	checklist: new URL('../docs/design/VISUAL_CHECKLIST.md', import.meta.url),
	status: new URL('../docs/design/COMPONENT_STATUS.md', import.meta.url),
	componentTokens: new URL('../src/styles/md3/component-tokens.css', import.meta.url),
	layout: new URL('../src/styles/md3/layout.css', import.meta.url),
	density: new URL('../src/styles/md3/density.css', import.meta.url),
};

const screenshotPaths = [
	'tests/theme-screenshots.spec.ts-snapshots/theme-lab-desktop-light-chromium-linux.png',
	'tests/theme-screenshots.spec.ts-snapshots/theme-lab-desktop-dark-chromium-linux.png',
	'tests/theme-screenshots.spec.ts-snapshots/theme-lab-mobile-light-chromium-linux.png',
	'tests/theme-screenshots.spec.ts-snapshots/theme-lab-mobile-dark-chromium-linux.png',
	'tests/theme-screenshots.spec.ts-snapshots/mobile-drawer-light-chromium-linux.png',
	'tests/theme-screenshots.spec.ts-snapshots/mobile-drawer-dark-chromium-linux.png',
];

const componentTokens = read(files.componentTokens);
const layout = read(files.layout);
const density = read(files.density);

const output = [
	'# Gemini Context: Sidebar And TOC',
	'',
	'Use this as a short-context review packet. Review only the sidebar navigation and table of contents unless explicitly asked otherwise.',
	'',
	'## Requested Review',
	'',
	'You are a Material Design 3 visual reviewer. This project is a compact Astro Starlight docs/wiki theme, not a marketing landing page and not an Android app clone.',
	'',
	'Review the screenshots and CSS excerpts for MD3 alignment. Focus on color roles, surface hierarchy, navigation active state, state layers, shape, density, and dark mode.',
	'',
	'Do not write a full implementation. Produce patch specs for an engineer.',
	'',
	section('Material Brief', read(files.brief)),
	section('Token Contract', read(files.contract)),
	section('Visual Checklist', read(files.checklist)),
	section('Component Status', extractSection(read(files.status), '## Sidebar', '## Theme Menu')),
	section(
		'Screenshot Paths To Attach',
		screenshotPaths.map((path) => `- ${path}`).join('\n')
	),
	section(
		'Relevant Component Tokens',
		extractBetween(componentTokens, '\t\t--md3-comp-nav-item-container-color', '\t\t--md3-comp-search-field-container-color')
	),
	section(
		'Relevant Layout CSS: Sidebar',
		extractBetween(layout, '\t.sidebar-pane {', '\tbutton[data-open-modal] {')
	),
	section(
		'Relevant Layout CSS: Table Of Contents',
		extractBetween(layout, '\t.right-sidebar-panel {', '\t.pagination-links a {')
	),
	section(
		'Relevant Density Tokens',
		extractLines(density, ['--md3-density-sidebar', '--md3-density-nav-item', '--md3-density-nav-height'])
	),
	section(
		'Required Gemini Output Format',
		[
			'## Visual Review',
			'',
			'### 1. Main Issues',
			'- ...',
			'',
			'### 2. MD3 Alignment Problems',
			'- ...',
			'',
			'### 3. Recommended Token Changes',
			'- component/selector:',
			'- current issue:',
			'- recommended token:',
			'- expected visual result:',
			'',
			'### 4. Do Not Change',
			'- ...',
			'',
			'### 5. Patch Spec For Engineer',
			'- file:',
			'- selector:',
			'- change:',
			'- acceptance criteria:',
		].join('\n')
	),
].join('\n');

process.stdout.write(output);

function read(url) {
	return readFileSync(url, 'utf8');
}

function section(title, body) {
	return `## ${title}\n\n${body.trim()}\n`;
}

function extractBetween(content, startMarker, endMarker) {
	const start = content.indexOf(startMarker);
	if (start === -1) return '';
	const end = content.indexOf(endMarker, start + startMarker.length);
	const slice = content.slice(start, end === -1 ? undefined : end);
	return fenced(slice.trim());
}

function extractSection(content, startMarker, endMarker) {
	const start = content.indexOf(startMarker);
	if (start === -1) return '';
	const end = content.indexOf(endMarker, start + startMarker.length);
	return content.slice(start, end === -1 ? undefined : end).trim();
}

function extractLines(content, needles) {
	const lines = content
		.split('\n')
		.filter((line) => needles.some((needle) => line.includes(needle)))
		.join('\n');
	return fenced(lines);
}

function fenced(content) {
	return `\`\`\`css\n${content}\n\`\`\``;
}
