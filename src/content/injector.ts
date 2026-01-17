import type { TranslationStatus } from '../shared/types';

export function injectTranslation(id: string, text: string): void {
	const original = document.querySelector(`[data-ollama-id="${id}"]`);
	if (!original) return;

	// Mark as translated
	original.setAttribute('data-ollama-translated', 'true');

	// Check if translation element already exists
	let translation_el = document.querySelector(
		`.ollama-translation[data-ollama-for="${id}"]`
	) as HTMLElement | null;

	if (!translation_el) {
		// Create new translation element
		translation_el = document.createElement('div');
		translation_el.className = 'ollama-translation';
		translation_el.setAttribute('data-ollama-for', id);
		original.insertAdjacentElement('afterend', translation_el);
	}

	translation_el.textContent = text;
	translation_el.classList.remove('ollama-translation--loading', 'ollama-translation--error');
}

export function updateStatus(id: string, status: TranslationStatus, error?: string): void {
	const original = document.querySelector(`[data-ollama-id="${id}"]`);
	if (!original) return;

	let translation_el = document.querySelector(
		`.ollama-translation[data-ollama-for="${id}"]`
	) as HTMLElement | null;

	if (!translation_el && status !== 'done') {
		// Create placeholder
		translation_el = document.createElement('div');
		translation_el.className = 'ollama-translation ollama-translation--loading';
		translation_el.setAttribute('data-ollama-for', id);
		original.insertAdjacentElement('afterend', translation_el);
	}

	if (!translation_el) return;

	switch (status) {
		case 'queued':
			translation_el.textContent = 'Queued...';
			translation_el.classList.add('ollama-translation--loading');
			break;

		case 'translating':
			translation_el.textContent = 'Translating...';
			translation_el.classList.add('ollama-translation--loading');
			break;

		case 'done':
			translation_el.classList.remove('ollama-translation--loading');
			break;

		case 'error':
			translation_el.classList.remove('ollama-translation--loading');
			translation_el.classList.add('ollama-translation--error');
			translation_el.innerHTML = `
				<span class="ollama-error-text">${error || 'Translation failed'}</span>
				<button class="ollama-retry-btn" data-ollama-retry="${id}">Retry</button>
			`;
			break;
	}
}

export function removeTranslation(id: string): void {
	const translation_el = document.querySelector(
		`.ollama-translation[data-ollama-for="${id}"]`
	);
	translation_el?.remove();

	const original = document.querySelector(`[data-ollama-id="${id}"]`);
	original?.removeAttribute('data-ollama-translated');
}
