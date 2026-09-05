import { defineConfig, devices } from '@playwright/test';

const localChromeChannel = process.env.CI ? undefined : 'chrome';

export default defineConfig({
	testDir: './tests/production',
	reporter: process.env.CI ? 'github' : 'list',
	timeout: 60_000,
	workers: 1,
	use: {
		...devices['Desktop Chrome'],
		...(localChromeChannel ? { channel: localChromeChannel } : {}),
		baseURL: 'http://127.0.0.1:4326',
		locale: 'en-US',
		timezoneId: 'UTC',
		trace: 'retain-on-failure',
	},
	webServer: {
		command:
			'pnpm run build && ASTRO_PREVIEW_BACKGROUND=0 pnpm exec astro preview --host 127.0.0.1 --port 4326',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		url: 'http://127.0.0.1:4326',
	},
});
