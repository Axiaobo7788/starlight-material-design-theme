import { expect, test, type Page } from '@playwright/test';

const scenarios = [
	{
		name: 'theme-lab-desktop-dark',
		theme: 'dark',
		viewport: { width: 1440, height: 900 },
	},
	{
		name: 'theme-lab-desktop-light',
		theme: 'light',
		viewport: { width: 1440, height: 900 },
	},
	{
		name: 'theme-lab-mobile-dark',
		theme: 'dark',
		viewport: { width: 390, height: 844 },
	},
	{
		name: 'theme-lab-mobile-light',
		theme: 'light',
		viewport: { width: 390, height: 844 },
	},
] as const;

test.describe('Theme Lab screenshots', () => {
	for (const scenario of scenarios) {
		test(scenario.name, async ({ page }) => {
			await page.setViewportSize(scenario.viewport);
			await setThemeBeforeNavigation(page, scenario.theme);
			await page.goto('/guides/theme-lab/');
			await settlePage(page, scenario.theme);

			await expect(page).toHaveScreenshot(`${scenario.name}.png`, {
				animations: 'disabled',
				fullPage: true,
				maxDiffPixelRatio: 0.02,
			});
		});
	}
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
