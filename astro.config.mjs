// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import md3Theme from './src/index.ts';

const site = process.env.ASTRO_SITE || 'https://starlight-theme-md3.local';
const base = normalizeBase(process.env.ASTRO_BASE);

/** @param {string | undefined} value */
function normalizeBase(value) {
	if (!value || value === '/') return undefined;
	const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
	return withLeadingSlash.replace(/\/+$/, '');
}

// https://astro.build/config
export default defineConfig({
	site,
	...(base ? { base } : {}),
	outDir: './demo-dist',
	devToolbar: {
		enabled: false,
	},
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
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/aXiaobo7788/starlight-material-design-theme',
				},
			],
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
						{ label: 'Implementation Overview', slug: 'guides/implementation-plan' },
						{ label: 'Theme Lab', slug: 'guides/theme-lab' },
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
