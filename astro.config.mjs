// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import md3Theme from './src/index.ts';

// https://astro.build/config
export default defineConfig({
	outDir: './demo-dist',
	vite: {
		server: {
			watch: {
				ignored: ['**/dist/**', '**/demo-dist/**'],
			},
		},
	},
	integrations: [
		starlight({
			title: 'starlight-theme-md3',
			plugins: [
				md3Theme({
					seed: '#00a99d',
					variant: 'tonalSpot',
				}),
			],
			sidebar: [
				{
					label: 'Start',
					items: [{ label: 'Getting Started', slug: 'guides/getting-started' }],
				},
				{
					label: 'Design',
					items: [
						{ label: 'Theme Direction', slug: 'guides/theme-concept' },
						{ label: 'Implementation Plan', slug: 'guides/implementation-plan' },
						{ label: 'Component Samples', slug: 'guides/component-samples' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Design Tokens', slug: 'reference/design-tokens' },
						{ label: 'Plugin Options', slug: 'reference/plugin-options' },
					],
				},
			],
		}),
	],
});
