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

// Helper to send message with retry and wake-up
async function sendMessageWithRetry<T>(
	message: unknown,
	max_retries = 5
): Promise<T> {
	for (let i = 0; i < max_retries; i++) {
		try {
			// First, try to wake up the service worker by getting its registration
			if (i > 0) {
				try {
					await chrome.runtime.getBackgroundPage?.();
				} catch {
					// MV3 doesn't support getBackgroundPage, that's ok
				}
			}

			const response = await chrome.runtime.sendMessage(message);
			if (chrome.runtime.lastError) {
				throw new Error(chrome.runtime.lastError.message);
			}
			return response as T;
		} catch (err) {
			console.log(`[Popup] Attempt ${i + 1} failed:`, err);
			if (i === max_retries - 1) throw err;
			// Wait longer before retrying
			await new Promise((resolve) => setTimeout(resolve, 200 * (i + 1)));
		}
	}
	throw new Error('Failed to send message');
}

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
		const status = await sendMessageWithRetry<OllamaStatus>({ action: 'check_connection' });
		ollama_status.set(status);

		// Get settings
		const effective_settings = await sendMessageWithRetry<{
			target_lang: string;
			model: string;
			temperature: number;
			custom_prompt: string | null;
			ollama_url: string;
			auto_translate: boolean;
		}>({
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
	await sendMessageWithRetry({
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
	await sendMessageWithRetry({
		action: 'update_site_settings',
		domain,
		updates: { auto_translate },
	});

	site_auto_translate.set(auto_translate);
}

// Retry connection
export async function retryConnection(): Promise<void> {
	const status = await sendMessageWithRetry<OllamaStatus>({ action: 'check_connection' });
	ollama_status.set(status);
}
