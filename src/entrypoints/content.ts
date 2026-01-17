import type { TranslateResponse, StatusUpdate, EffectiveSettings, ProgressUpdate } from '../shared/types';
import { extractVisibleFirst, clearTranslations } from '../content/parser';
import { injectTranslation, updateStatus } from '../content/injector';
import { createFloatingButton, setButtonState, getButtonState, updateProgress } from '../content/button';
import '../content/styles.css';

let is_translating = false;
let current_settings: EffectiveSettings | null = null;

export default defineContentScript({
	matches: ['<all_urls>'],
	runAt: 'document_idle',

	async main() {
		// Get current domain
		const domain = window.location.hostname;

		// Get settings for this domain
		current_settings = await chrome.runtime.sendMessage({
			action: 'get_settings',
			domain,
		});

		// Create floating button with cancel callback
		createFloatingButton(handleTranslateClick, handleCancelClick);

		// Auto-translate if enabled for this site
		if (current_settings?.auto_translate) {
			startTranslation();
		}

		// Listen for messages from background
		chrome.runtime.onMessage.addListener(handleMessage);

		// Auto-cancel translation when leaving page
		window.addEventListener('beforeunload', handlePageLeave);
	},
});

function handleMessage(
	message: TranslateResponse | StatusUpdate | ProgressUpdate | { action: string }
): void {
	if (message.action === 'translation_chunk') {
		const { paragraph_id, text, done } = message as TranslateResponse;
		injectTranslation(paragraph_id, text);

		if (done) {
			checkAllDone();
		}
	} else if (message.action === 'status') {
		const { paragraph_id, status, error } = message as StatusUpdate;
		updateStatus(paragraph_id, status, error);

		if (status === 'done' || status === 'error') {
			checkAllDone();
		}
	} else if (message.action === 'progress') {
		const { current, total } = message as ProgressUpdate;
		updateProgress(current, total);
	} else if (message.action === 'trigger_translate') {
		// Triggered from popup
		handleTranslateClick();
	}
}

async function handleTranslateClick(): Promise<void> {
	if (is_translating) return;

	const state = getButtonState();

	if (state === 'done') {
		// Clear translations
		clearTranslations();
		setButtonState('idle');
		return;
	}

	startTranslation();
}

async function handleCancelClick(): Promise<void> {
	console.log('[Content] handleCancelClick called, is_translating:', is_translating);
	if (!is_translating) return;

	// Send cancel message to background
	await chrome.runtime.sendMessage({ action: 'cancel_translation' });

	// Reset state
	is_translating = false;
	setButtonState('idle');
	updateProgress(0, 0);
}

function handlePageLeave(): void {
	console.log('[Content] handlePageLeave called, is_translating:', is_translating);
	if (is_translating) {
		// Fire and forget - page is closing
		chrome.runtime.sendMessage({ action: 'cancel_translation' });
	}
}

async function startTranslation(): Promise<void> {
	if (is_translating) return;

	is_translating = true;
	setButtonState('translating');

	// Always fetch fresh settings before translating
	const domain = window.location.hostname;
	current_settings = await chrome.runtime.sendMessage({
		action: 'get_settings',
		domain,
	});

	// Extract paragraphs (visible first)
	const paragraphs = extractVisibleFirst();

	if (paragraphs.length === 0) {
		is_translating = false;
		setButtonState('idle');
		return;
	}

	// Mark all as queued
	for (const para of paragraphs) {
		updateStatus(para.id, 'queued');
	}

	// Send to background for translation
	await chrome.runtime.sendMessage({
		action: 'translate',
		paragraphs,
		target_lang: current_settings?.target_lang || 'en',
	});
}

function checkAllDone(): void {
	const loading = document.querySelectorAll('.ollama-translation--loading');

	if (loading.length === 0) {
		is_translating = false;
		setButtonState('done');
		updateProgress(0, 0);
	}
}

// Handle retry button clicks
document.addEventListener('click', async (e) => {
	const target = e.target as HTMLElement;
	const retry_id = target.getAttribute?.('data-ollama-retry');

	if (retry_id) {
		const original = document.querySelector(`[data-ollama-id="${retry_id}"]`);
		if (!original) return;

		const text = original.textContent?.trim() || '';

		// Fetch fresh settings for retry
		const domain = window.location.hostname;
		const fresh_settings = await chrome.runtime.sendMessage({
			action: 'get_settings',
			domain,
		});

		updateStatus(retry_id, 'translating');

		await chrome.runtime.sendMessage({
			action: 'translate',
			paragraphs: [{ id: retry_id, text }],
			target_lang: fresh_settings?.target_lang || 'en',
		});
	}
});
