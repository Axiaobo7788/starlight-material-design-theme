import { fileURLToPath } from 'node:url';
import { generateSeedColorScheme, isHexSeed, type Md3SeedVariant } from './palette.js';

interface StarlightPluginContext {
	config: {
		customCss?: string[];
	};
	updateConfig(config: { customCss?: string[] }): void;
	addIntegration(integration: {
		name: string;
		hooks: {
			'astro:config:setup'(context: { updateConfig(config: { vite?: { plugins?: unknown[] } }): void }): void;
		};
	}): void;
	logger: {
		warn(message: string): void;
	};
}

export interface StarlightPlugin {
	name: string;
	hooks: {
		'config:setup'(context: StarlightPluginContext): void | Promise<void>;
	};
}

export interface Md3ThemeOptions {
	preset?: 'neutral' | 'playful' | 'highContrast';
	accent?: 'teal' | 'purple' | 'blue' | 'green' | 'orange' | 'rose';
	seed?: string;
	variant?: Md3SeedVariant;
	density?: 'compact' | 'comfortable';
	shape?: 'small' | 'medium' | 'large';
	tonalSurface?: boolean;
	motion?: boolean;
	experimentalComponents?: boolean;
}

interface ResolvedMd3ThemeOptions extends Required<Omit<Md3ThemeOptions, 'seed' | 'preset'>> {
	preset?: Md3ThemeOptions['preset'];
	seed?: string;
}

const OPTIONS_CSS_ID = 'virtual:starlight-theme-md3/options.css';
const RESOLVED_OPTIONS_CSS_ID = '\0' + OPTIONS_CSS_ID;

const accentPresets = {
	teal: null,
	purple: {
		light: {
			primary: '#6750a4',
			onPrimary: '#ffffff',
			primaryContainer: '#eaddff',
			onPrimaryContainer: '#21005d',
		},
		dark: {
			primary: '#d0bcff',
			onPrimary: '#381e72',
			primaryContainer: '#4f378b',
			onPrimaryContainer: '#eaddff',
		},
	},
	blue: {
		light: {
			primary: '#0061a4',
			onPrimary: '#ffffff',
			primaryContainer: '#d1e4ff',
			onPrimaryContainer: '#001d36',
		},
		dark: {
			primary: '#9ecaff',
			onPrimary: '#003258',
			primaryContainer: '#00497d',
			onPrimaryContainer: '#d1e4ff',
		},
	},
	green: {
		light: {
			primary: '#386a20',
			onPrimary: '#ffffff',
			primaryContainer: '#b8f397',
			onPrimaryContainer: '#042100',
		},
		dark: {
			primary: '#9dd67d',
			onPrimary: '#0c3900',
			primaryContainer: '#205107',
			onPrimaryContainer: '#b8f397',
		},
	},
	orange: {
		light: {
			primary: '#8f4d00',
			onPrimary: '#ffffff',
			primaryContainer: '#ffdcc2',
			onPrimaryContainer: '#2e1500',
		},
		dark: {
			primary: '#ffb77c',
			onPrimary: '#4d2600',
			primaryContainer: '#6d3900',
			onPrimaryContainer: '#ffdcc2',
		},
	},
	rose: {
		light: {
			primary: '#a7355f',
			onPrimary: '#ffffff',
			primaryContainer: '#ffd9e3',
			onPrimaryContainer: '#3f001d',
		},
		dark: {
			primary: '#ffb1c8',
			onPrimary: '#65002f',
			primaryContainer: '#861846',
			onPrimaryContainer: '#ffd9e3',
		},
	},
} as const;

const optionPresets = {
	neutral: {
		seed: '#607d8b',
		variant: 'content',
		shape: 'small',
	},
	playful: {
		seed: '#6750a4',
		variant: 'expressive',
		shape: 'large',
	},
	highContrast: {
		seed: '#005a54',
		variant: 'content',
		tonalSurface: false,
		shape: 'small',
	},
} as const satisfies Record<NonNullable<Md3ThemeOptions['preset']>, Partial<Md3ThemeOptions>>;

export default function md3Theme(options: Md3ThemeOptions = {}): StarlightPlugin {
	const resolved = resolveOptions(options);

	return {
		name: 'starlight-theme-md3',
		hooks: {
			'config:setup'({ config, updateConfig, addIntegration, logger }) {
				if (resolved.experimentalComponents) {
					logger.warn('experimentalComponents is reserved for a future release and is ignored.');
				}

				if (resolved.seed && !isHexSeed(resolved.seed)) {
					logger.warn(`Ignoring invalid seed color "${resolved.seed}". Expected #rgb or #rrggbb.`);
				}

				addIntegration({
					name: 'starlight-theme-md3/options',
					hooks: {
						'astro:config:setup'({ updateConfig }) {
							updateConfig({
								vite: {
									plugins: [optionsCssPlugin(resolved)],
								},
							});
						},
					},
				});

				updateConfig({
					customCss: [...(config.customCss ?? []), getThemeCssPath(), OPTIONS_CSS_ID],
				});
			},
		},
	};
}

function getThemeCssPath() {
	const isBuiltPackage = import.meta.url.endsWith('/dist/index.js');
	const cssUrl = new URL(isBuiltPackage ? './css/index.css' : './styles/md3/index.css', import.meta.url);
	return fileURLToPath(cssUrl);
}

function optionsCssPlugin(options: ResolvedMd3ThemeOptions) {
	return {
		name: 'starlight-theme-md3-options-css',
		resolveId(id: string) {
			return id === OPTIONS_CSS_ID ? RESOLVED_OPTIONS_CSS_ID : undefined;
		},
		load(id: string) {
			return id === RESOLVED_OPTIONS_CSS_ID ? generateOptionsCss(options) : undefined;
		},
	};
}

export function createMd3ThemeOptionsCss(options: Md3ThemeOptions = {}) {
	return generateOptionsCss(resolveOptions(options));
}

function resolveOptions(options: Md3ThemeOptions): ResolvedMd3ThemeOptions {
	const preset: Partial<Md3ThemeOptions> = options.preset ? optionPresets[options.preset] : {};

	return {
		preset: options.preset,
		accent: options.accent ?? preset.accent ?? 'teal',
		seed: options.seed ?? preset.seed,
		variant: options.variant ?? preset.variant ?? 'tonalSpot',
		density: options.density ?? preset.density ?? 'compact',
		shape: options.shape ?? preset.shape ?? 'medium',
		tonalSurface: options.tonalSurface ?? preset.tonalSurface ?? true,
		motion: options.motion ?? preset.motion ?? true,
		experimentalComponents: options.experimentalComponents ?? preset.experimentalComponents ?? false,
	};
}

function generateOptionsCss(options: ResolvedMd3ThemeOptions) {
	const colorCss = options.seed && isHexSeed(options.seed) ? generateSeedCss(options.seed, options.variant) : generateAccentCss(options.accent);
	const chunks = [colorCss, generateDensityCss(options.density), generateShapeCss(options.shape)];

	if (!options.tonalSurface) {
		chunks.push(`
@layer md3.tokens {
	:root {
		--md-sys-color-surface-container-low: var(--md-sys-color-surface);
		--md-sys-color-surface-container: var(--md-sys-color-surface);
		--md-sys-color-surface-container-high: var(--md-sys-color-surface);
	}
}`);
	}

	if (!options.motion) {
		chunks.push(`
@layer md3.tokens {
	:root {
		--md-sys-motion-duration-short: 0ms;
		--md-sys-motion-duration-medium: 0ms;
		--md-sys-motion-duration-long: 0ms;
	}
}`);
	}

	return chunks.filter(Boolean).join('\n');
}

function generateSeedCss(seed: string, variant: Md3SeedVariant) {
	const scheme = generateSeedColorScheme(seed, variant);

	return `
@layer md3.tokens {
	:root,
	::backdrop {
${formatCssTokens(scheme.dark)}
	}

	:root[data-theme='light'],
	[data-theme='light'] ::backdrop {
${formatCssTokens(scheme.light)}
	}
}`;
}

function generateAccentCss(accent: ResolvedMd3ThemeOptions['accent']) {
	const preset = accentPresets[accent];
	if (!preset) return '';

	return `
@layer md3.tokens {
	:root {
		--md-sys-color-primary: ${preset.dark.primary};
		--md-sys-color-on-primary: ${preset.dark.onPrimary};
		--md-sys-color-primary-container: ${preset.dark.primaryContainer};
		--md-sys-color-on-primary-container: ${preset.dark.onPrimaryContainer};
	}

	:root[data-theme='light'] {
		--md-sys-color-primary: ${preset.light.primary};
		--md-sys-color-on-primary: ${preset.light.onPrimary};
		--md-sys-color-primary-container: ${preset.light.primaryContainer};
		--md-sys-color-on-primary-container: ${preset.light.onPrimaryContainer};
	}
}`;
}

function formatCssTokens(tokens: Record<string, string>) {
	return Object.entries(tokens)
		.map(([name, value]) => `		--md-sys-color-${name}: ${value};`)
		.join('\n');
}

function generateDensityCss(density: ResolvedMd3ThemeOptions['density']) {
	if (density === 'compact') return '';

	return `
@layer md3.tokens {
	:root {
		--md3-density-nav-height: 4rem;
		--md3-density-header-control-height: 2.5rem;
		--md3-density-content-gap: 1.25rem;
		--md3-density-nav-item-min-height: 2.375rem;
		--md3-density-sidebar-gap: 0.25rem;
		--md3-density-card-padding: 1.25rem;
		--md3-density-control-height: 2.75rem;
	}
}`;
}

function generateShapeCss(shape: ResolvedMd3ThemeOptions['shape']) {
	if (shape === 'medium') return '';

	const scale =
		shape === 'small'
			? {
					extraSmall: '0.1875rem',
					small: '0.375rem',
					medium: '0.5rem',
					large: '0.75rem',
					extraLarge: '1rem',
				}
			: {
					extraSmall: '0.375rem',
					small: '0.625rem',
					medium: '1rem',
					large: '1.375rem',
					extraLarge: '1.875rem',
				};

	return `
@layer md3.tokens {
	:root {
		--md-sys-shape-corner-extra-small: ${scale.extraSmall};
		--md-sys-shape-corner-small: ${scale.small};
		--md-sys-shape-corner-medium: ${scale.medium};
		--md-sys-shape-corner-large: ${scale.large};
		--md-sys-shape-corner-extra-large: ${scale.extraLarge};
	}
}`;
}
