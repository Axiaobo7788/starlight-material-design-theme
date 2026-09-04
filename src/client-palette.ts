import { CorePalette, Hct, Scheme, argbFromHex, hexFromArgb } from '@material/material-color-utilities';
import {
	generateSeedColorSchemeWithUtilities,
	type MaterialColorUtilities,
	type Md3SeedVariant,
} from './palette-core.js';

const utilities = {
	CorePalette,
	Hct,
	Scheme,
	argbFromHex,
	hexFromArgb,
} as unknown as MaterialColorUtilities;

export function generateClientSeedColorScheme(seed: string, variant: Md3SeedVariant = 'tonalSpot') {
	return generateSeedColorSchemeWithUtilities(utilities, seed, variant);
}
