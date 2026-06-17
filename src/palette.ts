export type Md3SeedVariant = 'tonalSpot' | 'expressive' | 'content';

export interface Md3GeneratedColorScheme {
	dark: Record<string, string>;
	light: Record<string, string>;
}

interface HslColor {
	h: number;
	s: number;
	l: number;
}

const variantSettings = {
	tonalSpot: {
		primarySat: 0.82,
		secondaryHue: 0,
		secondarySat: 0.36,
		tertiaryHue: 60,
		tertiarySat: 0.48,
		neutralSat: 0.1,
	},
	expressive: {
		primarySat: 0.9,
		secondaryHue: 115,
		secondarySat: 0.54,
		tertiaryHue: 205,
		tertiarySat: 0.62,
		neutralSat: 0.13,
	},
	content: {
		primarySat: 0.86,
		secondaryHue: 12,
		secondarySat: 0.48,
		tertiaryHue: 28,
		tertiarySat: 0.56,
		neutralSat: 0.12,
	},
} as const satisfies Record<Md3SeedVariant, Record<string, number>>;

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

	const source = rgbToHsl(hexToRgb(normalizedSeed));
	const settings = variantSettings[variant];
	const primaryHue = source.h;
	const secondaryHue = shiftHue(primaryHue, settings.secondaryHue);
	const tertiaryHue = shiftHue(primaryHue, settings.tertiaryHue);
	const primarySat = clamp(source.s * settings.primarySat, 0.48, 0.86);
	const secondarySat = clamp(source.s * settings.secondarySat, 0.26, 0.58);
	const tertiarySat = clamp(source.s * settings.tertiarySat, 0.34, 0.68);
	const neutralSat = clamp(source.s * settings.neutralSat, 0.06, 0.16);
	const neutralVariantSat = clamp(neutralSat * 1.45, 0.1, 0.22);

	return {
		dark: {
			primary: hsl(primaryHue, primarySat, 0.76),
			'on-primary': hsl(primaryHue, 0.72, 0.1),
			'primary-container': hsl(primaryHue, primarySat * 0.78, 0.24),
			'on-primary-container': hsl(primaryHue, 0.72, 0.9),
			secondary: hsl(secondaryHue, secondarySat, 0.78),
			'on-secondary': hsl(secondaryHue, 0.64, 0.12),
			'secondary-container': hsl(secondaryHue, secondarySat, 0.25),
			'on-secondary-container': hsl(secondaryHue, 0.68, 0.9),
			tertiary: hsl(tertiaryHue, tertiarySat, 0.78),
			'on-tertiary': hsl(tertiaryHue, 0.66, 0.12),
			'tertiary-container': hsl(tertiaryHue, tertiarySat, 0.25),
			'on-tertiary-container': hsl(tertiaryHue, 0.72, 0.91),
			error: 'hsl(4, 86%, 77%)',
			'on-error': 'hsl(3, 82%, 14%)',
			'error-container': 'hsl(3, 54%, 22%)',
			'on-error-container': 'hsl(4, 100%, 91%)',
			background: hsl(primaryHue, neutralSat, 0.09),
			'on-background': hsl(primaryHue, 0.13, 0.91),
			surface: hsl(primaryHue, neutralSat, 0.1),
			'surface-dim': hsl(primaryHue, neutralSat, 0.08),
			'surface-container-lowest': hsl(primaryHue, neutralSat, 0.07),
			'surface-container-low': hsl(primaryHue, neutralSat, 0.13),
			'surface-container': hsl(primaryHue, neutralSat, 0.16),
			'surface-container-high': hsl(primaryHue, neutralSat, 0.2),
			'surface-container-highest': hsl(primaryHue, neutralSat, 0.24),
			'on-surface': hsl(primaryHue, 0.13, 0.91),
			'surface-variant': hsl(primaryHue, neutralVariantSat, 0.28),
			'on-surface-variant': hsl(primaryHue, 0.12, 0.76),
			outline: hsl(primaryHue, 0.1, 0.46),
			'outline-variant': hsl(primaryHue, neutralVariantSat, 0.28),
			'inverse-surface': hsl(primaryHue, 0.13, 0.91),
			'inverse-on-surface': hsl(primaryHue, neutralSat, 0.1),
			'inverse-primary': hsl(primaryHue, primarySat, 0.3),
			scrim: hsl(primaryHue, 0.28, 0.02),
		},
		light: {
			primary: hsl(primaryHue, primarySat, 0.27),
			'on-primary': 'hsl(0, 0%, 100%)',
			'primary-container': hsl(primaryHue, primarySat, 0.88),
			'on-primary-container': hsl(primaryHue, 0.82, 0.1),
			secondary: hsl(secondaryHue, secondarySat, 0.34),
			'on-secondary': 'hsl(0, 0%, 100%)',
			'secondary-container': hsl(secondaryHue, secondarySat, 0.86),
			'on-secondary-container': hsl(secondaryHue, 0.62, 0.12),
			tertiary: hsl(tertiaryHue, tertiarySat, 0.3),
			'on-tertiary': 'hsl(0, 0%, 100%)',
			'tertiary-container': hsl(tertiaryHue, tertiarySat, 0.87),
			'on-tertiary-container': hsl(tertiaryHue, 0.66, 0.12),
			error: 'hsl(3, 72%, 42%)',
			'on-error': 'hsl(0, 0%, 100%)',
			'error-container': 'hsl(6, 100%, 92%)',
			'on-error-container': 'hsl(2, 88%, 12%)',
			background: hsl(primaryHue, neutralSat, 0.965),
			'on-background': hsl(primaryHue, 0.13, 0.13),
			surface: hsl(primaryHue, neutralSat, 0.965),
			'surface-dim': hsl(primaryHue, neutralSat, 0.86),
			'surface-container-lowest': 'hsl(0, 0%, 100%)',
			'surface-container-low': hsl(primaryHue, neutralSat, 0.93),
			'surface-container': hsl(primaryHue, neutralSat, 0.9),
			'surface-container-high': hsl(primaryHue, neutralSat, 0.86),
			'surface-container-highest': hsl(primaryHue, neutralSat, 0.82),
			'on-surface': hsl(primaryHue, 0.13, 0.13),
			'surface-variant': hsl(primaryHue, neutralVariantSat, 0.78),
			'on-surface-variant': hsl(primaryHue, 0.1, 0.31),
			outline: hsl(primaryHue, 0.08, 0.46),
			'outline-variant': hsl(primaryHue, neutralVariantSat, 0.78),
			'inverse-surface': hsl(primaryHue, 0.13, 0.13),
			'inverse-on-surface': hsl(primaryHue, neutralSat, 0.965),
			'inverse-primary': hsl(primaryHue, primarySat, 0.76),
			scrim: hsl(primaryHue, 0.13, 0.13),
		},
	};
}

function hexToRgb(hex: string) {
	const value = Number.parseInt(hex.slice(1), 16);
	return {
		r: (value >> 16) & 255,
		g: (value >> 8) & 255,
		b: value & 255,
	};
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): HslColor {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const delta = max - min;
	const lightness = (max + min) / 2;

	if (delta === 0) {
		return { h: 0, s: 0, l: lightness };
	}

	const saturation = delta / (1 - Math.abs(2 * lightness - 1));
	const hue =
		max === red
			? 60 * (((green - blue) / delta) % 6)
			: max === green
				? 60 * ((blue - red) / delta + 2)
				: 60 * ((red - green) / delta + 4);

	return { h: Math.round((hue + 360) % 360), s: saturation, l: lightness };
}

function hsl(hue: number, saturation: number, lightness: number) {
	return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
}

function shiftHue(hue: number, amount: number) {
	return (hue + amount + 360) % 360;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
