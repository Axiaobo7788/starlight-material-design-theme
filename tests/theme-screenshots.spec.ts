import { expect, test, type Page } from '@playwright/test';

const pages = [
	{ name: 'home', path: '/' },
	{ name: 'theme-lab', path: '/guides/theme-lab/' },
	{ name: 'implementation-plan', path: '/guides/implementation-plan/' },
	{ name: 'plugin-options', path: '/reference/plugin-options/' },
] as const;

const themes = ['dark', 'light'] as const;

const viewports = [
	{ name: 'desktop', size: { width: 1440, height: 900 } },
	{ name: 'mobile', size: { width: 390, height: 844 } },
] as const;

const scenarios = pages.flatMap((page) =>
	viewports.flatMap((viewport) =>
		themes.map((theme) => ({
			name: `${page.name}-${viewport.name}-${theme}`,
			path: page.path,
			theme,
			viewport: viewport.size,
		}))
	)
);

const searchDialogScenarios = viewports.flatMap((viewport) =>
	themes.map((theme) => ({
		name: `search-dialog-${viewport.name}-${theme}`,
		path: '/guides/theme-lab/',
		theme,
		viewport: viewport.size,
	}))
);

const mobileDrawerScenarios = themes.map((theme) => ({
	name: `mobile-drawer-${theme}`,
	path: '/guides/theme-lab/',
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

		const stateDuration = await page.locator('html').evaluate((element) =>
			getComputedStyle(element).getPropertyValue('--md3-motion-duration-state').trim()
		);
		const routeDurations = await page.locator('html').evaluate((element) => {
			const styles = getComputedStyle(element);
			return {
				enter: styles.getPropertyValue('--md3-motion-duration-route-enter').trim(),
				leave: styles.getPropertyValue('--md3-motion-duration-route-leave').trim(),
			};
		});
		const buttonDuration = await page.locator('button[data-open-modal]').evaluate((element) =>
			getComputedStyle(element).transitionDuration
		);

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

		const stateDuration = await page.locator('html').evaluate((element) =>
			getComputedStyle(element).getPropertyValue('--md3-motion-duration-state').trim()
		);
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
			const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
			element.dispatchEvent(event);
			return {
				defaultPrevented: event.defaultPrevented,
				className: element.className,
				routeState: document.documentElement.getAttribute('data-md3-route-state'),
				routeFlag: sessionStorage.getItem('md3-route-transition'),
			};
		});

		expect(clickResult.defaultPrevented).toBe(true);
		expect(clickResult.className).toContain('md3-navigation-pending');
		expect(clickResult.routeState).toBe('leaving');
		expect(clickResult.routeFlag).toBe('true');
		await page.waitForURL(/\/guides\/implementation-plan\/$/);
		await expect.poll(() =>
			page.evaluate(() => ({
				routeState: document.documentElement.getAttribute('data-md3-route-state'),
				routeFlag: sessionStorage.getItem('md3-route-transition'),
			}))
		).toEqual({
			routeState: null,
			routeFlag: null,
		});
	});

	test('homepage CTA uses the same content-only route transition', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/');
		await page.locator('main').waitFor({ state: 'visible' });

		const link = page.locator('.sl-link-button[href="/guides/theme-concept/"]').first();
		const clickResult = await link.evaluate((element) => {
			const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
			element.dispatchEvent(event);
			return {
				defaultPrevented: event.defaultPrevented,
				className: element.className,
				routeState: document.documentElement.getAttribute('data-md3-route-state'),
				routeFlag: sessionStorage.getItem('md3-route-transition'),
			};
		});

		expect(clickResult.defaultPrevented).toBe(true);
		expect(clickResult.className).toContain('md3-navigation-pending');
		expect(clickResult.routeState).toBe('leaving');
		expect(clickResult.routeFlag).toBe('true');
		await page.waitForURL(/\/guides\/theme-concept\/$/);
		await expect.poll(() =>
			page.evaluate(() => ({
				routeState: document.documentElement.getAttribute('data-md3-route-state'),
				routeFlag: sessionStorage.getItem('md3-route-transition'),
			}))
		).toEqual({
			routeState: null,
			routeFlag: null,
		});
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
		expect(heroMotion.animationDuration).toBe('0.45s');
		expect(heroMotion.animationFillMode).toBe('both');
		expect(heroMotion.animationDelay).toBe('0s');

		const surfaceMotion = await page.locator('.card').first().evaluate((element) => {
			const styles = getComputedStyle(element);
			return {
				animationDelay: styles.animationDelay,
				animationDuration: styles.animationDuration,
				animationFillMode: styles.animationFillMode,
				animationName: styles.animationName,
			};
		});
		expect(surfaceMotion.animationName).toBe('md3-home-surface-enter');
		expect(surfaceMotion.animationDuration).toBe('0.45s');
		expect(surfaceMotion.animationFillMode).toBe('both');
		expect(surfaceMotion.animationDelay).toBe('0.15s');

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
		test(`search field uses surface-container-high in ${theme} mode`, async ({ page }) => {
			await setThemeBeforeNavigation(page, theme);
			await page.goto('/guides/theme-lab/');
			await settlePage(page, theme);

			const colors = await page.locator('button[data-open-modal]').evaluate((element) => {
				const rootStyles = getComputedStyle(document.documentElement);
				const probe = document.createElement('span');
				probe.style.backgroundColor = rootStyles
					.getPropertyValue('--md-sys-color-surface-container-high')
					.trim();
				document.body.append(probe);
				const expectedBackgroundColor = getComputedStyle(probe).backgroundColor;
				probe.remove();
				return {
					backgroundColor: getComputedStyle(element).backgroundColor,
					borderTopWidth: getComputedStyle(element).borderTopWidth,
					boxShadow: getComputedStyle(element).boxShadow,
					expectedBackgroundColor,
				};
			});

			expect(colors.backgroundColor).toBe(colors.expectedBackgroundColor);
			expect(colors.borderTopWidth).toBe('0px');
			expect(colors.boxShadow).toBe('none');
		});
	}

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
		expect(lightRoles.navSelectedContainer).toContain('#cce8e3');
		expect(lightRoles.navSelectedContainer).toContain('#f2f4f2');
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

		const cardContract = await page.locator('.card').first().evaluate((card) => {
			const title = card.querySelector('.title');
			const body = card.querySelector('.body');
			if (!title || !body) throw new Error('Expected Starlight card title and body elements.');

			const cardStyles = getComputedStyle(card);
			const titleStyles = getComputedStyle(title);
			const bodyStyles = getComputedStyle(body);
			return {
				borderColor: cardStyles.borderColor,
				display: cardStyles.display,
				flexDirection: cardStyles.flexDirection,
				gap: cardStyles.gap,
				titleFontWeight: titleStyles.fontWeight,
				titleMarginBlockEnd: titleStyles.marginBlockEnd,
				titleMarginBlockStart: titleStyles.marginBlockStart,
				bodyMarginBlockEnd: bodyStyles.marginBlockEnd,
				bodyMarginBlockStart: bodyStyles.marginBlockStart,
			};
		});

		expect(cardContract.borderColor).toBe('rgba(0, 0, 0, 0)');
		expect(cardContract.display).toBe('flex');
		expect(cardContract.flexDirection).toBe('column');
		expect(cardContract.gap).toBe('12px');
		expect(cardContract.titleFontWeight).toBe('500');
		expect(cardContract.titleMarginBlockStart).toBe('0px');
		expect(cardContract.titleMarginBlockEnd).toBe('0px');
		expect(cardContract.bodyMarginBlockStart).toBe('0px');
		expect(cardContract.bodyMarginBlockEnd).toBe('0px');
	});

	test('demo panels use filled MD3 surfaces instead of outlined cards', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/');
		await page.locator('main').waitFor({ state: 'visible' });

		const panelContract = await page.locator('.md3-showcase-panel').first().evaluate((panel) => {
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
			const sidebar = document.querySelector('.sidebar-pane');
			if (!(header instanceof HTMLElement) || !(contentDivider instanceof HTMLElement) || !(sidebar instanceof HTMLElement)) {
				throw new Error('Expected Starlight header, sidebar, and content panel divider.');
			}

			const headerStyles = getComputedStyle(header);
			const contentStyles = getComputedStyle(contentDivider);
			const sidebarStyles = getComputedStyle(sidebar);
			const rootStyles = getComputedStyle(document.documentElement);
			const probe = document.createElement('span');
			document.body.append(probe);
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface').trim();
			const resolvedSurfaceColor = getComputedStyle(probe).backgroundColor;
			probe.style.backgroundColor = rootStyles.getPropertyValue('--md-sys-color-surface-container-low').trim();
			const resolvedSurfaceContainerLowColor = getComputedStyle(probe).backgroundColor;
			probe.remove();
			return {
				contentBorderTopColor: contentStyles.borderTopColor,
				headerBackgroundColor: headerStyles.backgroundColor,
				headerBorderBottomColor: headerStyles.borderBottomColor,
				headerBoxShadow: headerStyles.boxShadow,
				resolvedSurfaceColor,
				resolvedSurfaceContainerLowColor,
				sidebarBackgroundColor: sidebarStyles.backgroundColor,
				sidebarBorderInlineEndColor: sidebarStyles.borderInlineEndColor,
			};
		});

		expect(layoutContract.headerBackgroundColor).not.toBe(layoutContract.resolvedSurfaceColor);
		expect(layoutContract.headerBackgroundColor).toBe(layoutContract.sidebarBackgroundColor);
		expect(layoutContract.headerBackgroundColor).toBe(layoutContract.resolvedSurfaceContainerLowColor);
		expect(layoutContract.headerBorderBottomColor).toBe('rgba(0, 0, 0, 0)');
		expect(layoutContract.headerBoxShadow).toBe('none');
		expect(layoutContract.contentBorderTopColor).toBe('rgba(0, 0, 0, 0)');
		expect(layoutContract.sidebarBorderInlineEndColor).toBe('rgba(0, 0, 0, 0)');
	});

	test('chrome typography keeps a quiet MD3 hierarchy', async ({ page }) => {
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const typography = await page.evaluate(() => {
			const siteTitle = document.querySelector('.site-title');
			const activeNav = document.querySelector('.sidebar-content [aria-current="page"]');
			const tocTitle = document.querySelector('starlight-toc h2');
			if (!(siteTitle instanceof HTMLElement) || !(activeNav instanceof HTMLElement) || !(tocTitle instanceof HTMLElement)) {
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
			return {
				inlineStart: styles.insetInlineStart,
				backgroundColor: styles.backgroundColor,
				height: styles.blockSize,
				opacity: styles.opacity,
				translateY: matrix.m42,
				width: styles.inlineSize,
			};
		});

		expect(marker.inlineStart).toBe('3px');
		expect(marker.opacity).toBe('1');
		expect(marker.height).toBe('16px');
		expect(marker.translateY).toBeGreaterThanOrEqual(0);
		expect(marker.width).toBe('4px');
		expect(marker.backgroundColor).toBe('rgb(71, 97, 122)');
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
					.evaluateAll((links) => links.map((link) => link.textContent?.trim()))
			)
			.toEqual(['Final Scrollspy Check']);
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
			const matrix = new DOMMatrixReadOnly(styles.transform);
			return {
				backdropFilter: backdrop.backdropFilter,
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
		expect(contract.opacity).toBe('1');
		expect(contract.scaleX).toBeCloseTo(1, 3);
		expect(contract.scaleY).toBeCloseTo(1, 3);
		expect(contract.translateY).toBeCloseTo(0, 3);
		expect(contract.transitionDuration).toContain('0.3s');
		expect(contract.transitionProperty).toContain('opacity');
		expect(contract.transitionProperty).toContain('transform');
	});

	test('theme menu uses a quiet MD3 selected state', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'light');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const themeButton = page.locator('starlight-theme-select .md3-theme-select__button').first();
		const buttonRestContract = await themeButton.evaluate((button) => {
			const styles = getComputedStyle(button);
			return {
				backgroundColor: styles.backgroundColor,
				blockSize: styles.blockSize,
				borderTopWidth: styles.borderTopWidth,
				inlineSize: styles.inlineSize,
				minBlockSize: styles.minBlockSize,
				visibleIcons: [...button.querySelectorAll('.md3-theme-select__button-icon')].filter(
					(icon) => getComputedStyle(icon).display !== 'none'
				).length,
				visibleText: button.textContent?.trim() ?? '',
			};
		});
		expect(buttonRestContract.backgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(buttonRestContract.blockSize).toBe('48px');
		expect(buttonRestContract.borderTopWidth).toBe('0px');
		expect(buttonRestContract.inlineSize).toBe('48px');
		expect(Number.parseFloat(buttonRestContract.minBlockSize)).toBeGreaterThanOrEqual(48);
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
		expect(menuContract.transitionDuration).toContain('0.3s');
		expect(menuContract.transitionProperty).toContain('opacity');
		expect(menuContract.transitionProperty).toContain('transform');

		await themeButton.click();
		await expect(menu).toHaveAttribute('data-md3-menu-state', 'closing');
		const closeMotion = await menu.evaluate((element) => {
			const styles = getComputedStyle(element);
			return {
				hidden: element.hasAttribute('hidden'),
				opacity: styles.opacity,
				transitionDuration: styles.transitionDuration,
				transitionProperty: styles.transitionProperty,
			};
		});
		expect(closeMotion.hidden).toBe(false);
		expect(closeMotion.transitionDuration).toContain('0.2s');
		expect(closeMotion.transitionProperty).toContain('opacity');
		expect(closeMotion.transitionProperty).toContain('transform');
		await expect(menu).toBeHidden();
	});

	test('mobile menu button rests as a transparent top app bar icon button', async ({ page }) => {
		await page.setViewportSize(viewports.find((viewport) => viewport.name === 'mobile')!.size);
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await setThemeBeforeNavigation(page, 'dark');
		await page.goto('/guides/theme-lab/');
		await page.locator('main').waitFor({ state: 'visible' });

		const menuButton = page.locator('starlight-menu-button button');
		await expect(menuButton).toBeVisible();
		await expect(menuButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

		const box = await menuButton.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.x).toBeGreaterThanOrEqual(0);
		expect(box!.x + box!.width).toBeLessThanOrEqual(viewports.find((viewport) => viewport.name === 'mobile')!.size.width);
		expect(box!.width).toBe(48);
		expect(box!.height).toBe(48);

		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
		await page.mouse.down();
		await expect(menuButton.locator('.md3-ripple')).toHaveCount(1);
		await page.mouse.up();
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
	options: { fullPage?: boolean; maxDiffPixelRatio?: number } = {}
) {
	const ciMaxDiffPixelRatio = Number.parseFloat(process.env.MD3_SCREENSHOT_MAX_DIFF_PIXEL_RATIO ?? '');

	await expect(page).toHaveScreenshot(`${name}.png`, {
		animations: 'disabled',
		fullPage: options.fullPage ?? true,
		maxDiffPixelRatio: options.maxDiffPixelRatio ?? (Number.isFinite(ciMaxDiffPixelRatio) ? ciMaxDiffPixelRatio : 0.02),
		timeout: 15_000,
	});
}
