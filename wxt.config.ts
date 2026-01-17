import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: 'src',
	modules: ['@wxt-dev/module-svelte'],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	manifest: {
		name: 'Ollama Translate',
		description: 'Local immersive translation powered by Ollama',
		permissions: ['storage', 'activeTab'],
		host_permissions: ['http://localhost:11434/*'],
	},
});
