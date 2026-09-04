import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
	generateSeedColorSchemeWithUtilities,
	isHexSeed,
	normalizeHexSeed,
	type MaterialColorUtilities,
	type Md3GeneratedColorScheme,
	type Md3SeedVariant,
} from './palette-core.js';

export { isHexSeed, normalizeHexSeed };
export type { Md3GeneratedColorScheme, Md3SeedVariant };

const materialColorUtilities = await loadMaterialColorUtilities();

export function generateSeedColorScheme(seed: string, variant: Md3SeedVariant = 'tonalSpot'): Md3GeneratedColorScheme {
	return generateSeedColorSchemeWithUtilities(materialColorUtilities, seed, variant);
}

async function loadMaterialColorUtilities(): Promise<MaterialColorUtilities> {
	const require = createRequire(import.meta.url);
	const root = dirname(require.resolve('@material/material-color-utilities'));
	const [schemeModule, paletteModule, hctModule, stringUtilsModule] = await Promise.all([
		importMaterialModule<Pick<MaterialColorUtilities, 'Scheme'>>(root, 'scheme/scheme.js'),
		importMaterialModule<Pick<MaterialColorUtilities, 'CorePalette'>>(root, 'palettes/core_palette.js'),
		importMaterialModule<Pick<MaterialColorUtilities, 'Hct'>>(root, 'hct/hct.js'),
		importMaterialModule<Pick<MaterialColorUtilities, 'argbFromHex' | 'hexFromArgb'>>(root, 'utils/string_utils.js'),
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
