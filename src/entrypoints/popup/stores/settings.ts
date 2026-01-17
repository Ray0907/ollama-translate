import { writable, derived } from 'svelte/store';
import type { GlobalSettings, OllamaStatus } from '../../../shared/types';
import { getDefaultSettings } from '../../../shared/constants';

// Ollama connection status
export const ollama_status = writable<OllamaStatus>({
	connected: false,
	models: [],
});

// Global settings
export const settings = writable<GlobalSettings>(getDefaultSettings());

// Current domain (from active tab)
export const current_domain = writable<string>('');

// Site-specific auto-translate setting
export const site_auto_translate = writable<boolean>(false);

// Loading state
export const is_loading = writable<boolean>(true);

// Derived: available models filtered to translategemma
export const translate_models = derived(ollama_status, ($status) => {
	return $status.models.filter(
		(m) => m.includes('translategemma') || m.includes('translate')
	);
});

// Initialize stores from background
export async function initializeStores(): Promise<void> {
	is_loading.set(true);

	try {
		// Get active tab domain
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const url = tab?.url ? new URL(tab.url) : null;
		const domain = url?.hostname || '';
		current_domain.set(domain);

		// Check Ollama connection
		const status = await chrome.runtime.sendMessage({ action: 'check_connection' });
		ollama_status.set(status);

		// Get settings
		const effective_settings = await chrome.runtime.sendMessage({
			action: 'get_settings',
			domain,
		});

		settings.set({
			target_lang: effective_settings.target_lang,
			model: effective_settings.model,
			temperature: effective_settings.temperature,
			custom_prompt: effective_settings.custom_prompt,
			ollama_url: effective_settings.ollama_url,
		});

		site_auto_translate.set(effective_settings.auto_translate || false);

	} catch (err) {
		console.error('Failed to initialize stores:', err);
	} finally {
		is_loading.set(false);
	}
}

// Save global settings
export async function saveGlobalSettings(
	updates: Partial<GlobalSettings>
): Promise<void> {
	await chrome.runtime.sendMessage({
		action: 'update_global_settings',
		updates,
	});

	settings.update((s) => ({ ...s, ...updates }));
}

// Save site settings
export async function saveSiteSettings(
	domain: string,
	auto_translate: boolean
): Promise<void> {
	await chrome.runtime.sendMessage({
		action: 'update_site_settings',
		domain,
		updates: { auto_translate },
	});

	site_auto_translate.set(auto_translate);
}

// Retry connection
export async function retryConnection(): Promise<void> {
	const status = await chrome.runtime.sendMessage({ action: 'check_connection' });
	ollama_status.set(status);
}
