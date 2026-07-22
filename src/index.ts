import { fileURLToPath } from 'node:url';
import type { StarlightPlugin } from '@astrojs/starlight/types';
import { generateSeedColorScheme, isHexSeed, type Md3SeedVariant } from './palette.js';

export interface Md3ThemeOptions {
	preset?: 'neutral' | 'playful' | 'highContrast';
	accent?: 'teal' | 'purple' | 'blue' | 'green' | 'orange' | 'rose';
	seed?: string;
	variant?: Md3SeedVariant;
	density?: 'compact' | 'comfortable';
	shape?: 'small' | 'medium' | 'large';
	contrast?: 'standard' | 'medium' | 'high';
	tonalSurface?: boolean;
	motion?: boolean;
	experimentalComponents?: boolean;
}

interface ResolvedMd3ThemeOptions extends Required<Omit<Md3ThemeOptions, 'seed' | 'preset'>> {
	preset?: Md3ThemeOptions['preset'];
	seed?: string;
}

const accentPresets = {
	teal: {
		light: {
			primary: '#006a62',
			onPrimary: '#ffffff',
			primaryContainer: '#72f7e9',
			onPrimaryContainer: '#00201d',
		},
		dark: {
			primary: '#51dbcd',
			onPrimary: '#003733',
			primaryContainer: '#00504a',
			onPrimaryContainer: '#72f7e9',
		},
	},
	purple: {
		light: {
			primary: '#6750a4',
			onPrimary: '#ffffff',
			primaryContainer: '#e9ddff',
			onPrimaryContainer: '#22005d',
		},
		dark: {
			primary: '#cfbcff',
			onPrimary: '#381e72',
			primaryContainer: '#4f378a',
			onPrimaryContainer: '#e9ddff',
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
		contrast: 'high',
	},
} as const satisfies Record<NonNullable<Md3ThemeOptions['preset']>, Partial<Md3ThemeOptions>>;

export default function md3Theme(options: Md3ThemeOptions = {}): StarlightPlugin {
	const resolved = resolveOptions(options);

	return {
		name: 'starlight-theme-md3',
		hooks: {
			'config:setup'({ config, updateConfig, logger }) {
				if (resolved.experimentalComponents) {
					logger.warn('experimentalComponents is reserved for a future release and is ignored.');
				}

				if (resolved.seed && !isHexSeed(resolved.seed)) {
					logger.warn(`Ignoring invalid seed color "${resolved.seed}". Expected #rgb or #rrggbb.`);
				}

				updateConfig({
					customCss: [...(config.customCss ?? []), getThemeCssPath()],
					components: {
						...(config.components ?? {}),
						ThemeSelect: config.components?.ThemeSelect ?? getThemeSelectPath(),
					},
					head: [
						...(config.head ?? []),
						{
							tag: 'style',
							attrs: { 'data-starlight-theme-md3': 'options' },
							content: generateOptionsCss(resolved, { layered: false }),
						},
						...(resolved.motion
							? [
									{
										tag: 'script' as const,
										attrs: { 'data-starlight-theme-md3': 'route-bootstrap' },
										content: getRouteTransitionBootstrapScript(),
									},
									{
										tag: 'script' as const,
										attrs: { 'data-starlight-theme-md3': 'motion' },
										content: getMotionRuntimeScript(),
									},
								]
							: []),
					],
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

function getThemeSelectPath() {
	const componentUrl = new URL('./components/ThemeSelect.astro', import.meta.url);
	return fileURLToPath(componentUrl);
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
		contrast: options.contrast ?? preset.contrast ?? 'standard',
		tonalSurface: options.tonalSurface ?? preset.tonalSurface ?? true,
		motion: options.motion ?? preset.motion ?? true,
		experimentalComponents: options.experimentalComponents ?? preset.experimentalComponents ?? false,
	};
}

function generateOptionsCss(options: ResolvedMd3ThemeOptions, cssOptions: { layered?: boolean } = {}) {
	const layered = cssOptions.layered ?? true;
	const colorCss =
		options.seed && isHexSeed(options.seed)
			? generateSeedCss(options.seed, options.variant, layered)
			: generateAccentCss(options.accent, layered);
	const chunks = [
		colorCss,
		generateDensityCss(options.density, layered),
		generateShapeCss(options.shape, layered),
		generateContrastCss(options.contrast, layered),
	];

	if (!options.tonalSurface) {
		chunks.push(
			wrapTokenCss(
				`
	:root {
		--md-sys-color-surface-container-lowest: var(--md-sys-color-surface);
		--md-sys-color-surface-container-low: var(--md-sys-color-surface);
		--md-sys-color-surface-container: var(--md-sys-color-surface);
		--md-sys-color-surface-container-high: var(--md-sys-color-surface);
		--md-sys-color-surface-container-highest: var(--md-sys-color-surface);
	}
`,
				layered,
			),
		);
	}

	if (!options.motion) {
		chunks.push(
			wrapTokenCss(
				`
	:root {
		--md-sys-motion-duration-short1: 0ms;
		--md-sys-motion-duration-short2: 0ms;
		--md-sys-motion-duration-short3: 0ms;
		--md-sys-motion-duration-short4: 0ms;
		--md-sys-motion-duration-medium1: 0ms;
		--md-sys-motion-duration-medium2: 0ms;
		--md-sys-motion-duration-medium3: 0ms;
		--md-sys-motion-duration-medium4: 0ms;
		--md-sys-motion-duration-long1: 0ms;
		--md-sys-motion-duration-long2: 0ms;
		--md-sys-motion-duration-long3: 0ms;
		--md-sys-motion-duration-long4: 0ms;
		--md-sys-motion-duration-short: 0ms;
		--md-sys-motion-duration-medium: 0ms;
		--md-sys-motion-duration-long: 0ms;
		--md3-motion-duration-state: 0ms;
		--md3-motion-duration-control: 0ms;
		--md3-motion-duration-nav: 0ms;
		--md3-motion-duration-sidebar-expand: 0ms;
		--md3-motion-duration-sidebar-collapse: 0ms;
		--md3-motion-duration-toc-marker: 0ms;
		--md3-motion-duration-toc-color: 0ms;
		--md3-motion-duration-ripple-grow: 0ms;
		--md3-motion-duration-ripple-fade: 0ms;
		--md3-motion-duration-ripple: 0ms;
		--md3-motion-ripple-minimum-press: 0ms;
		--md3-motion-duration-route-leave: 0ms;
		--md3-motion-duration-route-enter: 0ms;
		--md3-motion-route-delay: 0ms;
	}
`,
				layered,
			),
		);
	}

	return chunks.filter(Boolean).join('\n');
}

function generateSeedCss(seed: string, variant: Md3SeedVariant, layered: boolean) {
	const scheme = generateSeedColorScheme(seed, variant);

	return wrapTokenCss(
		`
	:root,
	::backdrop {
${formatCssTokens(scheme.dark)}
	}

	:root[data-theme='light'],
	[data-theme='light'] ::backdrop {
${formatCssTokens(scheme.light)}
	}
`,
		layered,
	);
}

function generateAccentCss(accent: ResolvedMd3ThemeOptions['accent'], layered: boolean) {
	const preset = accentPresets[accent];
	if (!preset) return '';

	return wrapTokenCss(
		`
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
`,
		layered,
	);
}

function formatCssTokens(tokens: Record<string, string>) {
	return Object.entries(tokens)
		.map(([name, value]) => `		--md-sys-color-${name}: ${value};`)
		.join('\n');
}

function generateDensityCss(density: ResolvedMd3ThemeOptions['density'], layered: boolean) {
	if (density === 'compact') return '';

	return wrapTokenCss(
		`
	:root {
		--md3-density-nav-height: 4rem;
		--md3-density-header-control-height: 2.5rem;
		--md3-density-content-gap: 1.25rem;
		--md3-density-nav-item-min-height: 2.375rem;
		--md3-density-sidebar-gap: 0.25rem;
		--md3-density-card-padding: 1.25rem;
		--md3-density-control-height: 2.75rem;
	}
`,
		layered,
	);
}

function generateShapeCss(shape: ResolvedMd3ThemeOptions['shape'], layered: boolean) {
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

	return wrapTokenCss(
		`
	:root {
		--md-sys-shape-corner-extra-small: ${scale.extraSmall};
		--md-sys-shape-corner-small: ${scale.small};
		--md-sys-shape-corner-medium: ${scale.medium};
		--md-sys-shape-corner-large: ${scale.large};
		--md-sys-shape-corner-extra-large: ${scale.extraLarge};
	}
`,
		layered,
	);
}

function generateContrastCss(contrast: ResolvedMd3ThemeOptions['contrast'], layered: boolean) {
	if (contrast === 'standard') return '';

	const scale =
		contrast === 'medium'
			? {
					hover: '0.1',
					focus: '0.16',
					pressed: '0.16',
					dragged: '0.2',
					selectedContainer: 'var(--md-sys-color-secondary-container)',
					selectedLabel: 'var(--md-sys-color-on-secondary-container)',
					selectedTabLabel: 'var(--md-sys-color-on-secondary-container)',
				}
			: {
					hover: '0.12',
					focus: '0.2',
					pressed: '0.2',
					dragged: '0.24',
					selectedContainer: 'var(--md-sys-color-primary)',
					selectedLabel: 'var(--md-sys-color-on-primary)',
					selectedTabLabel: 'var(--md-sys-color-on-primary)',
				};

	return wrapTokenCss(
		`
	:root {
		--md-sys-state-hover-opacity: ${scale.hover};
		--md-sys-state-focus-opacity: ${scale.focus};
		--md-sys-state-pressed-opacity: ${scale.pressed};
		--md-sys-state-dragged-opacity: ${scale.dragged};
		--md3-comp-nav-item-selected-container-color: ${scale.selectedContainer};
		--md3-comp-nav-item-selected-label-color: ${scale.selectedLabel};
		--md3-comp-tabs-active-container-color: ${scale.selectedContainer};
		--md3-comp-tabs-active-label-color: ${scale.selectedTabLabel};
		--md3-comp-card-outline-color: transparent;
		--md3-comp-search-field-outline-color: var(--md-sys-color-outline);
		--md3-comp-tabs-panel-outline-color: var(--md-sys-color-outline);
		--md3-comp-pagination-outline-color: var(--md-sys-color-outline);
	}
`,
		layered,
	);
}

function wrapTokenCss(content: string, layered: boolean) {
	const trimmed = content.trim();
	return layered ? `\n@layer md3.tokens {\n${trimmed}\n}` : trimmed;
}

function getRouteTransitionBootstrapScript() {
	return `
(() => {
	const storageKey = 'md3-route-transition';
	const sidebarStorageKey = 'md3-sidebar-route-transition';
	let shouldEnter = false;
	let shouldEnterSidebar = false;

	try {
		shouldEnter = sessionStorage.getItem(storageKey) === 'true';
		shouldEnterSidebar = sessionStorage.getItem(sidebarStorageKey) === 'true';
		sessionStorage.removeItem(storageKey);
		sessionStorage.removeItem(sidebarStorageKey);
	} catch {
		return;
	}

	if (!shouldEnter || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	document.documentElement.setAttribute('data-md3-route-state', 'entering');
	if (shouldEnterSidebar) {
		document.documentElement.setAttribute('data-md3-sidebar-route-state', 'entering');
	}

	const clearRouteState = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (document.documentElement.getAttribute('data-md3-route-state') === 'entering') {
					document.documentElement.removeAttribute('data-md3-route-state');
				}
				if (document.documentElement.getAttribute('data-md3-sidebar-route-state') === 'entering') {
					document.documentElement.removeAttribute('data-md3-sidebar-route-state');
				}
			});
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', clearRouteState, { once: true });
	} else {
		clearRouteState();
	}
})();
`;
}

function getMotionRuntimeScript() {
	return `
(() => {
	const routeTransitionStorageKey = 'md3-route-transition';
	const sidebarRouteTransitionStorageKey = 'md3-sidebar-route-transition';
		const rippleSelector = [
			'button:not([disabled])',
			'.sl-link-button:not([aria-disabled="true"])',
			'.sidebar-content a[href]',
			'.sidebar-content summary',
			'starlight-toc a[href]',
			'mobile-starlight-toc summary .toggle',
			'mobile-starlight-toc .dropdown a[href]',
			'.pagination-links a[href]',
			'starlight-tabs [role="tab"]:not([aria-disabled="true"])',
			'.sl-link-card[href]',
			'starlight-menu-button button',
			'.social-icons a[href]',
			'.right-group label'
	].join(',');
	const navigationSelector = [
		'.sidebar-content a[href]',
		'starlight-toc a[href]',
		'.pagination-links a[href]',
		'.sl-link-button[href]',
		'.sl-link-card[href]'
	].join(',');

	const reducedMotion = () =>
		window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
		getComputedStyle(document.documentElement).getPropertyValue('--md3-motion-duration-state').trim() === '0ms';

	const durationToMs = (value) => {
		const token = value.trim();
		if (!token) return 0;
		if (token.endsWith('ms')) return Number.parseFloat(token);
		if (token.endsWith('s')) return Number.parseFloat(token) * 1000;
		return Number.parseFloat(token) || 0;
	};

			const activeRipples = new Map();
			const sidebarDisclosureAnimations = new WeakMap();
			const mobileTocAnimations = new WeakMap();
			const tocNavigationLocks = new WeakMap();
			const tocIndicatorControllers = new WeakMap();

	const getMotionDuration = (tokenName, fallback) => {
		const styles = getComputedStyle(document.documentElement);
		return durationToMs(styles.getPropertyValue(tokenName)) || fallback;
	};

	const getMotionEasing = (tokenName, fallback) => {
		const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
		return value || fallback;
	};

	const getDisclosureContent = (details) => {
		const content = details.querySelector(':scope > ul');
		return content instanceof HTMLElement ? content : null;
	};

	const getMobileTocContent = (details) => {
		const content = details.querySelector(':scope > .dropdown');
		return content instanceof HTMLElement ? content : null;
	};

	const animateSidebarDisclosure = (summary) => {
		const details = summary.parentElement;
		if (!(details instanceof HTMLDetailsElement)) return false;
		const content = getDisclosureContent(details);
		if (!content) return false;

		const active = sidebarDisclosureAnimations.get(details);
		const currentHeight = active ? content.getBoundingClientRect().height : null;
		const isClosing = active ? !active.closing : details.open;
		if (active) {
			active.animation.cancel();
			sidebarDisclosureAnimations.delete(details);
		}

		const duration = getMotionDuration(
			isClosing ? '--md3-motion-duration-sidebar-collapse' : '--md3-motion-duration-sidebar-expand',
			isClosing ? 200 : 400
		);
		if (duration <= 0) return false;

		const easing = isClosing
			? getMotionEasing('--md-sys-motion-easing-emphasized-accelerate', 'cubic-bezier(0.3, 0, 0.8, 0.15)')
			: getMotionEasing('--md-sys-motion-easing-emphasized-decelerate', 'cubic-bezier(0.05, 0.7, 0.1, 1)');
		details.dataset.md3DisclosureState = isClosing ? 'closing' : 'opening';

		if (!isClosing) {
			details.open = true;
		}

		const startHeight = currentHeight ?? (isClosing ? content.offsetHeight : 0);
		const endHeight = isClosing ? 0 : content.scrollHeight;
		content.style.overflow = 'clip';
		const animation = content.animate(
			isClosing
				? [
						{ blockSize: startHeight + 'px', opacity: 1, transform: 'translateY(0)', offset: 0 },
						{ blockSize: Math.round(startHeight * 0.28) + 'px', opacity: 1, transform: 'translateY(-0.125rem)', offset: 0.75 },
						{ blockSize: endHeight + 'px', opacity: 0, transform: 'translateY(-0.25rem)', offset: 1 },
					]
				: [
						{ blockSize: startHeight + 'px', opacity: 0, transform: 'translateY(-0.25rem)', offset: 0 },
						{ blockSize: Math.round(endHeight * 0.72) + 'px', opacity: 1, transform: 'translateY(0)', offset: 0.34 },
						{ blockSize: endHeight + 'px', opacity: 1, transform: 'translateY(0)', offset: 1 },
					],
			{ duration, easing }
		);
		sidebarDisclosureAnimations.set(details, { animation, closing: isClosing });

		animation.finished
			.catch(() => {})
			.finally(() => {
				const active = sidebarDisclosureAnimations.get(details);
				if (!active || active.animation !== animation) return;
				if (isClosing) {
					details.open = false;
				} else {
					details.open = true;
				}
				content.style.removeProperty('overflow');
				delete details.dataset.md3DisclosureState;
				sidebarDisclosureAnimations.delete(details);
		});
		return true;
	};

	const animateMobileTocDisclosure = (summary, desiredOpen) => {
		const details = summary.closest('mobile-starlight-toc details');
		if (!(details instanceof HTMLDetailsElement)) return null;
		const content = getMobileTocContent(details);
		if (!content) return null;

		const active = mobileTocAnimations.get(details);
		const currentHeight = active ? content.getBoundingClientRect().height : null;
		const isClosing =
			typeof desiredOpen === 'boolean' ? !desiredOpen : active ? !active.closing : details.open;
		if (active && active.closing === isClosing) return { handled: true, finished: active.finished };
		if (active) {
			active.animation.cancel();
			mobileTocAnimations.delete(details);
		}

		const duration = getMotionDuration(
			isClosing ? '--md3-motion-duration-toc-menu-collapse' : '--md3-motion-duration-toc-menu-expand',
			isClosing ? 160 : 220
		);
		if (duration <= 0) return null;

		const easing = isClosing
			? getMotionEasing('--md-sys-motion-easing-emphasized-accelerate', 'cubic-bezier(0.3, 0, 0.8, 0.15)')
			: getMotionEasing('--md-sys-motion-easing-emphasized-decelerate', 'cubic-bezier(0.05, 0.7, 0.1, 1)');
		details.dataset.md3TocState = isClosing ? 'closing' : 'opening';

		if (!isClosing) {
			details.open = true;
		}

		const startHeight = currentHeight ?? (isClosing ? content.offsetHeight : 0);
		const endHeight = isClosing ? 0 : content.scrollHeight;
		content.style.overflow = 'clip';

		const animation = content.animate(
			isClosing
				? [
						{ blockSize: startHeight + 'px', opacity: 1, transform: 'translateY(0)', offset: 0 },
						{ blockSize: Math.round(startHeight * 0.38) + 'px', opacity: 0.78, transform: 'translateY(-0.125rem)', offset: 0.72 },
						{ blockSize: endHeight + 'px', opacity: 0, transform: 'translateY(-0.25rem)', offset: 1 },
					]
				: [
						{ blockSize: startHeight + 'px', opacity: 0, transform: 'translateY(-0.25rem)', offset: 0 },
						{ blockSize: Math.round(endHeight * 0.72) + 'px', opacity: 1, transform: 'translateY(0)', offset: 0.38 },
						{ blockSize: endHeight + 'px', opacity: 1, transform: 'translateY(0)', offset: 1 },
					],
			{ duration, easing }
		);

		const finished = animation.finished
			.catch(() => {})
			.finally(() => {
				const active = mobileTocAnimations.get(details);
				if (!active || active.animation !== animation) return;
				if (isClosing) {
					details.open = false;
				} else {
					details.open = true;
				}
				content.style.removeProperty('overflow');
				delete details.dataset.md3TocState;
				mobileTocAnimations.delete(details);
			});
		mobileTocAnimations.set(details, { animation, closing: isClosing, finished });
		return { handled: true, finished };
	};

	const getHashTarget = (hash) => {
		if (!hash || hash === '#') return null;
		const id = decodeURIComponent(hash.slice(1));
		return document.getElementById(id);
	};

	const scrollToHashTarget = (url, target) => {
		const path = url.pathname + url.search + url.hash;
		if (window.location.pathname + window.location.search + window.location.hash !== path) {
			history.pushState(null, '', path);
		}
		if (target instanceof HTMLElement) {
			const hadTabIndex = target.hasAttribute('tabindex');
			target.setAttribute('tabindex', '-1');
			target.focus({ preventScroll: true });
			if (!hadTabIndex) {
				window.setTimeout(() => target.removeAttribute('tabindex'), 1000);
			}
		}
		target.scrollIntoView({
			behavior: reducedMotion() ? 'auto' : 'smooth',
			block: 'start',
		});
	};

	const closeMobileTocWithAnimation = (details) => {
		const summary = details.querySelector(':scope > summary');
		if (!(summary instanceof HTMLElement) || !details.open) return Promise.resolve();
		if (reducedMotion()) {
			details.open = false;
			return Promise.resolve();
		}
		const result = animateMobileTocDisclosure(summary, false);
		return result?.finished ?? Promise.resolve();
	};

	const createRipple = (surface, positionEvent) => {
		if (!(surface instanceof HTMLElement) || surface.matches('[aria-disabled="true"], [disabled]')) return;

		const rect = surface.getBoundingClientRect();
		if (!rect.width || !rect.height) return;

		const maxDim = Math.max(rect.width, rect.height);
		const initialSize = Math.max(1, Math.floor(maxDim * 0.2));
		const softEdgeSize = Math.max(maxDim * 0.35, 75);
		const rippleScale = (Math.hypot(rect.width, rect.height) + 10 + softEdgeSize) / initialSize;
		const originX = positionEvent ? positionEvent.clientX - rect.left : rect.width / 2;
		const originY = positionEvent ? positionEvent.clientY - rect.top : rect.height / 2;
		const startX = originX - initialSize / 2;
		const startY = originY - initialSize / 2;
		const endX = rect.width / 2 - initialSize / 2;
		const endY = rect.height / 2 - initialSize / 2;
		const ripple = document.createElement('span');
		ripple.className = 'md3-ripple';
		ripple.style.setProperty('--md3-ripple-size', initialSize + 'px');
		ripple.style.setProperty('--md3-ripple-start-x', startX + 'px');
		ripple.style.setProperty('--md3-ripple-start-y', startY + 'px');
		ripple.style.setProperty('--md3-ripple-end-x', endX + 'px');
		ripple.style.setProperty('--md3-ripple-end-y', endY + 'px');
		ripple.style.setProperty('--md3-ripple-scale', rippleScale.toString());
		surface.append(ripple);

		return {
			ripple,
			surface,
			startedAt: performance.now(),
			minimumPressMs: getMotionDuration('--md3-motion-ripple-minimum-press', 225),
			fadeMs: getMotionDuration('--md3-motion-duration-ripple-fade', 150),
			released: false,
		};
	};

	const releaseRipple = (record) => {
		if (!record || record.released) return;
		record.released = true;

		const elapsedMs = performance.now() - record.startedAt;
		const delayMs = Math.max(0, record.minimumPressMs - elapsedMs);
		window.setTimeout(() => {
			if (!record.ripple.isConnected) return;
			record.ripple.classList.add('md3-ripple--releasing');
			window.setTimeout(() => record.ripple.remove(), record.fadeMs + 50);
		}, delayMs);
	};

			const getLockedTocLink = (nav) => {
				const record = tocNavigationLocks.get(nav);
				if (!record || !record.link.isConnected || !nav.contains(record.link)) {
					return null;
				}
				return record.link;
			};

			const getTocHost = (surface) => {
				if (!(surface instanceof Element)) return null;
				const host = surface.matches('starlight-toc, mobile-starlight-toc')
					? surface
					: surface.closest('starlight-toc, mobile-starlight-toc');
				return host instanceof HTMLElement ? host : null;
			};

			const setTocCurrentThroughHost = (surface, link) => {
				const host = getTocHost(surface);
				if (!(host instanceof HTMLElement) || !(link instanceof HTMLAnchorElement) || !host.contains(link)) {
					return false;
				}

				// Starlight keeps a private current-link reference; its setter must update both states.
				let prototype = Object.getPrototypeOf(host);
				while (prototype && prototype !== HTMLElement.prototype) {
					const descriptor = Object.getOwnPropertyDescriptor(prototype, 'current');
					if (typeof descriptor?.set === 'function') {
						try {
							descriptor.set.call(host, link);
							host.querySelectorAll('a[aria-current="true"]').forEach((currentLink) => {
								if (currentLink !== link) currentLink.removeAttribute('aria-current');
							});
							return link.getAttribute('aria-current') === 'true';
						} catch {
							return false;
						}
					}
					prototype = Object.getPrototypeOf(prototype);
				}
				return false;
			};

			const transformForTocPosition = (x, y) =>
				'translate3d(' + x.toFixed(3) + 'px, ' + y.toFixed(3) + 'px, 0)';

			const readTocIndicatorPosition = (controller) => {
				try {
					const matrix = new DOMMatrixReadOnly(getComputedStyle(controller.indicator).transform);
					return { x: matrix.m41, y: matrix.m42 };
				} catch {
					return { x: controller.x, y: controller.y };
				}
			};

			const getTocIndicatorController = (nav) => {
				const existing = tocIndicatorControllers.get(nav);
				if (existing?.indicator?.isConnected) return existing;

				const indicator = document.createElement('span');
				indicator.className = 'md3-toc-indicator';
				indicator.setAttribute('aria-hidden', 'true');
				nav.prepend(indicator);
				const controller = {
					nav,
					indicator,
					initialized: false,
					x: 0,
					y: 0,
					targetX: 0,
					targetY: 0,
					velocityX: 0,
					velocityY: 0,
					frame: 0,
					lastTime: 0,
					animation: null,
					stiffness: 1400,
					dampingRatio: 0.9,
				};
				tocIndicatorControllers.set(nav, controller);
				return controller;
			};

			const stopTocIndicatorMotion = (controller, capturePosition = true) => {
				const position = capturePosition ? readTocIndicatorPosition(controller) : null;
				if (controller.frame) {
					cancelAnimationFrame(controller.frame);
					controller.frame = 0;
				}
				if (controller.animation) {
					controller.animation.cancel();
					controller.animation = null;
				}
				if (position) {
					controller.x = position.x;
					controller.y = position.y;
					controller.indicator.style.transform = transformForTocPosition(position.x, position.y);
				}
				controller.velocityX = 0;
				controller.velocityY = 0;
				controller.lastTime = 0;
			};

			const snapTocIndicator = (controller, targetX, targetY) => {
				stopTocIndicatorMotion(controller, false);
				controller.x = targetX;
				controller.y = targetY;
				controller.targetX = targetX;
				controller.targetY = targetY;
				controller.indicator.style.transform = transformForTocPosition(targetX, targetY);
				controller.nav.dataset.md3TocMotion = 'settled';
			};

			const stepTocIndicatorSpring = (controller, now) => {
				if (!controller.indicator.isConnected) {
					controller.frame = 0;
					return;
				}
				const elapsed = controller.lastTime ? Math.min((now - controller.lastTime) / 1000, 0.032) : 0;
				controller.lastTime = now;
				const steps = Math.max(1, Math.ceil(elapsed / 0.008));
				const dt = steps ? elapsed / steps : 0;
				const damping = 2 * controller.dampingRatio * Math.sqrt(controller.stiffness);

				for (let index = 0; index < steps; index += 1) {
					const accelerationX =
						-controller.stiffness * (controller.x - controller.targetX) - damping * controller.velocityX;
					const accelerationY =
						-controller.stiffness * (controller.y - controller.targetY) - damping * controller.velocityY;
					controller.velocityX += accelerationX * dt;
					controller.velocityY += accelerationY * dt;
					controller.x += controller.velocityX * dt;
					controller.y += controller.velocityY * dt;
				}

				controller.indicator.style.transform = transformForTocPosition(controller.x, controller.y);
				const settled =
					Math.abs(controller.x - controller.targetX) < 0.1 &&
					Math.abs(controller.y - controller.targetY) < 0.1 &&
					Math.abs(controller.velocityX) < 2 &&
					Math.abs(controller.velocityY) < 2;
				if (settled) {
					controller.frame = 0;
					controller.x = controller.targetX;
					controller.y = controller.targetY;
					controller.velocityX = 0;
					controller.velocityY = 0;
					controller.indicator.style.transform = transformForTocPosition(controller.x, controller.y);
					controller.nav.dataset.md3TocMotion = 'settled';
					return;
				}
				controller.frame = requestAnimationFrame((frameNow) => stepTocIndicatorSpring(controller, frameNow));
			};

			const retargetTocIndicatorSpring = (controller, targetX, targetY) => {
				if (controller.animation) {
					stopTocIndicatorMotion(controller, true);
				}
				controller.targetX = targetX;
				controller.targetY = targetY;
				const styles = getComputedStyle(document.documentElement);
				controller.stiffness =
					Number.parseFloat(styles.getPropertyValue('--md3-motion-toc-spring-stiffness')) || 1400;
				controller.dampingRatio =
					Number.parseFloat(styles.getPropertyValue('--md3-motion-toc-spring-damping-ratio')) || 0.9;
				controller.nav.dataset.md3TocMotion = 'spring';
				if (!controller.frame) {
					controller.lastTime = performance.now();
					controller.frame = requestAnimationFrame((frameNow) => stepTocIndicatorSpring(controller, frameNow));
				}
			};

			const animateTocIndicatorFlip = (controller, targetX, targetY) => {
				const duration = getMotionDuration('--md3-motion-duration-toc-marker', 250);
				if (duration <= 0 || reducedMotion()) {
					snapTocIndicator(controller, targetX, targetY);
					return;
				}
				const current = readTocIndicatorPosition(controller);
				stopTocIndicatorMotion(controller, false);
				controller.x = current.x;
				controller.y = current.y;
				controller.targetX = targetX;
				controller.targetY = targetY;
				controller.indicator.style.transform = transformForTocPosition(targetX, targetY);
				controller.nav.dataset.md3TocMotion = 'flip';
				const animation = controller.indicator.animate(
					[
						{ transform: transformForTocPosition(current.x, current.y) },
						{ transform: transformForTocPosition(targetX, targetY) },
					],
					{
						duration,
						easing: getMotionEasing('--md-sys-motion-easing-emphasized', 'cubic-bezier(0.2, 0, 0, 1)'),
					}
				);
				controller.animation = animation;
				animation.finished
					.catch(() => {})
					.finally(() => {
						if (controller.animation !== animation) return;
						controller.animation = null;
						controller.x = targetX;
						controller.y = targetY;
						controller.nav.dataset.md3TocMotion = 'settled';
					});
			};

			const syncTocIndicator = (nav, source = 'scroll') => {
				if (!(nav instanceof HTMLElement)) return;
				const lockedLink = getLockedTocLink(nav);
				const activeLink = lockedLink || nav.querySelector('a[aria-current="true"]');
				const controller = getTocIndicatorController(nav);
				nav.dataset.md3TocTracker = 'true';

				if (!(activeLink instanceof HTMLElement)) {
					controller.indicator.style.opacity = '0';
					return;
				}

				const indicatorBlockSize = 16;
				const navRect = nav.getBoundingClientRect();
				const activeRect = activeLink.getBoundingClientRect();
				const activeStyles = getComputedStyle(activeLink);
				const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
				const indicatorDepth = Math.max(0, Number.parseFloat(activeStyles.getPropertyValue('--depth')) || 0);
				const indicatorDirection = activeStyles.direction === 'rtl' ? -1 : 1;
				const targetX = indicatorDepth * indicatorDirection * rootFontSize;
				const targetY =
					activeRect.top - navRect.top + Math.max(0, (activeRect.height - indicatorBlockSize) / 2);
				nav.style.setProperty('--md3-toc-indicator-x', targetX + 'px');
				nav.style.setProperty('--md3-toc-indicator-y', targetY + 'px');
				controller.indicator.style.opacity = '1';

				if (!controller.initialized || source === 'layout' || reducedMotion()) {
					controller.initialized = true;
					snapTocIndicator(controller, targetX, targetY);
					return;
				}

				const targetChanged =
					Math.abs(controller.targetX - targetX) > 0.1 || Math.abs(controller.targetY - targetY) > 0.1;
				if (!targetChanged) return;
				if (lockedLink || source === 'click') {
					animateTocIndicatorFlip(controller, targetX, targetY);
				} else {
					retargetTocIndicatorSpring(controller, targetX, targetY);
				}
			};

			const setTocActiveLink = (link, source = 'click') => {
				const nav = link.closest('starlight-toc nav');
				if (!(nav instanceof HTMLElement)) return false;
				const updated = setTocCurrentThroughHost(nav, link);
				syncTocIndicator(nav, source);
				return updated;
			};

		const lockTocActiveLink = (link, lockMs = 1200) => {
			const nav = link.closest('starlight-toc nav');
			if (!(nav instanceof HTMLElement)) return false;

			const previous = tocNavigationLocks.get(nav);
			if (previous) {
				window.clearTimeout(previous.timeout);
				previous.link.classList.remove('md3-toc-navigation-target');
			}

			nav.dataset.md3TocNavigationLock = 'true';
			link.classList.add('md3-toc-navigation-target');
			setTocActiveLink(link);

			const timeout = window.setTimeout(() => {
				const active = tocNavigationLocks.get(nav);
				if (!active || active.link !== link) return;
				setTocActiveLink(link);
				link.classList.remove('md3-toc-navigation-target');
				delete nav.dataset.md3TocNavigationLock;
				tocNavigationLocks.delete(nav);
				syncTocIndicator(nav);
			}, lockMs);

			tocNavigationLocks.set(nav, { link, timeout });
			return true;
		};

		const setMobileTocActiveLink = (details, link) => {
			if (!(details instanceof HTMLDetailsElement) || !(link instanceof HTMLAnchorElement)) return false;
			return setTocCurrentThroughHost(details, link);
		};

	const setupTocIndicators = () => {
		const navs = document.querySelectorAll('starlight-toc nav');
		navs.forEach((nav) => {
			if (!(nav instanceof HTMLElement) || nav.dataset.md3TocTrackerReady === 'true') return;
			nav.dataset.md3TocTrackerReady = 'true';
			let frame = 0;
				let pendingSource = 'scroll';
				const scheduleSync = (source = 'scroll') => {
					if (source === 'layout') pendingSource = 'layout';
					if (frame) return;
					frame = requestAnimationFrame(() => {
						frame = 0;
						const source = pendingSource;
						pendingSource = 'scroll';
						syncTocIndicator(nav, source);
					});
				};

				syncTocIndicator(nav, 'initial');
				requestAnimationFrame(() => {
					if (nav.isConnected) {
						nav.dataset.md3TocMotionReady = 'true';
					}
				});
				new MutationObserver(() => {
					const lockedLink = getLockedTocLink(nav);
					const currentLinks = nav.querySelectorAll('a[aria-current="true"]');
					if (
						lockedLink &&
						(lockedLink.getAttribute('aria-current') !== 'true' || currentLinks.length !== 1)
					) {
						setTocCurrentThroughHost(nav, lockedLink);
					}
					scheduleSync('scroll');
				}).observe(nav, {
					attributes: true,
					attributeFilter: ['aria-current'],
					childList: true,
					subtree: true,
				});
				if ('ResizeObserver' in window) {
					new ResizeObserver(() => scheduleSync('layout')).observe(nav);
				}
				window.addEventListener('scroll', () => scheduleSync('scroll'), { passive: true });
				window.addEventListener('resize', () => scheduleSync('layout'), { passive: true });
		});
	};

	const setupTocEndState = () => {
		let frame = 0;
		const syncEndState = () => {
			const scrollingElement = document.scrollingElement || document.documentElement;
			const remainingScroll =
				scrollingElement.scrollHeight - scrollingElement.clientHeight - scrollingElement.scrollTop;
			if (remainingScroll > 2) return false;

			document.querySelectorAll('starlight-toc nav').forEach((nav) => {
				if (!(nav instanceof HTMLElement)) return;
				if (getLockedTocLink(nav)) {
					syncTocIndicator(nav);
					return;
				}
				const links = Array.from(nav.querySelectorAll('a[href]')).filter(
					(link) => link instanceof HTMLElement
				);
				const lastLink = links.at(-1);
				if (!(lastLink instanceof HTMLElement)) return;
				const currentLinks = links.filter((link) => link.getAttribute('aria-current') === 'true');
				if (currentLinks.length === 1 && currentLinks[0] === lastLink) {
					syncTocIndicator(nav);
					return;
				}

					setTocActiveLink(lastLink, 'scroll');
			});
			document.querySelectorAll('mobile-starlight-toc details').forEach((details) => {
				if (!(details instanceof HTMLDetailsElement)) return;
				const links = Array.from(details.querySelectorAll('.dropdown a[href]')).filter(
					(link) => link instanceof HTMLElement
				);
				const lastLink = links.at(-1);
				if (!(lastLink instanceof HTMLElement)) return;
				const currentLinks = links.filter((link) => link.getAttribute('aria-current') === 'true');
				if (currentLinks.length === 1 && currentLinks[0] === lastLink) {
					setMobileTocActiveLink(details, lastLink);
					return;
				}

				setMobileTocActiveLink(details, lastLink);
			});
			return true;
		};
		const scheduleEndState = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
					syncEndState();
			});
		};

		window.addEventListener('scroll', scheduleEndState, { passive: true });
		window.addEventListener('resize', scheduleEndState, { passive: true });
			document.querySelectorAll('starlight-toc nav, mobile-starlight-toc details').forEach((tocSurface) => {
				new MutationObserver(() => syncEndState()).observe(tocSurface, {
					attributes: true,
					attributeFilter: ['aria-current'],
					subtree: true,
			});
		});
		scheduleEndState();
	};

	if (document.readyState === 'loading') {
		document.addEventListener(
			'DOMContentLoaded',
			() => {
				setupTocIndicators();
				setupTocEndState();
			},
			{ once: true }
		);
	} else {
		setupTocIndicators();
		setupTocEndState();
	}

	document.addEventListener('pointerdown', (event) => {
		const targetElement = event.target instanceof Element ? event.target : null;
		const openMobileMenu = document.querySelector('starlight-menu-button[aria-expanded="true"]');
		if (
			openMobileMenu &&
			targetElement &&
			!targetElement.closest('#starlight__sidebar') &&
			!targetElement.closest('starlight-menu-button')
		) {
			if (typeof openMobileMenu.setExpanded === 'function') {
				openMobileMenu.setExpanded(false);
			} else {
				openMobileMenu.setAttribute('aria-expanded', 'false');
				document.body.removeAttribute('data-mobile-menu-expanded');
			}
		}

		if (event.button !== 0 || !event.isPrimary || reducedMotion()) return;
		const surface = targetElement ? targetElement.closest(rippleSelector) : null;
		const record = createRipple(surface, event);
		if (record) {
			activeRipples.set(event.pointerId, record);
		}
	}, { passive: true });

	document.addEventListener('pointerup', (event) => {
		const record = activeRipples.get(event.pointerId);
		releaseRipple(record);
		activeRipples.delete(event.pointerId);
	}, { passive: true });

	document.addEventListener('pointercancel', (event) => {
		const record = activeRipples.get(event.pointerId);
		releaseRipple(record);
		activeRipples.delete(event.pointerId);
	}, { passive: true });

	document.addEventListener('pointerout', (event) => {
		if (event.pointerType === 'touch') return;
		const record = activeRipples.get(event.pointerId);
		if (!record) return;
		if (event.relatedTarget instanceof Node && record.surface.contains(event.relatedTarget)) return;
		releaseRipple(record);
		activeRipples.delete(event.pointerId);
	}, { passive: true });

	document.addEventListener('contextmenu', () => {
		activeRipples.forEach(releaseRipple);
		activeRipples.clear();
	});

	document.addEventListener('click', (event) => {
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const link = event.target instanceof Element
			? event.target.closest('starlight-toc a[href], mobile-starlight-toc .dropdown a[href]')
			: null;
		if (!(link instanceof HTMLAnchorElement)) return;
		if (link.target || link.hasAttribute('download') || link.getAttribute('aria-disabled') === 'true') return;

		const url = new URL(link.href, window.location.href);
		const current = new URL(window.location.href);
		if (url.origin !== current.origin || url.pathname !== current.pathname || url.search !== current.search || !url.hash) {
			return;
		}

		const target = getHashTarget(url.hash);
		if (!target) return;

			event.preventDefault();
			event.stopPropagation();
			link.classList.add('md3-navigation-pending');
			const hasLockedTocTarget = lockTocActiveLink(link);
			if (!hasLockedTocTarget) {
				setTocActiveLink(link);
			}

		const mobileToc = link.closest('mobile-starlight-toc details');
		if (mobileToc instanceof HTMLDetailsElement) {
				closeMobileTocWithAnimation(mobileToc).finally(() => {
					link.classList.remove('md3-navigation-pending');
					scrollToHashTarget(url, target);
				});
				return;
			}

			link.classList.remove('md3-navigation-pending');
			scrollToHashTarget(url, target);
		}, { capture: true });

	document.addEventListener('click', (event) => {
		if (event.defaultPrevented || reducedMotion()) return;
			const mobileTocSummary = event.target instanceof Element
				? event.target.closest('mobile-starlight-toc details > summary')
				: null;
			if (
				mobileTocSummary instanceof HTMLElement &&
				event.detail > 0 &&
				!(event.target instanceof Element && event.target.closest('mobile-starlight-toc summary .toggle'))
			) {
				event.preventDefault();
				return;
			}
			const mobileTocAnimation =
				mobileTocSummary instanceof HTMLElement ? animateMobileTocDisclosure(mobileTocSummary) : null;
		if (mobileTocAnimation?.handled) {
			event.preventDefault();
			return;
		}

		const summary = event.target instanceof Element
			? event.target.closest('.sidebar-content details > summary')
			: null;
		if (!(summary instanceof HTMLElement)) return;
		if (animateSidebarDisclosure(summary)) {
			event.preventDefault();
		}
	});

	document.addEventListener('click', (event) => {
		if (event.defaultPrevented || event.button !== 0 || reducedMotion()) return;
		if (event.detail === 0) {
			const surface = event.target instanceof Element ? event.target.closest(rippleSelector) : null;
			const record = createRipple(surface);
			releaseRipple(record);
		}
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const link = event.target instanceof Element ? event.target.closest(navigationSelector) : null;
		if (!(link instanceof HTMLAnchorElement)) return;
		if (link.target || link.hasAttribute('download') || link.getAttribute('aria-disabled') === 'true') return;

		const url = new URL(link.href, window.location.href);
		const current = new URL(window.location.href);
		if (url.origin !== current.origin) return;
		if (url.pathname === current.pathname && url.search === current.search && url.hash) return;
		if (url.href === current.href) return;
		const shouldAnimateSidebarRoute =
			document.documentElement.hasAttribute('data-has-hero') &&
			!document.documentElement.hasAttribute('data-has-sidebar');

		const delay = durationToMs(
			getComputedStyle(document.documentElement).getPropertyValue('--md3-motion-route-delay')
		) || 100;
		if (delay <= 0) return;

		event.preventDefault();
		link.classList.add('md3-navigation-pending');
		document.documentElement.setAttribute('data-md3-route-state', 'leaving');
		try {
			sessionStorage.setItem(routeTransitionStorageKey, 'true');
			if (shouldAnimateSidebarRoute) {
				sessionStorage.setItem(sidebarRouteTransitionStorageKey, 'true');
			} else {
				sessionStorage.removeItem(sidebarRouteTransitionStorageKey);
			}
		} catch {}
		window.setTimeout(() => {
			window.location.href = url.href;
		}, delay);
	});
})();
`;
}
