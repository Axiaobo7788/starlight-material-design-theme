import { defineConfig, devices } from '@playwright/test';

const localChromeChannel = process.env.CI ? undefined : 'chrome';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	reporter: process.env.CI ? 'github' : 'list',
	timeout: 60_000,
	use: {
		baseURL: 'http://127.0.0.1:4325',
		locale: 'en-US',
		timezoneId: 'UTC',
		trace: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				...(localChromeChannel ? { channel: localChromeChannel } : {}),
				launchOptions: {
					args: ['--disable-features=Translate,TranslateUI', '--disable-translate'],
				},
			},
		},
	],
	webServer: {
		command: 'pnpm exec astro dev --host 127.0.0.1 --port 4325',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		url: 'http://127.0.0.1:4325',
	},
});
