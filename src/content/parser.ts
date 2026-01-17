import type { TranslatableElement } from '../shared/types';
import {
	TRANSLATABLE_SELECTORS,
	SKIP_SELECTORS,
	MIN_TEXT_LENGTH,
} from '../shared/constants';

export function extractParagraphs(): TranslatableElement[] {
	const elements: TranslatableElement[] = [];
	const skip_selector = SKIP_SELECTORS.join(',');

	const candidates = document.querySelectorAll(
		TRANSLATABLE_SELECTORS.join(',')
	);

	for (const el of candidates) {
		// Skip if inside excluded element
		if (el.closest(skip_selector)) continue;

		// Skip if already translated
		if (el.hasAttribute('data-ollama-translated')) continue;

		// Skip if already has translate ID (processing)
		if (el.hasAttribute('data-ollama-id')) continue;

		// Get direct text content (not nested)
		const text = getDirectTextContent(el);

		// Skip if too short
		if (text.length < MIN_TEXT_LENGTH) continue;

		// Generate unique ID
		const id = `ollama-${crypto.randomUUID().slice(0, 8)}`;
		el.setAttribute('data-ollama-id', id);

		elements.push({ id, text });
	}

	return elements;
}

function getDirectTextContent(element: Element): string {
	let text = '';

	for (const node of element.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			text += node.textContent || '';
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			const tag = (node as Element).tagName.toLowerCase();
			// Include inline elements
			if (['a', 'strong', 'em', 'b', 'i', 'span', 'mark'].includes(tag)) {
				text += node.textContent || '';
			}
		}
	}

	return text.trim();
}

export function extractVisibleFirst(): TranslatableElement[] {
	const all = extractParagraphs();

	return all.sort((a, b) => {
		const el_a = document.querySelector(`[data-ollama-id="${a.id}"]`);
		const el_b = document.querySelector(`[data-ollama-id="${b.id}"]`);

		if (!el_a || !el_b) return 0;

		const rect_a = el_a.getBoundingClientRect();
		const rect_b = el_b.getBoundingClientRect();

		const in_viewport_a = rect_a.top < window.innerHeight && rect_a.bottom > 0;
		const in_viewport_b = rect_b.top < window.innerHeight && rect_b.bottom > 0;

		if (in_viewport_a && !in_viewport_b) return -1;
		if (!in_viewport_a && in_viewport_b) return 1;

		return rect_a.top - rect_b.top;
	});
}

export function clearTranslations(): void {
	// Remove all translation elements
	document.querySelectorAll('.ollama-translation').forEach(el => el.remove());

	// Remove data attributes
	document.querySelectorAll('[data-ollama-id]').forEach(el => {
		el.removeAttribute('data-ollama-id');
		el.removeAttribute('data-ollama-translated');
	});
}
