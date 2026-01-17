import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: 'src',
	outDir: 'dist',
	outDirTemplate: '',
	modules: ['@wxt-dev/module-svelte'],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	manifest: {
		name: 'Ollama Translate',
		description: 'Local immersive translation powered by Ollama',
		permissions: ['storage', 'activeTab', 'tabs'],
		host_permissions: ['http://localhost:11434/*'],
		icons: {
			16: 'icon/16.png',
			32: 'icon/32.png',
			48: 'icon/48.png',
			96: 'icon/96.png',
			128: 'icon/128.png',
		},
	},
});
