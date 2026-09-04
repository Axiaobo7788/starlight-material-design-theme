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

interface Hct {
	hue: number;
	chroma: number;
	tone: number;
	toInt(): number;
}

export interface MaterialColorUtilities {
	CorePalette: {
		of(argb: number): CorePalette;
		contentOf(argb: number): CorePalette;
		fromColors(colors: {
			primary: number;
			secondary?: number;
			tertiary?: number;
			neutral?: number;
			neutralVariant?: number;
		}): CorePalette;
	};
	Hct: {
		from(hue: number, chroma: number, tone: number): Hct;
		fromInt(argb: number): Hct;
	};
	Scheme: {
		lightFromCorePalette(core: CorePalette): MaterialScheme;
		darkFromCorePalette(core: CorePalette): MaterialScheme;
	};
	argbFromHex(hex: string): number;
	hexFromArgb(argb: number): string;
}

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

export function generateSeedColorSchemeWithUtilities(
	utilities: MaterialColorUtilities,
	seed: string,
	variant: Md3SeedVariant = 'tonalSpot',
): Md3GeneratedColorScheme {
	const normalizedSeed = normalizeHexSeed(seed);
	if (!normalizedSeed) throw new Error(`Invalid seed color "${seed}". Expected #rgb or #rrggbb.`);

	const core = createCorePalette(utilities, utilities.argbFromHex(normalizedSeed), variant);
	return {
		dark: formatScheme(utilities, utilities.Scheme.darkFromCorePalette(core), core, 'dark'),
		light: formatScheme(utilities, utilities.Scheme.lightFromCorePalette(core), core, 'light'),
	};
}

function createCorePalette(utilities: MaterialColorUtilities, sourceArgb: number, variant: Md3SeedVariant) {
	if (variant === 'content') return utilities.CorePalette.contentOf(sourceArgb);
	if (variant === 'expressive') return createExpressiveCorePalette(utilities, sourceArgb);
	return utilities.CorePalette.of(sourceArgb);
}

function createExpressiveCorePalette(utilities: MaterialColorUtilities, sourceArgb: number) {
	const source = utilities.Hct.fromInt(sourceArgb);
	const primary = utilities.Hct.from(source.hue, Math.max(48, source.chroma), 40).toInt();

	return utilities.CorePalette.fromColors({
		primary,
		secondary: shiftedHct(utilities, source, 115, Math.max(24, source.chroma * 0.56), 40),
		tertiary: shiftedHct(utilities, source, 205, Math.max(32, source.chroma * 0.66), 40),
		neutral: utilities.Hct.from(source.hue, 8, 50).toInt(),
		neutralVariant: utilities.Hct.from(source.hue, 12, 50).toInt(),
	});
}

function shiftedHct(utilities: MaterialColorUtilities, source: Hct, hueShift: number, chroma: number, tone: number) {
	return utilities.Hct.from((source.hue + hueShift) % 360, chroma, tone).toInt();
}

function formatScheme(
	utilities: MaterialColorUtilities,
	scheme: MaterialScheme,
	core: CorePalette,
	mode: 'dark' | 'light',
) {
	const neutral = core.n1;
	const hex = (argb: number) => utilities.hexFromArgb(argb);
	const surfaceBase = mode === 'dark' ? hex(neutral.tone(6)) : hex(scheme.surface);
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
		background: mode === 'dark' ? surfaceBase : hex(scheme.background),
		'on-background': hex(scheme.onBackground),
		surface: surfaceBase,
		...Object.fromEntries(Object.entries(surfaceTones).map(([name, tone]) => [name, hex(neutral.tone(tone))])),
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
