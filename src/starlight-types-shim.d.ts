export interface StarlightPlugin {
	name: string;
	hooks: {
		'config:setup'?(context: {
			config: {
				customCss?: string[];
			};
			updateConfig(config: { customCss?: string[] }): void;
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
