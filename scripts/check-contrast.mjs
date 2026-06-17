import { readFileSync } from 'node:fs';

const tokenCss = readFileSync(new URL('../src/styles/md3/tokens.css', import.meta.url), 'utf8');
const { createMd3ThemeOptionsCss } = await import('../dist/index.js');

const pairs = [
	['on-background', 'background'],
	['on-surface', 'surface'],
	['on-surface', 'surface-container-low'],
	['on-surface', 'surface-container'],
	['on-surface', 'surface-container-high'],
	['on-surface-variant', 'surface'],
	['on-primary', 'primary'],
	['on-primary-container', 'primary-container'],
	['on-secondary', 'secondary'],
	['on-secondary-container', 'secondary-container'],
	['on-tertiary', 'tertiary'],
	['on-tertiary-container', 'tertiary-container'],
	['on-error', 'error'],
	['on-error-container', 'error-container'],
];

const failures = [];
const audits = [
	{ label: 'base tokens', css: tokenCss },
	{ label: 'seed tonalSpot teal', css: createMd3ThemeOptionsCss({ seed: '#00a99d', variant: 'tonalSpot' }) },
	{ label: 'seed expressive purple', css: createMd3ThemeOptionsCss({ seed: '#6750a4', variant: 'expressive' }) },
	{ label: 'seed content orange', css: createMd3ThemeOptionsCss({ seed: '#d06b00', variant: 'content' }) },
	{ label: 'preset neutral', css: createMd3ThemeOptionsCss({ preset: 'neutral' }) },
	{ label: 'preset playful', css: createMd3ThemeOptionsCss({ preset: 'playful' }) },
	{ label: 'preset highContrast', css: createMd3ThemeOptionsCss({ preset: 'highContrast' }) },
];

for (const audit of audits) {
	console.log(`\n${audit.label}`);
	const themes = extractThemeTokens(audit.css);

	for (const [themeName, tokens] of Object.entries(themes)) {
		for (const [foreground, background] of pairs) {
			const fg = resolveToken(tokens[`--md-sys-color-${foreground}`], tokens);
			const bg = resolveToken(tokens[`--md-sys-color-${background}`], tokens);
			if (!fg || !bg) {
				failures.push(`${audit.label} ${themeName}: missing ${foreground}/${background}`);
				continue;
			}

			const ratio = contrastRatio(parseColor(fg), parseColor(bg));
			const status = ratio >= 4.5 ? 'pass' : 'fail';
			console.log(`${status.padEnd(4)} ${themeName.padEnd(5)} ${foreground.padEnd(22)} on ${background.padEnd(24)} ${ratio.toFixed(2)}`);

			if (ratio < 4.5) {
				failures.push(`${audit.label} ${themeName}: ${foreground} on ${background} is ${ratio.toFixed(2)}`);
			}
		}
	}
}

if (failures.length > 0) {
	console.error('\nContrast audit failed:');
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

function extractThemeTokens(css) {
	const themes = { dark: {}, light: {} };
	const blocks = css.matchAll(/([^{}]+)\{([^{}]+)\}/g);

	for (const [, selector, body] of blocks) {
		const target = selector.includes("data-theme='light'") ? themes.light : selector.includes(':root') ? themes.dark : null;
		if (!target) continue;

		for (const [, name, value] of body.matchAll(/(--md-sys-color-[\w-]+):\s*([^;]+);/g)) {
			target[name] = value.trim();
		}
	}

	if (Object.keys(themes.dark).length === 0 || Object.keys(themes.light).length === 0) {
		throw new Error('Unable to parse dark and light token blocks.');
	}

	return themes;
}

function parseColor(value) {
	if (value.startsWith('#')) return parseHex(value);

	const match = value.match(/hsl\(\s*([\d.]+)(?:deg)?[,\s]+([\d.]+)%[,\s]+([\d.]+)%\s*\)/);
	if (!match) throw new Error(`Unsupported color: ${value}`);

	const [, h, s, l] = match.map(Number);
	return hslToRgb(h, s / 100, l / 100);
}

function resolveToken(value, tokens, seen = new Set()) {
	if (!value?.startsWith('var(')) return value;

	const name = value.match(/var\((--md-sys-color-[\w-]+)\)/)?.[1];
	if (!name || seen.has(name)) return value;

	seen.add(name);
	return resolveToken(tokens[name], tokens, seen);
}

function parseHex(value) {
	const hex = value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : value;
	const rgb = Number.parseInt(hex.slice(1), 16);
	return [((rgb >> 16) & 255) / 255, ((rgb >> 8) & 255) / 255, (rgb & 255) / 255];
}

function hslToRgb(hue, saturation, lightness) {
	const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
	const segment = hue / 60;
	const x = chroma * (1 - Math.abs((segment % 2) - 1));
	const m = lightness - chroma / 2;
	const [r, g, b] =
		segment < 1
			? [chroma, x, 0]
			: segment < 2
				? [x, chroma, 0]
				: segment < 3
					? [0, chroma, x]
					: segment < 4
						? [0, x, chroma]
						: segment < 5
							? [x, 0, chroma]
							: [chroma, 0, x];

	return [r + m, g + m, b + m];
}

function contrastRatio(foreground, background) {
	const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
	const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
	return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance([r, g, b]) {
	const [sr, sg, sb] = [r, g, b].map((channel) =>
		channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
	);
	return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
}
