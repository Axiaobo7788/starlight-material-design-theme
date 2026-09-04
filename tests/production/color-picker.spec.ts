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
