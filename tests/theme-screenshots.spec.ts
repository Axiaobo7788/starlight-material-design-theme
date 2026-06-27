import { expect, test, type Page } from '@playwright/test';

const themes = ['dark', 'light'] as const;

const viewports = [
	{ name: 'desktop', size: { width: 1440, height: 900 } },
	{ name: 'mobile', size: { width: 390, height: 844 } },
] as const;

type ViewportName = (typeof viewports)[number]['name'];

const pageScreenshotTargets: ReadonlyArray<{
	name: string;
	path: string;
	viewports: readonly ViewportName[];
}> = [
	{ name: 'home', path: '/', viewports: ['desktop', 'mobile'] },
	{ name: 'theme-lab', path: '/guides/theme-lab/', viewports: ['desktop', 'mobile'] },
	{ name: 'implementation-plan', path: '/guides/implementation-plan/', viewports: ['desktop'] },
	{ name: 'plugin-options', path: '/reference/plugin-options/', viewports: ['desktop'] },
];

const scenarios = pageScreenshotTargets.flatMap((target) =>
	viewports
		.filter((viewport) => target.viewports.includes(viewport.name))
		.flatMap((viewport) =>
			themes.map((theme) => ({
				name: `${target.name}-${viewport.name}-${theme}`,
				path: target.path,
				theme,
				viewport: viewport.size,
			})),
		),
);

const searchDialogScenarios = viewports.flatMap((viewport) =>
	themes.map((theme) => ({
		name: `search-dialog-${viewport.name}-${theme}`,
		path: '/guides/theme-lab/',
		theme,
		viewport: viewport.size,
	})),
);

const mobileDrawerScenarios = themes.map((theme) => ({
	name: `mobile-drawer-${theme}`,
	path: '/guides/theme-lab/',
	theme,
	viewport: viewports.find((viewport) => viewport.name === 'mobile')!.size,
}));

const mobileTocScenarios = themes.map((theme) => ({
	name: `mobile-toc-${theme}`,
	path: '/guides/theme-concept/',
	theme,
	viewport: viewports.find((viewport) => viewport.name === 'mobile')!.size,
}));

const themeMenuScenarios = themes.map((theme) => ({
	name: `theme-menu-desktop-${theme}`,
	path: '/guides/theme-lab/',
	theme,
	viewport: viewports.find((viewport) => viewport.name === 'desktop')!.size,
}));

test.describe('Theme page screenshots', () => {
	for (const scenario of scenarios) {
		test(scenario.name, async ({ page }) => {
			await page.setViewportSize(scenario.viewport);
			await setThemeBeforeNavigation(page, scenario.theme);
			await page.goto(scenario.path);
			await settlePage(page, scenario.theme);

			await takeScreenshot(page, scenario.name);
		});
	}
});

test.describe('Theme interaction screenshots', () => {
	for (const scenario of searchDialogScenarios) {
		test(scenario.name, async ({ page }) => {
			await page.setViewportSize(scenario.viewport);
			await setThemeBeforeNavigation(page, scenario.theme);
			await page.goto(scenario.path);
			await settlePage(page, scenario.theme);

			await page.locator('button[data-open-modal]').click();
			await expect(page.locator('dialog[open]')).toBeVisible();
			await page.evaluate(() => window.getSelection()?.removeAllRanges());

			await takeScreenshot(page, scenario.name, { fullPage: false });
		});
	}

	for (const scenario of mobileDrawerScenarios) {
		test(scenario.name, async ({ page }) => {
			await page.setViewportSize(scenario.viewport);
			await setThemeBeforeNavigation(page, scenario.theme);
			await page.goto(scenario.path);
			await settlePage(page, scenario.theme);

			await page.locator('starlight-menu-button button').click();
			await expect(page.locator('starlight-menu-button')).toHaveAttribute('aria-expanded', 'true');
			await expect(page.locator('#starlight__sidebar')).toBeVisible();
			await page.evaluate(() => window.getSelection()?.removeAllRanges());

			await takeScreenshot(page, scenario.name, {
				fullPage: false,
				maxDiffPixelRatio: 0.001,
			});
		});
	}

	for (const scenario of mobileTocScenarios) {
		test(scenario.name, async ({ page }) => {
			await page.setViewportSize(scenario.viewport);
			await setThemeBeforeNavigation(page, scenario.theme);
			await page.goto(scenario.path);
			await settlePage(page, scenario.theme);

			await page.locator('#starlight__mobile-toc summary .toggle').click();
			await expect(page.locator('#starlight__mobile-toc')).toHaveAttribute('open', '');
			await expect(page.locator('#starlight__mobile-toc .dropdown a').first()).toBeVisible();
			await page.evaluate(() => window.getSelection()?.removeAllRanges());

			await takeScreenshot(page, scenario.name, {
				fullPage: false,
				maxDiffPixelRatio: 0.001,
			});
		});
	}

	for (const scenario of themeMenuScenarios) {
		test(scenario.name, async ({ page }) => {
			await page.setViewportSize(scenario.viewport);
			await setThemeBeforeNavigation(page, scenario.theme);
			await page.goto(scenario.path);
			await settlePage(page, scenario.theme);

			const themeButton = page.locator('starlight-theme-select .md3-theme-select__button').first();
			await themeButton.click();
			await expect(themeButton).toHaveAttribute('aria-expanded', 'true');
			await expect(page.locator('starlight-theme-select .md3-theme-select__menu').first()).toBeVisible();
			await page.evaluate(() => window.getSelection()?.removeAllRanges());

			await takeScreenshot(page, scenario.name, { fullPage: false });
		});
	}
});

test.describe('Theme motion behavior', () => {
	test('motion tokens enable state transitions by default', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const stateDuration = await page
			.locator('html')
			.evaluate((element) => getComputedStyle(element).getPropertyValue('--md3-motion-duration-state').trim());
		const routeDurations = await page.locator('html').evaluate((element) => {
			const styles = getComputedStyle(element);
			return {
				enter: styles.getPropertyValue('--md3-motion-duration-route-enter').trim(),
				leave: styles.getPropertyValue('--md3-motion-duration-route-leave').trim(),
			};
		});
		const buttonDuration = await page
			.locator('button[data-open-modal]')
			.evaluate((element) => getComputedStyle(element).transitionDuration);

		expect(stateDuration).not.toBe('0ms');
		expect(routeDurations.enter).not.toBe('0ms');
		expect(routeDurations.leave).not.toBe('0ms');
		expect(buttonDuration).not.toBe('0s');
	});

	test('motion tokens honor reduced-motion preference', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const stateDuration = await page
			.locator('html')
			.evaluate((element) => getComputedStyle(element).getPropertyValue('--md3-motion-duration-state').trim());
		const routeDurations = await page.locator('html').evaluate((element) => {
			const styles = getComputedStyle(element);
			return {
				enter: styles.getPropertyValue('--md3-motion-duration-route-enter').trim(),
				leave: styles.getPropertyValue('--md3-motion-duration-route-leave').trim(),
			};
		});

		expect(stateDuration).toBe('0ms');
		expect(routeDurations.enter).toBe('0ms');
		expect(routeDurations.leave).toBe('0ms');
	});

	test('motion avoids document page-entry and hover transform effects', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const contentAnimation = await page
			.locator('main > .content-panel')
			.first()
			.evaluate((element) => getComputedStyle(element).animationName);
		const contentTransition = await page
			.locator('main > .content-panel')
			.first()
			.evaluate((element) => getComputedStyle(element).transitionProperty);
		const searchTransition = await page
			.locator('button[data-open-modal]')
			.evaluate((element) => getComputedStyle(element).transitionProperty);
		const cardTransition = await page
			.locator('.card')
			.first()
			.evaluate((element) => getComputedStyle(element).transitionProperty);

		await page.locator('button[data-open-modal]').click();
		await expect(page.locator('dialog[open]')).toBeVisible();
		const dialogAnimation = await page
			.locator('dialog[open]')
			.evaluate((element) => getComputedStyle(element).animationName);

		expect(contentAnimation).toBe('none');
		expect(dialogAnimation).toBe('none');
		expect(contentTransition).toContain('opacity');
		expect(contentTransition).toContain('transform');
		expect(searchTransition).not.toContain('transform');
		expect(cardTransition).not.toContain('transform');
	});

	test('pointer-origin ripple is created for pressed controls', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const searchButton = page.locator('button[data-open-modal]');
		const box = await searchButton.boundingBox();
		expect(box).not.toBeNull();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
		await page.mouse.down();

		const ripple = searchButton.locator('.md3-ripple');
		await expect(ripple).toHaveCount(1);
		await expect(ripple).toHaveCSS('animation-name', 'md3-ripple-expand');
		await expect(ripple).toHaveCSS('animation-duration', '0.45s');
		await expect(ripple).not.toHaveClass(/md3-ripple--releasing/);
		await page.mouse.up();
		await expect(searchButton.locator('.md3-ripple')).toHaveCount(0);
	});

	test('reduced motion skips pointer-origin ripple', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const searchButton = page.locator('button[data-open-modal]');
		const box = await searchButton.boundingBox();
		expect(box).not.toBeNull();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
		await page.mouse.down();
		await expect(searchButton.locator('.md3-ripple')).toHaveCount(0);
		await page.mouse.up();
	});

	test('internal navigation gets a short pending state before route change', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const link = page.locator('.sidebar-content a[href="/guides/implementation-plan/"]').first();
		const clickResult = await link.evaluate((element) => {
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				button: 0,
			});
			element.dispatchEvent(event);
			return {
				defaultPrevented: event.defaultPrevented,
				className: element.className,
				routeState: document.documentElement.getAttribute('data-md3-route-state'),
				routeFlag: sessionStorage.getItem('md3-route-transition'),
				sidebarRouteFlag: sessionStorage.getItem('md3-sidebar-route-transition'),
			};
		});

		expect(clickResult.defaultPrevented).toBe(true);
		expect(clickResult.className).toContain('md3-navigation-pending');
		expect(clickResult.routeState).toBe('leaving');
		expect(clickResult.routeFlag).toBe('true');
		expect(clickResult.sidebarRouteFlag).toBeNull();
		await page.waitForURL(/\/guides\/implementation-plan\/$/);
		await expect
			.poll(() =>
				page.evaluate(() => ({
					routeState: document.documentElement.getAttribute('data-md3-route-state'),
					routeFlag: sessionStorage.getItem('md3-route-transition'),
					sidebarRouteFlag: sessionStorage.getItem('md3-sidebar-route-transition'),
				})),
			)
			.toEqual({
				routeState: null,
				routeFlag: null,
				sidebarRouteFlag: null,
			});
	});

	test('homepage CTA uses the same content-only route transition', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/');
		await page.locator('main').waitFor({ state: 'visible' });

		const link = page.locator('.sl-link-button[href$="guides/theme-concept/"]').first();
		const clickResult = await link.evaluate((element) => {
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				button: 0,
			});
			element.dispatchEvent(event);
			return {
				defaultPrevented: event.defaultPrevented,
				className: element.className,
				routeState: document.documentElement.getAttribute('data-md3-route-state'),
				routeFlag: sessionStorage.getItem('md3-route-transition'),
				sidebarRouteFlag: sessionStorage.getItem('md3-sidebar-route-transition'),
			};
		});

		expect(clickResult.defaultPrevented).toBe(true);
		expect(clickResult.className).toContain('md3-navigation-pending');
		expect(clickResult.routeState).toBe('leaving');
		expect(clickResult.routeFlag).toBe('true');
		expect(clickResult.sidebarRouteFlag).toBe('true');
		await page.waitForURL(/\/guides\/theme-concept\/$/);
		await expect
			.poll(() =>
				page.evaluate(() => ({
					routeState: document.documentElement.getAttribute('data-md3-route-state'),
					routeFlag: sessionStorage.getItem('md3-route-transition'),
					sidebarRouteFlag: sessionStorage.getItem('md3-sidebar-route-transition'),
				})),
			)
			.toEqual({
				routeState: null,
				routeFlag: null,
				sidebarRouteFlag: null,
			});
	});

	test('desktop sidebar enters only for hero-to-docs layout changes', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-concept/');
		await expect(page.locator('#starlight__sidebar')).toBeVisible();

		const sidebarMotion = await page.locator('#starlight__sidebar').evaluate((element) => {
			document.documentElement.setAttribute('data-md3-route-state', 'entering');
			const genericRouteStyles = getComputedStyle(element);
			const genericRouteOpacity = genericRouteStyles.opacity;
			const genericRouteTransform = genericRouteStyles.transform;
			document.documentElement.setAttribute('data-md3-sidebar-route-state', 'entering');
			let styles = getComputedStyle(element);
			const transitionProperty = styles.transitionProperty;
			element.style.transition = 'none';
			element.getBoundingClientRect();
			styles = getComputedStyle(element);
			const result = {
				genericRouteOpacity,
				genericRouteTransform,
				opacity: styles.opacity,
				transform: styles.transform,
				transitionProperty,
			};
			element.style.removeProperty('transition');
			document.documentElement.removeAttribute('data-md3-route-state');
			document.documentElement.removeAttribute('data-md3-sidebar-route-state');
			return result;
		});

		expect(sidebarMotion.genericRouteOpacity).toBe('1');
		expect(sidebarMotion.genericRouteTransform).toBe('none');
		expect(sidebarMotion.opacity).toBe('0');
		expect(sidebarMotion.transform).not.toBe('none');
		expect(sidebarMotion.transitionProperty).toContain('opacity');
		expect(sidebarMotion.transitionProperty).toContain('transform');
	});

	test('homepage hero uses restrained MD3 entrance motion on navigation', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/');
		await page.locator('main').waitFor({ state: 'visible' });

		const heroMotion = await page.locator('.hero h1').evaluate((element) => {
			const styles = getComputedStyle(element);
			return {
				animationDelay: styles.animationDelay,
				animationDuration: styles.animationDuration,
				animationFillMode: styles.animationFillMode,
				animationName: styles.animationName,
			};
		});
		expect(heroMotion.animationName).toBe('md3-home-hero-enter');
		expect(heroMotion.animationDuration).toBe('0.5s');
		expect(heroMotion.animationFillMode).toBe('both');
		expect(heroMotion.animationDelay).toBe('0s');

		const surfaceMotion = await page
			.locator('.card')
			.first()
			.evaluate((element) => {
				const styles = getComputedStyle(element);
				return {
					animationDelay: styles.animationDelay,
					animationDuration: styles.animationDuration,
					animationFillMode: styles.animationFillMode,
					animationName: styles.animationName,
				};
			});
		expect(surfaceMotion.animationName).toBe('md3-home-surface-enter');
		expect(surfaceMotion.animationDuration).toBe('0.5s');
		expect(surfaceMotion.animationFillMode).toBe('both');
		expect(surfaceMotion.animationDelay).toBe('0.1s');

		await page.goto('/guides/theme-concept/');
		await page.locator('h1#_top').waitFor({ state: 'visible' });
		const docPageAnimation = await page
			.locator('h1#_top')
			.evaluate((element) => getComputedStyle(element).animationName);
		expect(docPageAnimation).not.toBe('md3-home-hero-enter');
	});
});

test.describe('Theme transient states', () => {
	for (const theme of themes) {
		test(`search field uses theme-specific filled surface in ${theme} mode`, async ({ page }) => {
			await setThemeBeforeNavigation(page, theme);
			await page.goto('/guides/theme-lab/');
			await settlePage(page, theme);

			const colors = await page.locator('button[data-open-modal]').evaluate((element) => {
				const rootStyles = getComputedStyle(document.documentElement);
				const probe = document.createElement('span');
				probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-high').trim();
				document.body.append(probe);
				const expectedBackgroundColor = getComputedStyle(probe).backgroundColor;
				probe.style.backgroundColor = rootStyles.getPropertyValue('--md3-comp-search-field-key-container-color').trim();
				const expectedKeyBackgroundColor = getComputedStyle(probe).backgroundColor;
				probe.remove();
				const styles = getComputedStyle(element);
				const stateLayer = getComputedStyle(element, '::after');
				const icon = element.querySelector('svg');
				const key = element.querySelector('kbd');
				return {
					backgroundColor: styles.backgroundColor,
					borderTopWidth: styles.borderTopWidth,
					boxShadow: styles.boxShadow,
					columnGap: styles.columnGap,
					fontSize: styles.fontSize,
					iconBlockSize: icon instanceof Element ? getComputedStyle(icon).blockSize : '',
					iconInlineSize: icon instanceof Element ? getComputedStyle(icon).inlineSize : '',
					keyBackgroundColor: key instanceof HTMLElement ? getComputedStyle(key).backgroundColor : '',
					keyBorderRadius: key instanceof HTMLElement ? getComputedStyle(key).borderRadius : '',
					lineHeight: styles.lineHeight,
					minBlockSize: styles.minBlockSize,
					paddingInlineEnd: styles.paddingInlineEnd,
					paddingInlineStart: styles.paddingInlineStart,
					stateLayerBackgroundColor: stateLayer.backgroundColor,
					stateLayerOpacity: stateLayer.opacity,
					expectedBackgroundColor,
					expectedKeyBackgroundColor,
				};
			});

			expect(colors.backgroundColor).toBe(colors.expectedBackgroundColor);
			expect(colors.borderTopWidth).toBe('0px');
			expect(colors.boxShadow).toBe('none');
			expect(colors.iconInlineSize).toBe('24px');
			expect(colors.iconBlockSize).toBe('24px');
			expect(colors.keyBackgroundColor).toBe(colors.expectedKeyBackgroundColor);
			expect(colors.keyBorderRadius).toBe('4px');
			expect(colors.minBlockSize).toBe('40px');
			expect(colors.fontSize).toBe('14px');
			expect(colors.lineHeight).toBe('20px');
			expect(colors.columnGap).toBe('8px');
			expect(colors.paddingInlineStart).toBe('12px');
			expect(colors.paddingInlineEnd).toBe('16px');
			expect(colors.stateLayerOpacity).toBe('0');
			expect(colors.stateLayerBackgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		});
	}

	test('search field uses an MD3 state layer instead of swapping container colors', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('button[data-open-modal]').waitFor({ state: 'visible' });

		const searchButton = page.locator('button[data-open-modal]');
		const rest = await searchButton.evaluate((element) => ({
			backgroundColor: getComputedStyle(element).backgroundColor,
			stateLayerOpacity: getComputedStyle(element, '::after').opacity,
		}));
		await searchButton.hover();
		const hover = await searchButton.evaluate((element) => ({
			backgroundColor: getComputedStyle(element).backgroundColor,
			stateLayerOpacity: getComputedStyle(element, '::after').opacity,
		}));

		expect(rest.stateLayerOpacity).toBe('0');
		expect(hover.backgroundColor).toBe(rest.backgroundColor);
		expect(Number.parseFloat(hover.stateLayerOpacity)).toBeGreaterThan(0);
		expect(Number.parseFloat(hover.stateLayerOpacity)).toBeLessThanOrEqual(0.08);
	});

	test('search loading state keeps stable colors', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const searchButton = page.locator('button[data-open-modal]');
		const enabledColors = await getSearchButtonColors(searchButton);
		const disabledColors = await searchButton.evaluate((element) => {
			(element as HTMLButtonElement).disabled = true;
			const styles = getComputedStyle(element);
			return {
				backgroundColor: styles.backgroundColor,
				borderColor: styles.borderColor,
				color: styles.color,
				opacity: styles.opacity,
			};
		});

		expect(disabledColors).toEqual(enabledColors);
	});
});

test.describe('Theme MD3 component contracts', () => {
	test('desktop search field uses the same top app bar anchor on homepage and docs pages', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'desktop')!.size);
		await setThemeBeforeNavigation(page, 'light');

		await page.goto('/');
		await page.locator('button[data-open-modal]').waitFor({ state: 'visible' });
		const homeSearchX = await page
			.locator('button[data-open-modal]')
			.evaluate((element) => Math.round(element.getBoundingClientRect().x));

		await page.goto('/guides/theme-concept/');
		await page.locator('button[data-open-modal]').waitFor({ state: 'visible' });
		const docsSearchX = await page
			.locator('button[data-open-modal]')
			.evaluate((element) => Math.round(element.getBoundingClientRect().x));

		expect(homeSearchX).toBe(docsSearchX);
		expect(docsSearchX).toBe(328);
	});

	test('demo seed uses a balanced Material You color relationship', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/');
		await page.locator('main').waitFor({ state: 'visible' });

		const lightRoles = await page.locator('html').evaluate((element) => {
			const styles = getComputedStyle(element);
			const activeNav = document.querySelector('.md3-mini-nav .active');
			if (!(activeNav instanceof HTMLElement)) throw new Error('Expected active navigation demo item.');
			const activeNavStyles = getComputedStyle(activeNav);
			return {
				primary: styles.getPropertyValue('--md-sys-color-primary').trim(),
				secondary: styles.getPropertyValue('--md-sys-color-secondary').trim(),
				tertiary: styles.getPropertyValue('--md-sys-color-tertiary').trim(),
				navSelectedContainer: styles.getPropertyValue('--md3-comp-nav-item-selected-container-color').trim(),
				navSelectedLabel: styles.getPropertyValue('--md3-comp-nav-item-selected-label-color').trim(),
				activeNavBackgroundColor: activeNavStyles.backgroundColor,
				secondaryContainer: styles.getPropertyValue('--md-sys-color-secondary-container').trim(),
				onSecondaryContainer: styles.getPropertyValue('--md-sys-color-on-secondary-container').trim(),
			};
		});
		expect(lightRoles.primary).toBe('#006a62');
		expect(lightRoles.secondary).toBe('#4a6360');
		expect(lightRoles.tertiary).toBe('#47617a');
		expect(lightRoles.navSelectedContainer).toBe(lightRoles.secondaryContainer);
		expect(lightRoles.navSelectedLabel).toBe('#051f1d');
		expect(lightRoles.activeNavBackgroundColor).not.toBe('rgb(114, 247, 233)');
		expect(lightRoles.secondaryContainer).toBe('#cce8e3');
		expect(lightRoles.onSecondaryContainer).toBe('#051f1d');

		await setThemeBeforeNavigation(page, 'dark');
		await page.reload();
		await page.locator('main').waitFor({ state: 'visible' });
		const darkRoles = await page.locator('html').evaluate((element) => {
			const styles = getComputedStyle(element);
			return {
				primary: styles.getPropertyValue('--md-sys-color-primary').trim(),
				surface: styles.getPropertyValue('--md-sys-color-surface').trim(),
				surfaceContainerLow: styles.getPropertyValue('--md-sys-color-surface-container-low').trim(),
			};
		});
		expect(darkRoles.primary).toBe('#51dbcd');
		expect(darkRoles.surface).toBe('#101413');
		expect(darkRoles.surfaceContainerLow).toBe('#191c1c');
	});

	test('homepage cards use compact MD3 title and body rhythm', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/');
		await page.locator('main').waitFor({ state: 'visible' });

		const cardContract = await page
			.locator('.card')
			.first()
			.evaluate((card) => {
				const title = card.querySelector('.title');
				const body = card.querySelector('.body');
				const icon = card.querySelector('.icon');
				if (!title || !body || !icon) throw new Error('Expected Starlight card title, body, and icon elements.');

				const cardStyles = getComputedStyle(card);
				const titleStyles = getComputedStyle(title);
				const bodyStyles = getComputedStyle(body);
				const iconStyles = getComputedStyle(icon);
				return {
					borderColor: cardStyles.borderColor,
					display: cardStyles.display,
					flexDirection: cardStyles.flexDirection,
					gap: cardStyles.gap,
					iconBlockSize: iconStyles.blockSize,
					iconBorderColor: iconStyles.borderColor,
					iconInlineSize: iconStyles.inlineSize,
					iconPadding: iconStyles.paddingBlockStart,
					iconBackgroundColor: iconStyles.backgroundColor,
					titleFontWeight: titleStyles.fontWeight,
					titleGap: titleStyles.gap,
					titleMarginBlockEnd: titleStyles.marginBlockEnd,
					titleMarginBlockStart: titleStyles.marginBlockStart,
					bodyMarginBlockEnd: bodyStyles.marginBlockEnd,
					bodyMarginInlineStart: bodyStyles.marginInlineStart,
					bodyMarginBlockStart: bodyStyles.marginBlockStart,
				};
			});

		expect(cardContract.borderColor).toBe('rgba(0, 0, 0, 0)');
		expect(cardContract.display).toBe('flex');
		expect(cardContract.flexDirection).toBe('column');
		expect(cardContract.gap).toBe('12px');
		expect(cardContract.iconInlineSize).toBe('40px');
		expect(cardContract.iconBlockSize).toBe('40px');
		expect(cardContract.iconPadding).toBe('8px');
		expect(cardContract.iconBorderColor).toBe('rgba(0, 0, 0, 0)');
		expect(cardContract.iconBackgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(cardContract.titleFontWeight).toBe('500');
		expect(cardContract.titleGap).toBe('12px');
		expect(cardContract.titleMarginBlockStart).toBe('0px');
		expect(cardContract.titleMarginBlockEnd).toBe('0px');
		expect(cardContract.bodyMarginBlockStart).toBe('0px');
		expect(cardContract.bodyMarginBlockEnd).toBe('0px');
		expect(cardContract.bodyMarginInlineStart).toBe('52px');
	});

	test('demo panels use filled MD3 surfaces instead of outlined cards', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/');
		await page.locator('main').waitFor({ state: 'visible' });

		const panelContract = await page
			.locator('.md3-showcase-panel')
			.first()
			.evaluate((panel) => {
				const styles = getComputedStyle(panel);
				const probe = document.createElement('span');
				const rootStyles = getComputedStyle(document.documentElement);
				probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container').trim();
				document.body.append(probe);
				const expectedBackgroundColor = getComputedStyle(probe).backgroundColor;
				probe.remove();
				return {
					backgroundColor: styles.backgroundColor,
					borderColor: styles.borderColor,
					expectedBackgroundColor,
				};
			});

		expect(panelContract.backgroundColor).toBe(panelContract.expectedBackgroundColor);
		expect(panelContract.borderColor).toBe('rgba(0, 0, 0, 0)');
	});

	test('layout uses tonal surfaces before hard divider lines', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const layoutContract = await page.evaluate(() => {
			const header = document.querySelector('.page > .header');
			const contentDivider = document.querySelector('.content-panel + .content-panel');
			const contentPanel = document.querySelector('main > .content-panel');
			const pageElement = document.querySelector('.page');
			const sidebar = document.querySelector('.sidebar-pane');
			if (
				!(header instanceof HTMLElement) ||
				!(contentDivider instanceof HTMLElement) ||
				!(contentPanel instanceof HTMLElement) ||
				!(pageElement instanceof HTMLElement) ||
				!(sidebar instanceof HTMLElement)
			) {
				throw new Error('Expected Starlight shell, header, sidebar, and content panels.');
			}

			const headerStyles = getComputedStyle(header);
			const contentPanelStyles = getComputedStyle(contentPanel);
			const contentStyles = getComputedStyle(contentDivider);
			const pageStyles = getComputedStyle(pageElement);
			const sidebarStyles = getComputedStyle(sidebar);
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface').trim();
			const resolvedSurfaceColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-lowest').trim();
			const resolvedSurfaceContainerLowestColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-low').trim();
			const resolvedSurfaceContainerLowColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container').trim();
			const resolvedSurfaceContainerColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				contentBackgroundColor: contentPanelStyles.backgroundColor,
				contentBorderTopColor: contentStyles.borderTopColor,
				headerBackgroundColor: headerStyles.backgroundColor,
				headerBorderBottomColor: headerStyles.borderBottomColor,
				headerBoxShadow: headerStyles.boxShadow,
				pageBackgroundColor: pageStyles.backgroundColor,
				resolvedSurfaceColor,
				resolvedSurfaceContainerLowestColor,
				resolvedSurfaceContainerLowColor,
				resolvedSurfaceContainerColor,
				sidebarBackgroundColor: sidebarStyles.backgroundColor,
				sidebarBorderInlineEndColor: sidebarStyles.borderInlineEndColor,
			};
		});

		expect(layoutContract.pageBackgroundColor).toBe(layoutContract.resolvedSurfaceContainerLowestColor);
		expect(layoutContract.contentBackgroundColor).toBe(layoutContract.resolvedSurfaceColor);
		expect(layoutContract.headerBackgroundColor).toBe(layoutContract.resolvedSurfaceContainerColor);
		expect(layoutContract.sidebarBackgroundColor).toBe(layoutContract.resolvedSurfaceContainerLowColor);
		expect(layoutContract.sidebarBackgroundColor).not.toBe(layoutContract.headerBackgroundColor);
		expect(layoutContract.headerBorderBottomColor).toBe('rgba(0, 0, 0, 0)');
		expect(layoutContract.headerBoxShadow).toBe('none');
		expect(layoutContract.contentBorderTopColor).toBe('rgba(0, 0, 0, 0)');
		expect(layoutContract.sidebarBorderInlineEndColor).toBe('rgba(0, 0, 0, 0)');
	});

	test('dark top app bar uses a crisp MD3 container hierarchy', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const hierarchy = await page.evaluate(() => {
			const header = document.querySelector('.page > .header');
			const contentPanel = document.querySelector('main > .content-panel');
			const pageElement = document.querySelector('.page');
			const search = document.querySelector('button[data-open-modal]');
			if (
				!(header instanceof HTMLElement) ||
				!(contentPanel instanceof HTMLElement) ||
				!(pageElement instanceof HTMLElement) ||
				!(search instanceof HTMLElement)
			) {
				throw new Error('Expected top app bar, page shell, content sheet, and search field.');
			}

			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface').trim();
			const resolvedSurfaceColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-lowest').trim();
			const resolvedSurfaceContainerLowestColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container').trim();
			const resolvedSurfaceContainerColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-high').trim();
			const resolvedSurfaceContainerHighColor = getComputedStyle(probe).backgroundColor;
			probe.remove();

			return {
				contentBackgroundColor: getComputedStyle(contentPanel).backgroundColor,
				headerBackgroundColor: getComputedStyle(header).backgroundColor,
				pageBackgroundColor: getComputedStyle(pageElement).backgroundColor,
				resolvedSurfaceColor,
				resolvedSurfaceContainerLowestColor,
				resolvedSurfaceContainerColor,
				resolvedSurfaceContainerHighColor,
				searchBackgroundColor: getComputedStyle(search).backgroundColor,
			};
		});

		expect(hierarchy.pageBackgroundColor).toBe(hierarchy.resolvedSurfaceContainerLowestColor);
		expect(hierarchy.contentBackgroundColor).toBe(hierarchy.resolvedSurfaceColor);
		expect(hierarchy.headerBackgroundColor).toBe(hierarchy.resolvedSurfaceContainerColor);
		expect(hierarchy.searchBackgroundColor).toBe(hierarchy.resolvedSurfaceContainerHighColor);
	});

	test('chrome typography keeps a quiet MD3 hierarchy', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const typography = await page.evaluate(() => {
			const siteTitle = document.querySelector('.site-title');
			const activeNav = document.querySelector('.sidebar-content [aria-current="page"]');
			const tocTitle = document.querySelector('starlight-toc h2');
			if (
				!(siteTitle instanceof HTMLElement) ||
				!(activeNav instanceof HTMLElement) ||
				!(tocTitle instanceof HTMLElement)
			) {
				throw new Error('Expected site title, active sidebar link, and TOC heading.');
			}

			return {
				activeNavWeight: getComputedStyle(activeNav).fontWeight,
				siteTitleWeight: getComputedStyle(siteTitle).fontWeight,
				tocTitleWeight: getComputedStyle(tocTitle).fontWeight,
			};
		});

		expect(typography.siteTitleWeight).toBe('500');
		expect(typography.activeNavWeight).toBe('500');
		expect(typography.tocTitleWeight).toBe('500');
	});

	test('TOC active marker uses a single floating tracker', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await settlePage(page, 'light');

		const activeTocLink = page.locator('starlight-toc a[aria-current="true"]').first();
		await expect(activeTocLink).toBeVisible();
		const tocNav = page.locator('starlight-toc nav').first();
		await expect(tocNav).toHaveAttribute('data-md3-toc-tracker', 'true');

		const marker = await tocNav.evaluate((element) => {
			const styles = getComputedStyle(element, '::before');
			const matrix = new DOMMatrixReadOnly(styles.transform);
			const activeLink = element.querySelector('a[aria-current="true"]');
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-primary').trim();
			const resolvedPrimaryColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				inlineStart: styles.insetInlineStart,
				activeLinkColor: activeLink instanceof HTMLElement ? getComputedStyle(activeLink).color : '',
				backgroundColor: styles.backgroundColor,
				height: styles.blockSize,
				linkMarkerContent:
					activeLink instanceof HTMLElement ? getComputedStyle(activeLink, '::before').content : '',
				linkMarkerDisplay:
					activeLink instanceof HTMLElement ? getComputedStyle(activeLink, '::before').display : '',
				opacity: styles.opacity,
				resolvedPrimaryColor,
				translateY: matrix.m42,
				width: styles.inlineSize,
			};
		});

		expect(marker.inlineStart).toBe('3px');
		expect(marker.opacity).toBe('1');
		expect(marker.height).toBe('16px');
		expect(marker.translateY).toBeGreaterThanOrEqual(0);
		expect(marker.width).toBe('4px');
		expect(marker.backgroundColor).toBe(marker.resolvedPrimaryColor);
		expect(marker.activeLinkColor).toBe(marker.resolvedPrimaryColor);
		expect(marker.linkMarkerContent).toBe('none');
		expect(marker.linkMarkerDisplay).toBe('none');
	});

	test('TOC selects the final heading at the page bottom', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await settlePage(page, 'light');

		await page.evaluate(() => {
			const scrollingElement = document.scrollingElement || document.documentElement;
			scrollingElement.scrollTop = scrollingElement.scrollHeight;
		});
		await page.waitForTimeout(150);

		await expect
			.poll(() =>
				page
					.locator('starlight-toc a[aria-current="true"]')
					.evaluateAll((links) => links.map((link) => link.textContent?.trim())),
			)
			.toEqual(['Final Scrollspy Check']);

		const bottomMarker = await page.locator('starlight-toc nav').first().evaluate((element) => {
			const styles = getComputedStyle(element, '::before');
			const matrix = new DOMMatrixReadOnly(styles.transform);
			const activeLink = element.querySelector('a[aria-current="true"]');
			return {
				activeText: activeLink?.textContent?.trim() ?? '',
				linkMarkerContent:
					activeLink instanceof HTMLElement ? getComputedStyle(activeLink, '::before').content : '',
				linkMarkerDisplay:
					activeLink instanceof HTMLElement ? getComputedStyle(activeLink, '::before').display : '',
				opacity: styles.opacity,
				translateY: matrix.m42,
			};
		});
		expect(bottomMarker.activeText).toBe('Final Scrollspy Check');
		expect(bottomMarker.opacity).toBe('1');
		expect(bottomMarker.translateY).toBeGreaterThan(0);
		expect(bottomMarker.linkMarkerContent).toBe('none');
		expect(bottomMarker.linkMarkerDisplay).toBe('none');
	});

	test('mobile TOC selects the final heading at the page bottom', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'mobile')!.size);
		await setThemeBeforeNavigation(page, 'light');

		for (const scenario of [
			{ path: '/guides/component-samples/', expected: 'Blockquote' },
			{ path: '/reference/plugin-options/', expected: 'experimentalComponents' },
			{ path: '/guides/theme-lab/', expected: 'Final Scrollspy Check' },
		]) {
			await page.goto(scenario.path);
			await page.locator('main').waitFor({ state: 'visible' });
			await page.evaluate(() => {
				const scrollingElement = document.scrollingElement || document.documentElement;
				scrollingElement.scrollTop = scrollingElement.scrollHeight;
			});
			await page.waitForTimeout(180);

			const contract = await page.locator('#starlight__mobile-toc').evaluate((details) => {
				const active =
					details.querySelector('.dropdown a[aria-current="true"]') ??
					details.querySelector('.dropdown a[aria-current="page"]');
				const current = details.querySelector('.display-current');
				const links = [...details.querySelectorAll('.dropdown a[href]')];
				return {
					activeText: active?.textContent?.trim() ?? '',
					currentText: current?.textContent?.trim() ?? '',
					lastText: links.at(-1)?.textContent?.trim() ?? '',
				};
			});

			expect(contract.lastText).toBe(scenario.expected);
			expect(contract.activeText).toBe(scenario.expected);
			expect(contract.currentText).toBe(scenario.expected);
		}
	});

	test('TOC tracker stays aligned with the active item after wheel scrolling', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'desktop')!.size);
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-concept/');
		await settlePage(page, 'light');

		await page.mouse.move(1180, 480);
		for (let index = 0; index < 24; index++) {
			await page.mouse.wheel(0, 260);
			await page.waitForTimeout(25);
		}
		await page.waitForTimeout(350);

		await expect
			.poll(() =>
				page
					.locator('starlight-toc a[aria-current="true"]')
					.evaluateAll((links) => links.map((link) => link.textContent?.trim())),
			)
			.toEqual(['Reusable Package Surface']);

		const tracker = await page.locator('starlight-toc nav').first().evaluate((element) => {
			const styles = getComputedStyle(element, '::before');
			const matrix = new DOMMatrixReadOnly(styles.transform);
			const activeLink = element.querySelector('a[aria-current="true"]');
			if (!(activeLink instanceof HTMLElement)) {
				throw new Error('Expected an active TOC link.');
			}
			const navRect = element.getBoundingClientRect();
			const activeRect = activeLink.getBoundingClientRect();
			const indicatorBlockSize = Number.parseFloat(styles.blockSize);
			const expectedY =
				activeRect.top - navRect.top + Math.max(0, (activeRect.height - indicatorBlockSize) / 2);
			return {
				activeText: activeLink.textContent?.trim() ?? '',
				actualY: matrix.m42,
				expectedY,
				opacity: styles.opacity,
			};
		});

		expect(tracker.activeText).toBe('Reusable Package Surface');
		expect(tracker.opacity).toBe('1');
		expect(Math.abs(tracker.actualY - tracker.expectedY)).toBeLessThanOrEqual(1);
	});

	test('search dialog opens as an MD3 scrim surface without backdrop blur', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		await page.locator('button[data-open-modal]').click();
		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();
		await page.waitForTimeout(350);

		const contract = await dialog.evaluate((element) => {
			const styles = getComputedStyle(element);
			const backdrop = getComputedStyle(element, '::backdrop');
			const frame = element.querySelector('.dialog-frame');
			const frameStyles = frame instanceof HTMLElement ? getComputedStyle(frame) : null;
			const matrix = new DOMMatrixReadOnly(styles.transform);
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md3-comp-dialog-scrim-color').trim();
			const expectedBackdropBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-high').trim();
			const expectedFrameBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				backdropFilter: backdrop.backdropFilter,
				backdropBackgroundColor: backdrop.backgroundColor,
				borderTopWidth: styles.borderTopWidth,
				expectedBackdropBackgroundColor,
				expectedFrameBackgroundColor,
				frameBackgroundColor: frameStyles?.backgroundColor ?? '',
				frameBorderRadius: frameStyles?.borderRadius ?? '',
				opacity: styles.opacity,
				scaleX: matrix.a,
				scaleY: matrix.d,
				transitionDuration: styles.transitionDuration,
				transitionProperty: styles.transitionProperty,
				translateY: matrix.f,
				webkitBackdropFilter: backdrop.getPropertyValue('-webkit-backdrop-filter'),
			};
		});

		expect(contract.backdropFilter).toBe('none');
		expect(contract.webkitBackdropFilter === '' || contract.webkitBackdropFilter === 'none').toBe(true);
		expect(contract.backdropBackgroundColor).toBe(contract.expectedBackdropBackgroundColor);
		expect(contract.borderTopWidth).toBe('1px');
		expect(contract.frameBackgroundColor).toBe(contract.expectedFrameBackgroundColor);
		expect(contract.frameBorderRadius).toBe('28px');
		expect(contract.opacity).toBe('1');
		expect(contract.scaleX).toBeCloseTo(1, 3);
		expect(contract.scaleY).toBeCloseTo(1, 3);
		expect(contract.translateY).toBeCloseTo(0, 3);
		expect(contract.transitionDuration).toContain('0.15s');
		expect(contract.transitionDuration).toContain('0.3s');
		expect(contract.transitionProperty).toContain('opacity');
		expect(contract.transitionProperty).toContain('transform');
	});

	test('search dialog Pagefind internals use MD3 search and list styling', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		await page.locator('button[data-open-modal]').click();
		const dialog = page.locator('dialog[open]');
		await expect(dialog).toBeVisible();
		await dialog.evaluate((element) => {
			const frame = element.querySelector('.dialog-frame');
			if (!(frame instanceof HTMLElement)) {
				throw new Error('Expected search dialog frame.');
			}
			frame.innerHTML = `
				<div id="starlight__search">
					<div class="pagefind-ui">
						<form class="pagefind-ui__form">
							<input class="pagefind-ui__search-input" placeholder="Search" value="theme" />
							<button class="pagefind-ui__search-clear" type="button">Clear</button>
							<div class="pagefind-ui__drawer">
								<div class="pagefind-ui__results-area">
									<p class="pagefind-ui__message">2 results for theme</p>
									<ol class="pagefind-ui__results">
										<li class="pagefind-ui__result">
											<div class="pagefind-ui__result-inner">
												<p class="pagefind-ui__result-title">
													<a class="pagefind-ui__result-link" href="#">Theme Lab</a>
												</p>
												<div class="pagefind-ui__result-nested">
													<p class="pagefind-ui__result-title">
														<a class="pagefind-ui__result-link" href="#">Code Blocks</a>
													</p>
													<p class="pagefind-ui__result-excerpt">
														Use <mark>theme</mark> tokens without a runtime component.
													</p>
												</div>
											</div>
										</li>
									</ol>
									<button class="pagefind-ui__button" type="button">Load more</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			`;
		});

		const contract = await dialog.evaluate((element) => {
				const rootStyles = getComputedStyle(document.documentElement);
				const probe = document.createElement('span');
				document.body.append(probe);
				const resolveColor = (token: string) => {
					probe.style.backgroundColor = rootStyles.getPropertyValue(token).trim();
					return getComputedStyle(probe).backgroundColor;
				};
				const form = element.querySelector<HTMLFormElement>('.pagefind-ui__form');
				const input = element.querySelector<HTMLInputElement>('.pagefind-ui__search-input');
				const clear = element.querySelector<HTMLButtonElement>('.pagefind-ui__search-clear');
				const result = element.querySelector<HTMLElement>('.pagefind-ui__result');
				const resultInner = element.querySelector<HTMLElement>('.pagefind-ui__result-inner');
				const nested = element.querySelector<HTMLElement>('.pagefind-ui__result-nested');
				const nestedLink = nested?.querySelector<HTMLAnchorElement>('.pagefind-ui__result-link');
				const title = element.querySelector<HTMLElement>('.pagefind-ui__result-title');
				const link = element.querySelector<HTMLElement>('.pagefind-ui__result-link');
				const excerpt = element.querySelector<HTMLElement>('.pagefind-ui__result-excerpt');
				const mark = element.querySelector<HTMLElement>('mark');
				const button = element.querySelector<HTMLButtonElement>('.pagefind-ui__button');
				const message = element.querySelector<HTMLElement>('.pagefind-ui__message');
				if (
					!form ||
					!input ||
					!clear ||
					!result ||
					!resultInner ||
					!nested ||
					!nestedLink ||
					!title ||
					!link ||
					!excerpt ||
					!mark ||
					!button ||
					!message
				) {
					throw new Error('Expected the synthetic Pagefind fixture to be complete.');
				}
				nestedLink.focus({ preventScroll: true });
				const formBeforeStyles = getComputedStyle(form, '::before');
				const inputStyles = getComputedStyle(input);
				const clearStyles = getComputedStyle(clear);
				const clearBeforeStyles = getComputedStyle(clear, '::before');
				const titleBeforeStyles = getComputedStyle(title, '::before');
				const nestedBeforeStyles = getComputedStyle(nested, '::before');
				const resultStyles = getComputedStyle(result);
				const resultInnerStyles = getComputedStyle(resultInner);
				const nestedStyles = getComputedStyle(nested);
				const titleStyles = getComputedStyle(title);
				const linkStyles = getComputedStyle(link);
				const excerptStyles = getComputedStyle(excerpt);
				const markStyles = getComputedStyle(mark);
				const buttonStyles = getComputedStyle(button);
				const messageStyles = getComputedStyle(message);
				const expected = {
					searchContainer: resolveColor('--md-sys-color-surface-container-highest'),
					resultContainer: resolveColor('--md-sys-color-surface-container'),
					nestedContainer: resolveColor('--md-sys-color-surface-container-high'),
					markContainer: (() => {
						probe.style.backgroundColor = `color-mix(
							in srgb,
							${rootStyles.getPropertyValue('--md-sys-color-primary-container').trim()} 78%,
							${rootStyles.getPropertyValue('--md-sys-color-surface-container-high').trim()}
						)`;
						return getComputedStyle(probe).backgroundColor;
					})(),
					secondaryContainer: resolveColor('--md-sys-color-secondary-container'),
					onSecondaryContainer: (() => {
						probe.style.color = rootStyles.getPropertyValue('--md-sys-color-on-secondary-container').trim();
						return getComputedStyle(probe).color;
					})(),
					onPrimaryContainer: (() => {
						probe.style.color = rootStyles.getPropertyValue('--md-sys-color-on-primary-container').trim();
						return getComputedStyle(probe).color;
					})(),
				};
				probe.remove();
				return {
					buttonBackgroundColor: buttonStyles.backgroundColor,
					buttonBorderRadius: buttonStyles.borderRadius,
					buttonColor: buttonStyles.color,
					clearBeforeBlockSize: clearBeforeStyles.blockSize,
					clearBeforeInlineSize: clearBeforeStyles.inlineSize,
					clearBlockSize: clearStyles.blockSize,
					clearBorderRadius: clearStyles.borderRadius,
					clearFontSize: clearStyles.fontSize,
					clearInsetBlockStart: clearStyles.insetBlockStart,
					clearInsetInlineEnd: clearStyles.insetInlineEnd,
					clearPosition: clearStyles.position,
					excerptColor: excerptStyles.color,
					expected,
					formBeforeBlockSize: formBeforeStyles.blockSize,
					formBeforeContent: formBeforeStyles.content,
					formBeforeDisplay: formBeforeStyles.display,
					formBeforeInlineSize: formBeforeStyles.inlineSize,
					formBeforeMaskPosition: formBeforeStyles.maskPosition,
					formBeforeMaskSize: formBeforeStyles.maskSize,
					inputBackgroundColor: inputStyles.backgroundColor,
					inputBlockSize: inputStyles.blockSize,
					inputBorderRadius: inputStyles.borderRadius,
					inputBorderTopWidth: inputStyles.borderTopWidth,
					linkDisplay: linkStyles.display,
					messageFontSize: messageStyles.fontSize,
					nestedBorderInlineStartWidth: nestedStyles.borderInlineStartWidth,
					nestedBeforeContent: nestedBeforeStyles.content,
					nestedBeforeDisplay: nestedBeforeStyles.display,
					nestedBackgroundColor: nestedStyles.backgroundColor,
					nestedFocusWithin: nested.matches(':focus-within'),
					nestedMarginInlineStart: nestedStyles.marginInlineStart,
					nestedOutlineStyle: nestedStyles.outlineStyle,
					nestedOutlineWidth: nestedStyles.outlineWidth,
					resultBackgroundColor: resultStyles.backgroundColor,
					resultBorderTopWidth: resultStyles.borderTopWidth,
					resultInnerBackgroundColor: resultInnerStyles.backgroundColor,
					resultInnerBorderRadius: resultInnerStyles.borderRadius,
					titleBeforeContent: titleBeforeStyles.content,
					titleBeforeDisplay: titleBeforeStyles.display,
					titleFontSize: titleStyles.fontSize,
					titleFontWeight: titleStyles.fontWeight,
					markBackgroundColor: markStyles.backgroundColor,
					markColor: markStyles.color,
				};
		});

		expect(contract.inputBackgroundColor).toBe(contract.expected.searchContainer);
			expect(contract.inputBlockSize).toBe('56px');
			expect(contract.inputBorderTopWidth).toBe('0px');
			expect(Number.parseFloat(contract.inputBorderRadius)).toBeGreaterThan(1000);
			expect(contract.formBeforeContent).toBe('""');
			expect(contract.formBeforeDisplay).toBe('block');
			expect(contract.formBeforeBlockSize).toBe('24px');
			expect(contract.formBeforeInlineSize).toBe('24px');
			expect(contract.formBeforeMaskPosition).toBe('50% 50%');
			expect(contract.formBeforeMaskSize).toBe('24px 24px');
			expect(contract.clearBlockSize).toBe('40px');
			expect(contract.clearBeforeBlockSize).toBe('24px');
			expect(contract.clearBeforeInlineSize).toBe('24px');
			expect(Number.parseFloat(contract.clearBorderRadius)).toBeGreaterThan(1000);
			expect(contract.clearFontSize).toBe('0px');
			expect(contract.clearPosition).toBe('absolute');
			expect(contract.clearInsetBlockStart).toBe('8px');
			expect(contract.clearInsetInlineEnd).toBe('8px');
			expect(contract.resultBackgroundColor).toBe('rgba(0, 0, 0, 0)');
			expect(contract.resultInnerBackgroundColor).toBe(contract.expected.resultContainer);
			expect(Number.parseFloat(contract.resultInnerBorderRadius)).toBeGreaterThanOrEqual(14);
			expect(contract.resultBorderTopWidth).toBe('0px');
			expect(contract.linkDisplay).toBe('block');
			expect(contract.titleFontSize).toBe('16px');
			expect(contract.titleFontWeight).toBe('500');
			expect(contract.titleBeforeContent).toBe('none');
			expect(contract.titleBeforeDisplay).toBe('none');
			expect(contract.messageFontSize).toBe('14px');
			expect(contract.nestedBackgroundColor).toBe(contract.expected.nestedContainer);
			expect(contract.nestedBorderInlineStartWidth).toBe('0px');
			expect(contract.nestedBeforeContent).toBe('none');
			expect(contract.nestedBeforeDisplay).toBe('none');
			expect(contract.nestedFocusWithin).toBe(true);
			expect(contract.nestedMarginInlineStart).toBe('0px');
			expect(contract.nestedOutlineStyle).toBe('none');
			expect(contract.nestedOutlineWidth).toBe('0px');
			expect(contract.markBackgroundColor).toBe(contract.expected.markContainer);
			expect(contract.markColor).toBe(contract.expected.onPrimaryContainer);
		expect(contract.buttonBackgroundColor).toBe(contract.expected.secondaryContainer);
		expect(contract.buttonColor).toBe(contract.expected.onSecondaryContainer);
		expect(Number.parseFloat(contract.buttonBorderRadius)).toBeGreaterThan(1000);
		expect(contract.excerptColor).not.toBe(contract.markColor);
	});

	test('theme menu uses a quiet MD3 selected state', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const themeButton = page.locator('starlight-theme-select .md3-theme-select__button').first();
		await expect
			.poll(() =>
				themeButton.evaluate(
					(button) =>
						[...button.querySelectorAll('.md3-theme-select__button-icon')].filter(
							(icon) => Number.parseFloat(getComputedStyle(icon).opacity) > 0.99,
						).length,
				),
			)
			.toBe(1);
		const buttonRestContract = await themeButton.evaluate((button) => {
			const styles = getComputedStyle(button);
			return {
				backgroundColor: styles.backgroundColor,
				blockSize: styles.blockSize,
				borderTopWidth: styles.borderTopWidth,
				inlineSize: styles.inlineSize,
				minBlockSize: styles.minBlockSize,
				visibleIcons: [...button.querySelectorAll('.md3-theme-select__button-icon')].filter(
					(icon) => Number.parseFloat(getComputedStyle(icon).opacity) > 0.99,
				).length,
				visibleText: button.textContent?.trim() ?? '',
			};
		});
		expect(buttonRestContract.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(buttonRestContract.blockSize).toBe('40px');
		expect(buttonRestContract.borderTopWidth).toBe('0px');
		expect(Number.parseFloat(buttonRestContract.inlineSize)).toBeGreaterThanOrEqual(108);
		expect(Number.parseFloat(buttonRestContract.minBlockSize)).toBeGreaterThanOrEqual(40);
		expect(buttonRestContract.visibleIcons).toBe(1);
		expect(buttonRestContract.visibleText).toBe('Light');

		await themeButton.click();
		const menu = page.locator('starlight-theme-select .md3-theme-select__menu').first();
		await expect(menu).toBeVisible();
		await expect(menu.locator('.md3-theme-select__check')).toHaveCount(3);
		const selectedOption = menu.locator('[aria-checked="true"]').first();
		const selectedCheck = selectedOption.locator('.md3-theme-select__check');
		await expect(selectedCheck).toHaveCSS('opacity', '1');

		const menuContract = await menu.evaluate((element) => {
			const menuStyles = getComputedStyle(element);
			return {
				borderRadius: menuStyles.borderRadius,
				maxInlineSize: menuStyles.maxInlineSize,
				minInlineSize: menuStyles.minInlineSize,
				paddingBlockEnd: menuStyles.paddingBlockEnd,
				paddingBlockStart: menuStyles.paddingBlockStart,
				paddingInlineEnd: menuStyles.paddingInlineEnd,
				paddingInlineStart: menuStyles.paddingInlineStart,
				transformOrigin: menuStyles.transformOrigin,
				transitionDuration: menuStyles.transitionDuration,
				transitionProperty: menuStyles.transitionProperty,
			};
		});
		const selectedContract = await selectedOption.evaluate((selected) => {
			const selectedStyles = getComputedStyle(selected);
			const menu = selected.closest('.md3-theme-select__menu');
			if (!menu) throw new Error('Expected selected menu item inside the theme menu.');
			const selectedRect = selected.getBoundingClientRect();
			const menuRect = menu.getBoundingClientRect();
			const probe = document.createElement('span');
			const rootStyles = getComputedStyle(document.documentElement);
			probe.style.color = rootStyles.getPropertyValue('--md-sys-color-primary').trim();
			document.body.append(probe);
			const primaryColor = getComputedStyle(probe).color;
			probe.remove();
			return {
				selectedBackgroundColor: selectedStyles.backgroundColor,
				selectedBorderRadius: selectedStyles.borderRadius,
				selectedColor: selectedStyles.color,
				selectedFontWeight: selectedStyles.fontWeight,
				selectedHeight: selectedStyles.blockSize,
				selectedInsetInlineEnd: Math.round(menuRect.right - selectedRect.right),
				selectedInsetInlineStart: Math.round(selectedRect.left - menuRect.left),
				selectedPaddingInlineEnd: selectedStyles.paddingInlineEnd,
				selectedPaddingInlineStart: selectedStyles.paddingInlineStart,
				primaryColor,
			};
		});
		const unselectedWeight = await menu
			.locator('[aria-checked="false"]')
			.first()
			.evaluate((option) => getComputedStyle(option).fontWeight);
		const checkColor = await selectedCheck.evaluate((check) => getComputedStyle(check).color);

		expect(menuContract.borderRadius).toBe('4px');
		expect(menuContract.minInlineSize).toBe('112px');
		expect(menuContract.maxInlineSize).toBe('280px');
		expect(menuContract.paddingBlockStart).toBe('8px');
		expect(menuContract.paddingBlockEnd).toBe('8px');
		expect(menuContract.paddingInlineStart).toBe('0px');
		expect(menuContract.paddingInlineEnd).toBe('0px');
		expect(selectedContract.selectedBackgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(selectedContract.selectedBorderRadius).toBe('0px');
		expect(selectedContract.selectedColor).toBe(selectedContract.primaryColor);
		expect(selectedContract.selectedInsetInlineStart).toBe(1);
		expect(selectedContract.selectedInsetInlineEnd).toBe(1);
		expect(selectedContract.selectedPaddingInlineStart).toBe('16px');
		expect(selectedContract.selectedPaddingInlineEnd).toBe('16px');
		expect(checkColor).toBe(selectedContract.primaryColor);
		expect(selectedContract.selectedFontWeight).toBe('500');
		expect(unselectedWeight).toBe('400');
		expect(Number.parseFloat(selectedContract.selectedHeight)).toBeGreaterThanOrEqual(48);
		expect(menuContract.transformOrigin.split(' ').at(-1)).toBe('0px');
		expect(menuContract.transitionDuration).toContain('0.25s');
		expect(menuContract.transitionProperty).toContain('opacity');
		expect(menuContract.transitionProperty).toContain('transform');

		const closeMotion = await themeButton.evaluate((button) => {
			if (!(button instanceof HTMLButtonElement)) {
				throw new Error('Expected theme menu trigger button.');
			}
			button.click();
			const element = button.closest('starlight-theme-select')?.querySelector<HTMLElement>('.md3-theme-select__menu');
			if (!element) throw new Error('Expected theme menu after closing trigger.');
			const styles = getComputedStyle(element);
			return {
				hidden: element.hasAttribute('hidden'),
				opacity: styles.opacity,
				state: element.dataset.md3MenuState ?? '',
				transitionDuration: styles.transitionDuration,
				transitionProperty: styles.transitionProperty,
			};
		});
		expect(closeMotion.hidden).toBe(false);
		expect(closeMotion.state).toBe('closing');
		expect(closeMotion.transitionDuration).toContain('0.15s');
		expect(closeMotion.transitionProperty).toContain('opacity');
		expect(closeMotion.transitionProperty).toContain('transform');
		await expect(menu).toBeHidden();
	});

	test('mobile top app bar icon buttons use MD3 spacing and state layers', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'mobile')!.size);
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const menuButton = page.locator('starlight-menu-button button');
		const searchButton = page.locator('button[data-open-modal]');
		await expect(menuButton).toBeVisible();
		await expect(searchButton).toBeVisible();

		const contract = await page.evaluate(() => {
			const search = document.querySelector('button[data-open-modal]');
			const menu = document.querySelector('starlight-menu-button button');
			if (!(search instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
				throw new Error('Expected mobile search and menu buttons.');
			}
			const searchBox = search.getBoundingClientRect();
			const menuBox = menu.getBoundingClientRect();
			const searchStyles = getComputedStyle(search);
			const menuStyles = getComputedStyle(menu);
			const searchIcon = search.querySelector('svg');
			const openIcon = menu.querySelector('.open-menu');
			if (!(searchIcon instanceof Element) || !(openIcon instanceof Element)) {
				throw new Error('Expected mobile search and menu icons.');
			}
			const searchIconBox = searchIcon.getBoundingClientRect();
			const menuIconBox = openIcon.getBoundingClientRect();
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-high').trim();
			const expectedButtonBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				expectedButtonBackgroundColor,
				gap: menuBox.left - searchBox.right,
				menuBackgroundColor: menuStyles.backgroundColor,
				menuBlockSize: menuBox.height,
				menuIconBlockSize: menuIconBox.height,
				menuIconInlineSize: menuIconBox.width,
				menuInlineSize: menuBox.width,
				menuTransitionProperty: menuStyles.transitionProperty,
				searchBackgroundColor: searchStyles.backgroundColor,
				searchBlockSize: searchBox.height,
				searchIconBlockSize: searchIconBox.height,
				searchIconInlineSize: searchIconBox.width,
				searchInlineSize: searchBox.width,
				openIconTransitionProperty: getComputedStyle(openIcon).transitionProperty,
			};
		});

		expect(contract.searchInlineSize).toBe(48);
		expect(contract.searchBlockSize).toBe(48);
		expect(contract.menuInlineSize).toBe(48);
		expect(contract.menuBlockSize).toBe(48);
		expect(contract.searchIconInlineSize).toBe(24);
		expect(contract.searchIconBlockSize).toBe(24);
		expect(contract.menuIconInlineSize).toBe(24);
		expect(contract.menuIconBlockSize).toBe(24);
		expect(contract.gap).toBeGreaterThanOrEqual(12);
		expect(contract.searchBackgroundColor).toBe(contract.expectedButtonBackgroundColor);
		expect(contract.menuBackgroundColor).toBe(contract.expectedButtonBackgroundColor);
		expect(contract.menuTransitionProperty).toContain('background-color');
		expect(contract.openIconTransitionProperty).toContain('transform');

		const closedDrawer = await page.locator('#starlight__sidebar').evaluate((sidebar) => {
			const styles = getComputedStyle(sidebar);
			return {
				opacity: styles.opacity,
				transform: styles.transform,
				transitionProperty: styles.transitionProperty,
				visibility: styles.visibility,
			};
		});
		expect(closedDrawer.transitionProperty).toContain('opacity');
		expect(closedDrawer.transitionProperty).toContain('transform');
		expect(closedDrawer.visibility).toBe('hidden');
		expect(closedDrawer.transform).not.toBe('none');

		const box = await menuButton.boundingBox();
		expect(box).not.toBeNull();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
		await page.mouse.down();
		await expect(menuButton.locator('.md3-ripple')).toHaveCount(1);
		await page.mouse.up();
		await expect(page.locator('starlight-menu-button')).toHaveAttribute('aria-expanded', 'true');
		await expect
			.poll(() =>
				menuButton.evaluate((button) => {
					const rootStyles = getComputedStyle(document.documentElement);
					const probe = document.createElement('span');
					document.body.append(probe);
					probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-secondary-container').trim();
					const expectedBackgroundColor = getComputedStyle(probe).backgroundColor;
					probe.remove();
					return getComputedStyle(button).backgroundColor === expectedBackgroundColor;
				}),
			)
			.toBe(true);
		const openDrawer = await page.evaluate(() => {
			const sidebar = document.querySelector('#starlight__sidebar');
			const menu = document.querySelector('starlight-menu-button button');
			if (!(sidebar instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
				throw new Error('Expected open drawer and menu button.');
			}
			const styles = getComputedStyle(sidebar);
			return {
				opacity: Number.parseFloat(styles.opacity),
				transform: styles.transform,
				transitionProperty: styles.transitionProperty,
				visibility: styles.visibility,
			};
		});
		expect(openDrawer.transitionProperty).toContain('opacity');
		expect(openDrawer.transitionProperty).toContain('transform');
		expect(openDrawer.visibility).toBe('visible');
		expect(openDrawer.opacity).toBeGreaterThan(0);
	});

	test('sidebar disclosure uses opening and closing runtime states', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const details = page.locator('.sidebar-content details').first();
		const summary = details.locator('summary').first();
		await expect(summary).toBeVisible();
		await expect(details).toHaveAttribute('open', '');

		await summary.click();
		await expect.poll(() => details.evaluate((element) => element.dataset.md3DisclosureState ?? '')).toBe('closing');
		await expect.poll(() => details.evaluate((element) => element.dataset.md3DisclosureState ?? '')).toBe('');
		await expect.poll(() => details.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(false);

		await summary.click();
		await expect.poll(() => details.evaluate((element) => element.dataset.md3DisclosureState ?? '')).toBe('opening');
		await expect.poll(() => details.evaluate((element) => element.dataset.md3DisclosureState ?? '')).toBe('');
		await expect.poll(() => details.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(true);
	});

	test('sidebar disclosure reverses rapid repeated clicks', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const details = page.locator('.sidebar-content details').first();
		const summary = details.locator('summary').first();
		await expect(summary).toBeVisible();
		await expect(details).toHaveAttribute('open', '');

		await summary.evaluate((element) => {
			const first = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				button: 0,
			});
			const second = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				button: 0,
			});
			element.dispatchEvent(first);
			element.dispatchEvent(second);
		});

		await expect.poll(() => details.evaluate((element) => element.dataset.md3DisclosureState ?? '')).toBe('opening');
		await expect.poll(() => details.evaluate((element) => element.dataset.md3DisclosureState ?? '')).toBe('');
		await expect.poll(() => details.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(true);
	});

	test('desktop table of contents anchors use smooth same-page scrolling', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });
		await page.evaluate(() => window.scrollTo(0, 0));

		const tocLink = page.locator('starlight-toc a[href="#tables"]').first();
		await expect(tocLink).toBeVisible();
		await tocLink.click();

		await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#tables');
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(250);
		const activeElementId = await page.evaluate(() => document.activeElement?.id ?? '');
		expect(activeElementId).toBe('tables');

		const finalTocLink = page.locator('starlight-toc a[href="#final-scrollspy-check"]').first();
		await expect(finalTocLink).toBeVisible();
		await finalTocLink.click();

		const lockedContract = await page
			.locator('starlight-toc nav')
			.first()
			.evaluate((nav) => ({
				locked: (nav as HTMLElement).dataset.md3TocNavigationLock,
				targetHref: nav.querySelector('.md3-toc-navigation-target')?.getAttribute('href') ?? '',
			}));
		expect(lockedContract.locked).toBe('true');
		expect(lockedContract.targetHref).toBe('#final-scrollspy-check');

		await page
			.locator('starlight-toc a[href="#tables"]')
			.first()
			.evaluate((link) => {
				link.setAttribute('aria-current', 'true');
			});
		const lockedAfterScrollspyInterference = await page
			.locator('starlight-toc nav')
			.first()
			.evaluate((nav) => ({
				targetHref: nav.querySelector('.md3-toc-navigation-target')?.getAttribute('href') ?? '',
				targetStillCurrent: nav.querySelector('.md3-toc-navigation-target')?.getAttribute('aria-current') === 'true',
			}));
		expect(lockedAfterScrollspyInterference.targetHref).toBe('#final-scrollspy-check');
		expect(lockedAfterScrollspyInterference.targetStillCurrent).toBe(true);

		await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#final-scrollspy-check');
		await expect
			.poll(() =>
				page
					.locator('starlight-toc a[aria-current="true"]')
					.evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
			)
			.toEqual(['#final-scrollspy-check']);
	});

	test('mobile drawer theme button keeps the active icon and label aligned', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'mobile')!.size);
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		await page.locator('starlight-menu-button button').click();
		await expect(page.locator('starlight-menu-button')).toHaveAttribute('aria-expanded', 'true');

		const themeButton = page.locator('.mobile-preferences starlight-theme-select .md3-theme-select__button');
		await expect(themeButton).toBeVisible();
		await expect
			.poll(() =>
				themeButton.evaluate(
					(button) =>
						[...button.querySelectorAll('.md3-theme-select__button-icon')].filter(
							(icon) => Number.parseFloat(getComputedStyle(icon).opacity) > 0.99,
						).length,
				),
			)
			.toBe(1);

		const contract = await themeButton.evaluate((button) => {
			const buttonBox = button.getBoundingClientRect();
			const visibleIcon = [...button.querySelectorAll('.md3-theme-select__button-icon')].find(
				(icon) => Number.parseFloat(getComputedStyle(icon).opacity) > 0.99,
			);
			const current = button.querySelector('.md3-theme-select__current');
			const caret = button.querySelector('.md3-theme-select__caret');
			if (!(visibleIcon instanceof Element)) throw new Error('Expected one visible theme icon.');
			if (!(current instanceof HTMLElement) || !(caret instanceof Element)) {
				throw new Error('Expected visible theme label and caret.');
			}
			const iconBox = visibleIcon.getBoundingClientRect();
			const labelBox = current.getBoundingClientRect();
			const caretBox = caret.getBoundingClientRect();
			const styles = getComputedStyle(button);
			return {
				backgroundColor: styles.backgroundColor,
				buttonBlockSize: buttonBox.height,
				buttonInlineSize: buttonBox.width,
				caretAfterLabel: caretBox.left >= labelBox.right,
				gapIconToLabel: Math.round(labelBox.left - iconBox.right),
				labelText: current.textContent?.trim() ?? '',
				visibleIcons: [...button.querySelectorAll('.md3-theme-select__button-icon')].filter(
					(icon) => Number.parseFloat(getComputedStyle(icon).opacity) > 0.99,
				).length,
			};
		});

		expect(contract.buttonInlineSize).toBeGreaterThanOrEqual(108);
		expect(contract.buttonBlockSize).toBeCloseTo(44, 2);
		expect(contract.visibleIcons).toBe(1);
		expect(contract.labelText).toBe('Light');
		expect(contract.gapIconToLabel).toBe(8);
		expect(contract.caretAfterLabel).toBe(true);
		expect(contract.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

		await themeButton.click();
		const menu = page.locator('.mobile-preferences starlight-theme-select .md3-theme-select__menu');
		await expect(menu).toBeVisible();
		const menuContract = await page.evaluate(() => {
			const button = document.querySelector('.mobile-preferences starlight-theme-select .md3-theme-select__button');
			const menu = document.querySelector('.mobile-preferences starlight-theme-select .md3-theme-select__menu');
			if (!(button instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
				throw new Error('Expected mobile theme button and menu.');
			}
			const buttonBox = button.getBoundingClientRect();
			const menuBox = menu.getBoundingClientRect();
			return {
				bottomGap: buttonBox.top - menuBox.bottom,
				rightDelta: Math.abs(buttonBox.right - menuBox.right),
			};
		});
		expect(menuContract.bottomGap).toBeGreaterThanOrEqual(7);
		expect(menuContract.bottomGap).toBeLessThanOrEqual(9);
		expect(menuContract.rightDelta).toBeLessThanOrEqual(1);
	});

	test('mobile table of contents uses MD3 menu surface styling', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'mobile')!.size);
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-concept/');
		await page.locator('main').waitFor({ state: 'visible' });

		const toc = page.locator('#starlight__mobile-toc');
		const summary = toc.locator('summary');
		const toggle = summary.locator('.toggle');
		const displayCurrent = summary.locator('.display-current');
		await expect(summary).toBeVisible();

		const restContract = await toc.evaluate((details) => {
			const host = details.closest('mobile-starlight-toc');
			const nav = host?.querySelector('nav');
			const contentPanel = document.querySelector('main > .content-panel');
			const firstHeading = document.querySelector('h1#_top');
			const summary = details.querySelector('summary');
			const toggle = details.querySelector('.toggle');
			if (
				!(host instanceof HTMLElement) ||
				!(nav instanceof HTMLElement) ||
				!(contentPanel instanceof HTMLElement) ||
				!(firstHeading instanceof HTMLElement) ||
				!(summary instanceof HTMLElement) ||
				!(toggle instanceof HTMLElement)
			) {
				throw new Error('Expected mobile TOC host, nav, summary, and toggle.');
			}
			const detailsStyles = getComputedStyle(details);
			const hostStyles = getComputedStyle(host);
			const navBox = nav.getBoundingClientRect();
			const firstHeadingBox = firstHeading.getBoundingClientRect();
			const contentPanelStyles = getComputedStyle(contentPanel);
			const navStyles = getComputedStyle(nav);
			const summaryBox = summary.getBoundingClientRect();
			const summaryStyles = getComputedStyle(summary);
			const toggleBox = toggle.getBoundingClientRect();
			const toggleStyles = getComputedStyle(toggle);
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-high').trim();
			const expectedToggleBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				backgroundColor: detailsStyles.backgroundColor,
				borderTopWidth: detailsStyles.borderTopWidth,
				borderRadius: detailsStyles.borderRadius,
				contentPanelBorderTopColor: contentPanelStyles.borderTopColor,
				expectedToggleBackgroundColor,
				firstHeadingIsBelowNav: firstHeadingBox.top > navBox.bottom,
				hostBlockSize: host.getBoundingClientRect().height,
				hostDisplay: hostStyles.display,
				navBorderBottomColor: navStyles.borderBottomColor,
				navBorderBottomWidth: navStyles.borderBottomWidth,
				navPaddingInlineStart: Number.parseFloat(getComputedStyle(nav).paddingInlineStart),
				summaryBorderBottomWidth: summaryStyles.borderBottomWidth,
				summaryBlockSize: summaryBox.height,
				toggleInlineStart: Math.round(toggleBox.left - navBox.left),
				toggleBackgroundColor: toggleStyles.backgroundColor,
				toggleBorderTopWidth: toggleStyles.borderTopWidth,
			};
		});
		expect(restContract.backgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(restContract.borderTopWidth).toBe('0px');
		expect(restContract.borderRadius).toBe('0px');
		expect(restContract.hostDisplay).toBe('block');
		expect(restContract.contentPanelBorderTopColor).toBe('rgba(0, 0, 0, 0)');
		expect(restContract.firstHeadingIsBelowNav).toBe(true);
		expect(restContract.navBorderBottomWidth).toBe('1px');
		expect(restContract.navBorderBottomColor).not.toBe(restContract.contentPanelBorderTopColor);
		expect(restContract.summaryBorderBottomWidth).toBe('0px');
		expect(restContract.summaryBlockSize).toBeGreaterThanOrEqual(40);
		expect(restContract.toggleInlineStart).toBeCloseTo(restContract.navPaddingInlineStart, 1);
		expect(restContract.toggleBackgroundColor).toBe(restContract.expectedToggleBackgroundColor);
		expect(restContract.toggleBorderTopWidth).toBe('0px');

		await displayCurrent.click();
		await expect.poll(() => toc.evaluate((details) => (details as HTMLDetailsElement).open)).toBe(false);

		const toggleBox = await toggle.boundingBox();
		expect(toggleBox).not.toBeNull();
		await page.mouse.move(toggleBox!.x + toggleBox!.width / 2, toggleBox!.y + toggleBox!.height / 2);
		await page.mouse.down();
		await expect(toggle.locator('.md3-ripple')).toHaveCount(1);
		const directSummaryRipples = await summary.evaluate(
			(element) => [...element.children].filter((child) => child.classList.contains('md3-ripple')).length,
		);
		expect(directSummaryRipples).toBe(0);
		await page.mouse.up();
		await expect(toc).toHaveAttribute('open', '');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('opening');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('');
		const firstLink = toc.locator('.dropdown a').first();
		await expect(firstLink).toBeVisible();

		const openContract = await toc.evaluate((details) => {
			const dropdown = details.querySelector('.dropdown');
			const firstLink = details.querySelector('.dropdown a');
			const currentLink =
				details.querySelector('.dropdown a[aria-current="true"]') ??
				details.querySelector('.dropdown a[aria-current="page"]') ??
				firstLink;
			if (
				!(dropdown instanceof HTMLElement) ||
				!(firstLink instanceof HTMLElement) ||
				!(currentLink instanceof HTMLElement)
			) {
				throw new Error('Expected mobile TOC dropdown links.');
			}
			const detailsStyles = getComputedStyle(details);
			const dropdownStyles = getComputedStyle(dropdown);
			const firstLinkStyles = getComputedStyle(firstLink);
			const currentLinkStyles = getComputedStyle(currentLink);
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container').trim();
			const expectedDropdownBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-secondary-container').trim();
			const expectedCurrentBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				currentBackgroundColor: currentLinkStyles.backgroundColor,
				currentColor: currentLinkStyles.color,
				detailsBackgroundColor: detailsStyles.backgroundColor,
				dropdownBackgroundColor: dropdownStyles.backgroundColor,
				dropdownBoxShadow: dropdownStyles.boxShadow,
				dropdownMaxBlockSize: dropdownStyles.maxBlockSize,
				dropdownOpacity: dropdownStyles.opacity,
				dropdownOverscrollBehaviorY: dropdownStyles.overscrollBehaviorY,
				dropdownTransform: dropdownStyles.transform,
				dropdownTransformOrigin: dropdownStyles.transformOrigin,
				dropdownOverflowY: dropdownStyles.overflowY,
				expectedCurrentBackgroundColor,
				expectedDropdownBackgroundColor,
				firstLinkBlockSize: firstLink.getBoundingClientRect().height,
				firstLinkBorderRadius: firstLinkStyles.borderRadius,
				firstLinkTextDecorationLine: firstLinkStyles.textDecorationLine,
			};
		});

		expect(openContract.detailsBackgroundColor).toBe(restContract.backgroundColor);
		expect(openContract.dropdownBackgroundColor).toBe(openContract.expectedDropdownBackgroundColor);
		expect(openContract.dropdownBoxShadow).not.toBe('none');
		expect(openContract.dropdownMaxBlockSize).not.toBe('none');
		expect(openContract.dropdownOpacity).toBe('1');
		expect(openContract.dropdownOverflowY).toBe('auto');
		expect(openContract.dropdownOverscrollBehaviorY).toBe('contain');
		expect(openContract.dropdownTransform).toBe('matrix(1, 0, 0, 1, 0, 0)');
		expect(openContract.dropdownTransformOrigin).toContain('0px');
		expect(openContract.firstLinkBlockSize).toBeGreaterThanOrEqual(44);
		expect(Number.parseFloat(openContract.firstLinkBorderRadius)).toBeGreaterThanOrEqual(20);
		expect(openContract.firstLinkTextDecorationLine).toBe('none');
		expect(openContract.currentBackgroundColor).toBe(openContract.expectedCurrentBackgroundColor);
		expect(openContract.currentColor).not.toBe('');

		await toggle.click();
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('closing');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('');
		await expect.poll(() => toc.evaluate((details) => (details as HTMLDetailsElement).open)).toBe(false);

		await toggle.click();
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('opening');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('');
		await expect.poll(() => toc.evaluate((details) => (details as HTMLDetailsElement).open)).toBe(true);
	});

	test('mobile table of contents link closes with MD3 exit motion before scrolling', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'mobile')!.size);
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-concept/');
		await page.locator('main').waitFor({ state: 'visible' });
		await page.evaluate(() => window.scrollTo(0, 0));

		const toc = page.locator('#starlight__mobile-toc');
		const toggle = toc.locator('summary .toggle');
		await toggle.click();
		await expect(toc).toHaveAttribute('open', '');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('');

		const principlesLink = toc.locator('.dropdown a[href="#principles"]').first();
		await expect(principlesLink).toBeVisible();
		await principlesLink.click();

		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('closing');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('');
		await expect.poll(() => toc.evaluate((details) => (details as HTMLDetailsElement).open)).toBe(false);
		await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#principles');
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(120);
	});

	test('medium table of contents uses compact chip and anchored menu with desktop sidebar', async ({ page }) => {
		await page.setViewportSize({ width: 820, height: 844 });
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-concept/');
		await page.locator('main').waitFor({ state: 'visible' });

		await expect(page.locator('#starlight__sidebar')).toBeVisible();
		await expect(page.locator('.right-sidebar-panel')).toBeHidden();

		const toc = page.locator('#starlight__mobile-toc');
		const summary = toc.locator('summary');
		const toggle = summary.locator('.toggle');
		await expect(summary).toBeVisible();

		const restContract = await toc.evaluate((details) => {
			const pageElement = document.querySelector('.page');
			const header = document.querySelector('.page > .header');
			const contentPanel = document.querySelector('main > .content-panel');
			const sidebar = document.querySelector('#starlight__sidebar');
			const tocStrip = details.closest('mobile-starlight-toc')?.querySelector('nav');
			const summary = details.querySelector('summary');
			const toggle = details.querySelector('.toggle');
			if (
				!(pageElement instanceof HTMLElement) ||
				!(header instanceof HTMLElement) ||
				!(contentPanel instanceof HTMLElement) ||
				!(sidebar instanceof HTMLElement) ||
				!(tocStrip instanceof HTMLElement) ||
				!(summary instanceof HTMLElement) ||
				!(toggle instanceof HTMLElement)
			) {
				throw new Error('Expected medium shell, sidebar, TOC summary, and toggle.');
			}
			const detailsRect = details.getBoundingClientRect();
			const summaryRect = summary.getBoundingClientRect();
			const detailsStyles = getComputedStyle(details);
			const toggleStyles = getComputedStyle(toggle);
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface').trim();
			const expectedSurfaceColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-lowest').trim();
			const expectedPageBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container').trim();
			const expectedHeaderBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-low').trim();
			const expectedSidebarBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-high').trim();
			const expectedToggleBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				contentBackgroundColor: getComputedStyle(contentPanel).backgroundColor,
				detailsBackgroundColor: detailsStyles.backgroundColor,
				detailsBorderRadius: detailsStyles.borderRadius,
				detailsInlineSize: detailsRect.width,
				expectedHeaderBackgroundColor,
				expectedPageBackgroundColor,
				expectedSidebarBackgroundColor,
				expectedSurfaceColor,
				expectedToggleBackgroundColor,
				headerBackgroundColor: getComputedStyle(header).backgroundColor,
				pageBackgroundColor: getComputedStyle(pageElement).backgroundColor,
				sidebarBackgroundColor: getComputedStyle(sidebar).backgroundColor,
				summaryCursor: getComputedStyle(summary).cursor,
				summaryInlineSize: summaryRect.width,
				tocStripBackgroundColor: getComputedStyle(tocStrip).backgroundColor,
				toggleBackgroundColor: toggleStyles.backgroundColor,
				toggleBorderRadius: toggleStyles.borderRadius,
			};
		});

		expect(restContract.pageBackgroundColor).toBe(restContract.expectedPageBackgroundColor);
		expect(restContract.headerBackgroundColor).toBe(restContract.expectedHeaderBackgroundColor);
		expect(restContract.contentBackgroundColor).toBe(restContract.expectedSurfaceColor);
		expect(restContract.tocStripBackgroundColor).toBe(restContract.expectedSurfaceColor);
		expect(restContract.sidebarBackgroundColor).toBe(restContract.expectedSidebarBackgroundColor);
		expect(restContract.detailsBackgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(restContract.detailsBorderRadius).toBe('0px');
		expect(restContract.summaryCursor).toBe('pointer');
		expect(restContract.summaryInlineSize).toBeCloseTo(restContract.detailsInlineSize, 1);
		expect(restContract.detailsInlineSize).toBeLessThan(360);
		expect(restContract.toggleBackgroundColor).toBe(restContract.expectedToggleBackgroundColor);
		expect(Number.parseFloat(restContract.toggleBorderRadius)).toBeGreaterThan(1000);

		await toggle.click();
		await expect(toc).toHaveAttribute('open', '');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('opening');
		await expect.poll(() => toc.evaluate((details) => details.dataset.md3TocState ?? '')).toBe('');

		const openContract = await toc.evaluate((details) => {
			const dropdown = details.querySelector('.dropdown');
			const current =
				details.querySelector('.dropdown a[aria-current="true"]') ??
				details.querySelector('.dropdown a[aria-current="page"]');
			if (!(dropdown instanceof HTMLElement) || !(current instanceof HTMLElement)) {
				throw new Error('Expected open medium TOC dropdown and current link.');
			}
			const dropdownStyles = getComputedStyle(dropdown);
			const currentStyles = getComputedStyle(current);
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container').trim();
			const expectedDropdownBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-secondary-container').trim();
			const expectedCurrentBackgroundColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				currentBackgroundColor: currentStyles.backgroundColor,
				currentBorderRadius: currentStyles.borderRadius,
				dropdownBackgroundColor: dropdownStyles.backgroundColor,
				dropdownBoxShadow: dropdownStyles.boxShadow,
				dropdownInlineSize: dropdown.getBoundingClientRect().width,
				dropdownOverflowY: dropdownStyles.overflowY,
				dropdownOverscrollBehaviorY: dropdownStyles.overscrollBehaviorY,
				dropdownPosition: dropdownStyles.position,
				expectedCurrentBackgroundColor,
				expectedDropdownBackgroundColor,
			};
		});

		expect(openContract.dropdownBackgroundColor).toBe(openContract.expectedDropdownBackgroundColor);
		expect(openContract.dropdownBoxShadow).not.toBe('none');
		expect(openContract.dropdownInlineSize).toBeGreaterThan(280);
		expect(openContract.dropdownPosition).toBe('absolute');
		expect(openContract.dropdownOverflowY).toBe('auto');
		expect(openContract.dropdownOverscrollBehaviorY).toBe('contain');
		expect(openContract.currentBackgroundColor).toBe(openContract.expectedCurrentBackgroundColor);
		expect(Number.parseFloat(openContract.currentBorderRadius)).toBeGreaterThan(1000);
	});
});

async function setThemeBeforeNavigation(page: Page, theme: 'dark' | 'light') {
	await page.addInitScript((initialTheme) => {
		localStorage.setItem('starlight-theme', initialTheme);
		document.documentElement.dataset.theme = initialTheme;
	}, theme);
}

async function settlePage(page: Page, theme: 'dark' | 'light') {
	await page.evaluate((activeTheme) => {
		localStorage.setItem('starlight-theme', activeTheme);
		document.documentElement.dataset.theme = activeTheme;
	}, theme);

	await page.addStyleTag({
		content: `
			*, *::before, *::after {
				animation-duration: 0s !important;
				animation-delay: 0s !important;
				caret-color: transparent !important;
				transition-duration: 0s !important;
				transition-delay: 0s !important;
			}
		`,
	});

	await page.locator('main').waitFor({ state: 'visible' });
	await page.evaluate(() => document.fonts?.ready);
	await page.waitForLoadState('networkidle');
	await page.evaluate(() => window.getSelection()?.removeAllRanges());
	await page.mouse.move(1, 1);
}

async function getSearchButtonColors(searchButton: ReturnType<Page['locator']>) {
	return searchButton.evaluate((element) => {
		const styles = getComputedStyle(element);
		return {
			backgroundColor: styles.backgroundColor,
			borderColor: styles.borderColor,
			color: styles.color,
			opacity: styles.opacity,
		};
	});
}

async function takeScreenshot(
	page: Page,
	name: string,
	options: { fullPage?: boolean; maxDiffPixelRatio?: number } = {},
) {
	const ciMaxDiffPixelRatio = Number.parseFloat(process.env.MD3_SCREENSHOT_MAX_DIFF_PIXEL_RATIO ?? '');

	await expect(page).toHaveScreenshot(`${name}.png`, {
		animations: 'disabled',
		fullPage: options.fullPage ?? true,
		maxDiffPixelRatio: options.maxDiffPixelRatio ?? (Number.isFinite(ciMaxDiffPixelRatio) ? ciMaxDiffPixelRatio : 0.02),
		timeout: 15_000,
	});
}
