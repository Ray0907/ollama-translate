import type { OllamaStatus, TranslationError } from '../shared/types';
import { TRANSLATION_TIMEOUT, MAX_RETRIES } from '../shared/constants';
import { getGlobalSettings } from './storage';

// Store active AbortController for cancellation
let active_controller: AbortController | null = null;
let is_cancelled = false;

export function cancelTranslation(): void {
	is_cancelled = true;
	if (active_controller) {
		active_controller.abort();
		active_controller = null;
	}
}

export function isTranslationCancelled(): boolean {
	return is_cancelled;
}

export function resetCancellation(): void {
	is_cancelled = false;
	active_controller = null;
}

export async function checkConnection(): Promise<OllamaStatus> {
	const settings = await getGlobalSettings();

	try {
		const response = await fetch(`${settings.ollama_url}/api/tags`, {
			method: 'GET',
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) {
			return { connected: false, models: [] };
		}

		const data = await response.json();
		const models = data.models?.map((m: { name: string }) => m.name) || [];

		return { connected: true, models };
	} catch {
		return { connected: false, models: [] };
	}
}

export async function getAvailableModels(): Promise<string[]> {
	const status = await checkConnection();
	return status.models;
}

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function translateText(
	text: string,
	target_lang: string,
	source_lang?: string,
	on_chunk?: (chunk: string) => void
): Promise<string> {
	const settings = await getGlobalSettings();

	const system_prompt = settings.custom_prompt ||
		`You are a professional translator. Translate the following text to ${target_lang}. ` +
		`Only output the translation, no explanations or additional text.`;

	const user_content = source_lang
		? `Translate from ${source_lang} to ${target_lang}:\n\n${text}`
		: `Translate to ${target_lang}:\n\n${text}`;

	let last_error: Error | null = null;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		// Check if cancelled before starting
		if (is_cancelled) {
			throw { code: 'CANCELLED', message: 'Translation cancelled' } as TranslationError;
		}

		try {
			const controller = new AbortController();
			active_controller = controller;
			const timeout_id = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT);

			const response = await fetch(`${settings.ollama_url}/api/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				signal: controller.signal,
				body: JSON.stringify({
					model: settings.model,
					stream: true,
					options: {
						temperature: settings.temperature,
					},
					messages: [
						{ role: 'system', content: system_prompt },
						{ role: 'user', content: user_content },
					],
				}),
			});

			clearTimeout(timeout_id);

			if (!response.ok) {
				const error_text = await response.text();
				if (error_text.includes('model') && error_text.includes('not found')) {
					throw {
						code: 'MODEL_NOT_FOUND',
						message: `Model "${settings.model}" not found`,
						model: settings.model,
					} as TranslationError;
				}
				throw new Error(`Ollama API error: ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) throw new Error('No response body');

			const decoder = new TextDecoder();
			let full_text = '';

			while (true) {
				// Check if cancelled during streaming
				if (is_cancelled) {
					reader.cancel();
					throw { code: 'CANCELLED', message: 'Translation cancelled' } as TranslationError;
				}

				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk.split('\n').filter(line => line.trim());

				for (const line of lines) {
					try {
						const json = JSON.parse(line);
						if (json.message?.content) {
							full_text += json.message.content;
							on_chunk?.(json.message.content);
						}
					} catch {
						// Skip invalid JSON lines
					}
				}
			}

			active_controller = null;
			return full_text.trim();

		} catch (err) {
			last_error = err as Error;

			// Don't retry on specific errors
			if ((err as TranslationError).code === 'MODEL_NOT_FOUND') {
				throw err;
			}

			// Don't retry on cancellation
			if ((err as TranslationError).code === 'CANCELLED' || is_cancelled) {
				throw { code: 'CANCELLED', message: 'Translation cancelled' } as TranslationError;
			}

			if (attempt < MAX_RETRIES) {
				await sleep(1000 * (attempt + 1)); // Exponential backoff
			}
		}
	}

	// Check if Ollama is offline
	const status = await checkConnection();
	if (!status.connected) {
		throw {
			code: 'OLLAMA_OFFLINE',
			message: 'Cannot connect to Ollama. Please make sure Ollama is running.',
		} as TranslationError;
	}

	throw {
		code: 'NETWORK_ERROR',
		message: last_error?.message || 'Translation failed',
	} as TranslationError;
}
