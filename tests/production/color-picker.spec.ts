import { expect, test } from '@playwright/test';

const storageKey = 'starlight-theme-md3:color:v1';

test('both mode becomes a persistent visitor preference in production', async ({ page }) => {
	await page.goto('/guides/theme-lab/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();

	await expect(page.locator('html')).toHaveAttribute('data-md3-color-picker-mode', 'visitor');
	let picker = page.locator('starlight-md3-color-picker:visible');
	await picker.locator('.md3-color-picker__trigger').click();
	await expect(picker.locator('.md3-color-picker__apply')).toBeVisible();
	await expect(picker.locator('.md3-color-picker__copy')).toBeHidden();

	await picker.getByText('Custom', { exact: true }).click();
	await picker.locator('.md3-color-picker__hex').fill('#6750A4');
	await expect(picker.locator('.md3-color-picker__apply')).toBeEnabled();
	await picker.locator('.md3-color-picker__apply').click();
	await expect(picker.locator('.md3-color-picker__dialog')).not.toHaveAttribute('open', '');

	const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), storageKey);
	expect(stored).toMatchObject({ seed: '#6750a4', source: 'custom', variant: 'tonalSpot', version: 1 });

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-md3-color-runtime', 'custom');
	await expect(page.locator('html')).toHaveAttribute('data-md3-color-seed', '#6750a4');

	picker = page.locator('starlight-md3-color-picker:visible');
	await picker.locator('.md3-color-picker__trigger').click();
	await picker.locator('.md3-color-picker__reset').click();
	await picker.locator('.md3-color-picker__apply').click();
	await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
	await expect(page.locator('html')).not.toHaveAttribute('data-md3-color-runtime', /.+/);
});

test('mobile apply keeps the bottom sheet populated throughout its exit', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/guides/theme-lab/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.locator('.sl-menu-button, starlight-menu-button button').first().click();

	const picker = page.locator('.mobile-preferences starlight-md3-color-picker');
	await picker.locator('.md3-color-picker__trigger').click();
	await picker.getByText('Custom', { exact: true }).click();
	await picker.locator('.md3-color-picker__hex').fill('#6750A4');

	const dialog = picker.locator('.md3-color-picker__dialog');
	const actions = picker.locator('.md3-color-picker__actions');
	await expect(actions).toHaveCSS('opacity', '1');
	const closingStart = await picker.locator('.md3-color-picker__apply').evaluate((button) => {
		(button as HTMLButtonElement).click();
		const dialog = button.closest('dialog')!;
		const actions = dialog.querySelector<HTMLElement>('.md3-color-picker__actions')!;
		return {
			actionsOpacity: getComputedStyle(actions).opacity,
			open: dialog.hasAttribute('open'),
			pointerEvents: getComputedStyle(dialog).pointerEvents,
			state: dialog.getAttribute('data-md3-dialog-state'),
		};
	});

	expect(closingStart).toEqual({
		actionsOpacity: '1',
		open: true,
		pointerEvents: 'none',
		state: 'closing',
	});
	await page.waitForTimeout(60);
	const midExit = await dialog.evaluate((element) => ({
		actionsOpacity: getComputedStyle(element.querySelector<HTMLElement>('.md3-color-picker__actions')!).opacity,
		open: element.hasAttribute('open'),
		state: element.getAttribute('data-md3-dialog-state'),
	}));
	expect(midExit).toEqual({ actionsOpacity: '1', open: true, state: 'closing' });
	await expect(dialog).not.toHaveAttribute('open', '');
});
