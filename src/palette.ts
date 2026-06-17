import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export type Md3SeedVariant = 'tonalSpot' | 'expressive' | 'content';

export interface Md3GeneratedColorScheme {
	dark: Record<string, string>;
	light: Record<string, string>;
}

interface MaterialScheme {
	primary: number;
	onPrimary: number;
	primaryContainer: number;
	onPrimaryContainer: number;
	secondary: number;
	onSecondary: number;
	secondaryContainer: number;
	onSecondaryContainer: number;
	tertiary: number;
	onTertiary: number;
	tertiaryContainer: number;
	onTertiaryContainer: number;
	error: number;
	onError: number;
	errorContainer: number;
	onErrorContainer: number;
	background: number;
	onBackground: number;
	surface: number;
	onSurface: number;
	surfaceVariant: number;
	onSurfaceVariant: number;
	outline: number;
	outlineVariant: number;
	shadow: number;
	scrim: number;
	inverseSurface: number;
	inverseOnSurface: number;
	inversePrimary: number;
}

interface CorePalette {
	n1: { tone(tone: number): number };
}

interface CorePaletteConstructor {
	of(argb: number): CorePalette;
	contentOf(argb: number): CorePalette;
	fromColors(colors: {
		primary: number;
		secondary?: number;
		tertiary?: number;
		neutral?: number;
		neutralVariant?: number;
	}): CorePalette;
}

interface Hct {
	hue: number;
	chroma: number;
	tone: number;
	toInt(): number;
}

interface HctConstructor {
	from(hue: number, chroma: number, tone: number): Hct;
	fromInt(argb: number): Hct;
}

interface SchemeConstructor {
	lightFromCorePalette(core: CorePalette): MaterialScheme;
	darkFromCorePalette(core: CorePalette): MaterialScheme;
}

const materialColorUtilities = await loadMaterialColorUtilities();

export function isHexSeed(value: string) {
	return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export function normalizeHexSeed(value: string) {
	const trimmed = value.trim();
	if (!isHexSeed(trimmed)) return null;
	if (trimmed.length === 7) return trimmed.toLowerCase();

	const [, r, g, b] = trimmed.toLowerCase();
	return `#${r}${r}${g}${g}${b}${b}`;
}

export function generateSeedColorScheme(seed: string, variant: Md3SeedVariant = 'tonalSpot'): Md3GeneratedColorScheme {
	const normalizedSeed = normalizeHexSeed(seed);
	if (!normalizedSeed) {
		throw new Error(`Invalid seed color "${seed}". Expected #rgb or #rrggbb.`);
	}

	const core = createCorePalette(materialColorUtilities.argbFromHex(normalizedSeed), variant);

	return {
		dark: formatScheme(materialColorUtilities.Scheme.darkFromCorePalette(core), core, 'dark'),
		light: formatScheme(materialColorUtilities.Scheme.lightFromCorePalette(core), core, 'light'),
	};
}

function createCorePalette(sourceArgb: number, variant: Md3SeedVariant) {
	if (variant === 'content') return materialColorUtilities.CorePalette.contentOf(sourceArgb);
	if (variant === 'expressive') return createExpressiveCorePalette(sourceArgb);
	return materialColorUtilities.CorePalette.of(sourceArgb);
}

function createExpressiveCorePalette(sourceArgb: number) {
	const source = materialColorUtilities.Hct.fromInt(sourceArgb);
	const primary = materialColorUtilities.Hct.from(source.hue, Math.max(48, source.chroma), 40).toInt();

	return materialColorUtilities.CorePalette.fromColors({
		primary,
		secondary: shiftedHct(source, 115, Math.max(24, source.chroma * 0.56), 40),
		tertiary: shiftedHct(source, 205, Math.max(32, source.chroma * 0.66), 40),
		neutral: materialColorUtilities.Hct.from(source.hue, 8, 50).toInt(),
		neutralVariant: materialColorUtilities.Hct.from(source.hue, 12, 50).toInt(),
	});
}

function shiftedHct(source: Hct, hueShift: number, chroma: number, tone: number) {
	return materialColorUtilities.Hct.from((source.hue + hueShift) % 360, chroma, tone).toInt();
}

function formatScheme(scheme: MaterialScheme, core: CorePalette, mode: 'dark' | 'light') {
	const neutral = core.n1;
	const surfaceTones =
		mode === 'dark'
			? {
					'surface-dim': 6,
					'surface-container-lowest': 4,
					'surface-container-low': 10,
					'surface-container': 12,
					'surface-container-high': 17,
					'surface-container-highest': 22,
				}
			: {
					'surface-dim': 87,
					'surface-container-lowest': 100,
					'surface-container-low': 96,
					'surface-container': 94,
					'surface-container-high': 92,
					'surface-container-highest': 90,
				};

	return {
		primary: hex(scheme.primary),
		'on-primary': hex(scheme.onPrimary),
		'primary-container': hex(scheme.primaryContainer),
		'on-primary-container': hex(scheme.onPrimaryContainer),
		secondary: hex(scheme.secondary),
		'on-secondary': hex(scheme.onSecondary),
		'secondary-container': hex(scheme.secondaryContainer),
		'on-secondary-container': hex(scheme.onSecondaryContainer),
		tertiary: hex(scheme.tertiary),
		'on-tertiary': hex(scheme.onTertiary),
		'tertiary-container': hex(scheme.tertiaryContainer),
		'on-tertiary-container': hex(scheme.onTertiaryContainer),
		error: hex(scheme.error),
		'on-error': hex(scheme.onError),
		'error-container': hex(scheme.errorContainer),
		'on-error-container': hex(scheme.onErrorContainer),
		background: hex(scheme.background),
		'on-background': hex(scheme.onBackground),
		surface: hex(scheme.surface),
		...mapTones(neutral, surfaceTones),
		'on-surface': hex(scheme.onSurface),
		'surface-variant': hex(scheme.surfaceVariant),
		'on-surface-variant': hex(scheme.onSurfaceVariant),
		outline: hex(scheme.outline),
		'outline-variant': hex(scheme.outlineVariant),
		'inverse-surface': hex(scheme.inverseSurface),
		'inverse-on-surface': hex(scheme.inverseOnSurface),
		'inverse-primary': hex(scheme.inversePrimary),
		scrim: hex(scheme.scrim),
	};
}

function mapTones(palette: CorePalette['n1'], tones: Record<string, number>) {
	return Object.fromEntries(Object.entries(tones).map(([name, tone]) => [name, hex(palette.tone(tone))]));
}

function hex(argb: number) {
	return materialColorUtilities.hexFromArgb(argb);
}

async function loadMaterialColorUtilities() {
	const require = createRequire(import.meta.url);
	const root = dirname(require.resolve('@material/material-color-utilities'));
	const [schemeModule, paletteModule, hctModule, stringUtilsModule] = await Promise.all([
		importMaterialModule<{ Scheme: SchemeConstructor }>(root, 'scheme/scheme.js'),
		importMaterialModule<{ CorePalette: CorePaletteConstructor }>(root, 'palettes/core_palette.js'),
		importMaterialModule<{ Hct: HctConstructor }>(root, 'hct/hct.js'),
		importMaterialModule<{ argbFromHex(hex: string): number; hexFromArgb(argb: number): string }>(root, 'utils/string_utils.js'),
	]);

	return {
		Scheme: schemeModule.Scheme,
		CorePalette: paletteModule.CorePalette,
		Hct: hctModule.Hct,
		argbFromHex: stringUtilsModule.argbFromHex,
		hexFromArgb: stringUtilsModule.hexFromArgb,
	};
}

function importMaterialModule<T>(root: string, path: string) {
	return import(/* @vite-ignore */ pathToFileURL(join(root, path)).href) as Promise<T>;
}
