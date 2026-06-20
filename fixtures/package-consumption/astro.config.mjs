// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import md3Theme from 'starlight-theme-md3';

export default defineConfig({
	site: 'https://example.com',
	outDir: './dist-site',
	integrations: [
		starlight({
			title: 'MD3 fixture',
			plugins: [
				md3Theme({
					seed: '#0061a4',
					variant: 'tonalSpot',
					density: 'comfortable',
				}),
			],
		}),
	],
});
