import type {
	TranslateRequest,
	GetSettingsRequest,
	GetModelsRequest,
	CheckConnectionRequest,
	StatusUpdate,
	TranslateResponse,
	ProgressUpdate,
} from '../shared/types';
import { getEffectiveSettings, updateGlobalSettings, updateSiteSettings } from './storage';
import {
	checkConnection,
	getAvailableModels,
	translateText,
	cancelTranslation,
	isTranslationCancelled,
	resetCancellation,
} from './ollama';

type MessageRequest =
	| TranslateRequest
	| GetSettingsRequest
	| GetModelsRequest
	| CheckConnectionRequest
	| { action: 'update_global_settings'; updates: Record<string, unknown> }
	| { action: 'update_site_settings'; domain: string; updates: Record<string, unknown> }
	| { action: 'cancel_translation' };

export function setupMessageHandlers(): void {
	chrome.runtime.onMessage.addListener((
		request: MessageRequest,
		sender,
		sendResponse
	) => {
		handleMessage(request, sender).then(sendResponse);
		return true; // Keep channel open for async response
	});
}

async function handleMessage(
	request: MessageRequest,
	sender: chrome.runtime.MessageSender
): Promise<unknown> {
	switch (request.action) {
		case 'check_connection':
			return checkConnection();

		case 'get_models':
			return getAvailableModels();

		case 'get_settings': {
			const domain = (request as GetSettingsRequest).domain;
			return getEffectiveSettings(domain);
		}

		case 'update_global_settings': {
			const { updates } = request as { action: string; updates: Record<string, unknown> };
			return updateGlobalSettings(updates);
		}

		case 'update_site_settings': {
			const { domain, updates } = request as {
				action: string;
				domain: string;
				updates: Record<string, unknown>;
			};
			await updateSiteSettings(domain, updates);
			return { success: true };
		}

		case 'cancel_translation': {
			cancelTranslation();
			return { success: true };
		}

		case 'translate': {
			const { paragraphs, target_lang, source_lang } = request as TranslateRequest;
			const tab_id = sender.tab?.id;

			if (!tab_id) {
				return { error: 'No tab ID' };
			}

			// Reset cancellation state before starting
			resetCancellation();

			const total = paragraphs.length;

			// Process paragraphs sequentially
			for (let i = 0; i < paragraphs.length; i++) {
				const para = paragraphs[i];

				// Check if cancelled before processing next paragraph
				if (isTranslationCancelled()) {
					// Mark remaining paragraphs as cancelled
					for (let j = i; j < paragraphs.length; j++) {
						await sendStatusUpdate(tab_id, {
							action: 'status',
							paragraph_id: paragraphs[j].id,
							status: 'error',
							error: 'Cancelled',
						});
					}
					return { success: false, cancelled: true };
				}

				// Send progress update
				await sendProgressUpdate(tab_id, { action: 'progress', current: i + 1, total });

				// Send status update: translating
				await sendStatusUpdate(tab_id, {
					action: 'status',
					paragraph_id: para.id,
					status: 'translating',
				});

				try {
					let accumulated_text = '';

					const translation = await translateText(
						para.text,
						target_lang,
						source_lang,
						(chunk) => {
							accumulated_text += chunk;
							// Send chunk update
							chrome.tabs.sendMessage(tab_id, {
								action: 'translation_chunk',
								paragraph_id: para.id,
								text: accumulated_text,
								done: false,
							} as TranslateResponse);
						}
					);

					// Send final translation
					await chrome.tabs.sendMessage(tab_id, {
						action: 'translation_chunk',
						paragraph_id: para.id,
						text: translation,
						done: true,
					} as TranslateResponse);

					// Send status update: done
					await sendStatusUpdate(tab_id, {
						action: 'status',
						paragraph_id: para.id,
						status: 'done',
					});

				} catch (err) {
					const error = err as { code?: string; message?: string };

					// If cancelled, mark remaining as cancelled and exit
					if (error.code === 'CANCELLED' || isTranslationCancelled()) {
						await sendStatusUpdate(tab_id, {
							action: 'status',
							paragraph_id: para.id,
							status: 'error',
							error: 'Cancelled',
						});
						// Mark remaining paragraphs
						for (let j = i + 1; j < paragraphs.length; j++) {
							await sendStatusUpdate(tab_id, {
								action: 'status',
								paragraph_id: paragraphs[j].id,
								status: 'error',
								error: 'Cancelled',
							});
						}
						return { success: false, cancelled: true };
					}

					await sendStatusUpdate(tab_id, {
						action: 'status',
						paragraph_id: para.id,
						status: 'error',
						error: error.message || 'Translation failed',
					});
				}
			}

			return { success: true };
		}

		default:
			return { error: 'Unknown action' };
	}
}

async function sendStatusUpdate(tab_id: number, update: StatusUpdate): Promise<void> {
	try {
		await chrome.tabs.sendMessage(tab_id, update);
	} catch {
		// Tab might be closed
	}
}

async function sendProgressUpdate(tab_id: number, update: ProgressUpdate): Promise<void> {
	try {
		await chrome.tabs.sendMessage(tab_id, update);
	} catch {
		// Tab might be closed
	}
}
