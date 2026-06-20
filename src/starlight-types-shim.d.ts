type StarlightHeadItem = {
	tag: 'style' | 'script';
	attrs?: Record<string, string | boolean | undefined>;
	content?: string;
};

type StarlightComponents = {
	ThemeSelect?: string;
	[key: string]: string | undefined;
};

export interface StarlightPlugin {
	name: string;
	hooks: {
		'config:setup'?(context: {
			config: {
				customCss?: string[];
				components?: StarlightComponents;
				head?: StarlightHeadItem[];
			};
			updateConfig(config: {
				customCss?: string[];
				components?: StarlightComponents;
				head?: StarlightHeadItem[];
			}): void;
			addIntegration(integration: {
				name: string;
				hooks: {
					'astro:config:setup'?(context: { updateConfig(config: { vite?: { plugins?: unknown[] } }): void }): void;
				};
			}): void;
			logger: {
				warn(message: string): void;
			};
		}): void | Promise<void>;
	};
}
