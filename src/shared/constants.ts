import type { GlobalSettings } from './types';

// Supported languages (TranslateGemma 55 languages)
export const SUPPORTED_LANGUAGES = [
	{ code: 'zh-TW', name: '繁體中文' },
	{ code: 'zh-CN', name: '简体中文' },
	{ code: 'en', name: 'English' },
	{ code: 'ja', name: '日本語' },
	{ code: 'ko', name: '한국어' },
	{ code: 'es', name: 'Español' },
	{ code: 'fr', name: 'Français' },
	{ code: 'de', name: 'Deutsch' },
	{ code: 'ru', name: 'Русский' },
	{ code: 'ar', name: 'العربية' },
	{ code: 'hi', name: 'हिन्दी' },
	{ code: 'pt', name: 'Português' },
	{ code: 'it', name: 'Italiano' },
	{ code: 'nl', name: 'Nederlands' },
	{ code: 'pl', name: 'Polski' },
	{ code: 'tr', name: 'Türkçe' },
	{ code: 'sv', name: 'Svenska' },
	{ code: 'th', name: 'ไทย' },
	{ code: 'vi', name: 'Tiếng Việt' },
	{ code: 'id', name: 'Bahasa Indonesia' },
] as const;

// Default settings
export function getDefaultSettings(): GlobalSettings {
	const browser_lang = typeof navigator !== 'undefined'
		? navigator.language
		: 'en';

	let target_lang = 'en';
	if (browser_lang.startsWith('zh')) {
		target_lang = browser_lang.includes('TW') || browser_lang.includes('Hant')
			? 'zh-TW'
			: 'zh-CN';
	} else {
		const lang_code = browser_lang.split('-')[0];
		const supported = SUPPORTED_LANGUAGES.find(l => l.code.startsWith(lang_code));
		if (supported) {
			target_lang = supported.code;
		}
	}

	return {
		target_lang,
		model: 'translategemma:4b',
		temperature: 0.3,
		custom_prompt: null,
		ollama_url: 'http://localhost:11434',
	};
}

// DOM selectors for content script
export const TRANSLATABLE_SELECTORS = [
	'p',
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
	'li',
	'td', 'th',
	'blockquote',
	'figcaption',
	'article',
	'[data-translate]',
];

export const SKIP_SELECTORS = [
	'script',
	'style',
	'code',
	'pre',
	'noscript',
	'iframe',
	'svg',
	'input',
	'textarea',
	'select',
	'button',
	'nav',
	'header',
	'footer',
	'[contenteditable]',
	'[data-no-translate]',
	'.notranslate',
	'.ollama-translation',
];

// Minimum text length to translate
export const MIN_TEXT_LENGTH = 20;

// Translation timeout (ms)
export const TRANSLATION_TIMEOUT = 30000;

// Max retries for failed translations
export const MAX_RETRIES = 2;
