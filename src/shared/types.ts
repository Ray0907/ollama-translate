// Settings types
export type GlobalSettings = {
	target_lang: string;
	model: string;
	temperature: number;
	custom_prompt: string | null;
	ollama_url: string;
};

export type SiteSettings = {
	[domain: string]: {
		auto_translate: boolean;
		model?: string;
		target_lang?: string;
	};
};

export type EffectiveSettings = GlobalSettings & {
	auto_translate: boolean;
};

// Translation types
export type TranslatableElement = {
	id: string;
	text: string;
};

export type TranslationStatus = 'queued' | 'translating' | 'done' | 'error';

// Message types (Content <-> Background)
export type TranslateRequest = {
	action: 'translate';
	paragraphs: TranslatableElement[];
	target_lang: string;
	source_lang?: string;
};

export type TranslateResponse = {
	action: 'translation_chunk';
	paragraph_id: string;
	text: string;
	done: boolean;
};

export type StatusUpdate = {
	action: 'status';
	paragraph_id: string;
	status: TranslationStatus;
	error?: string;
};

export type GetSettingsRequest = {
	action: 'get_settings';
	domain?: string;
};

export type GetModelsRequest = {
	action: 'get_models';
};

export type CheckConnectionRequest = {
	action: 'check_connection';
};

export type OllamaStatus = {
	connected: boolean;
	models: string[];
};

// Error types
export type TranslationError =
	| { code: 'OLLAMA_OFFLINE'; message: string }
	| { code: 'MODEL_NOT_FOUND'; message: string; model: string }
	| { code: 'NETWORK_ERROR'; message: string }
	| { code: 'TIMEOUT'; message: string; paragraph_id: string };
