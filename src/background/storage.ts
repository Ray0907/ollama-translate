import type { GlobalSettings, SiteSettings, EffectiveSettings } from '../shared/types';
import { getDefaultSettings } from '../shared/constants';

const STORAGE_KEYS = {
	GLOBAL: 'global_settings',
	SITES: 'site_settings',
};

export async function getGlobalSettings(): Promise<GlobalSettings> {
	const result = await chrome.storage.local.get(STORAGE_KEYS.GLOBAL);
	return result[STORAGE_KEYS.GLOBAL] || getDefaultSettings();
}

export async function getSiteSettings(): Promise<SiteSettings> {
	const result = await chrome.storage.local.get(STORAGE_KEYS.SITES);
	return result[STORAGE_KEYS.SITES] || {};
}

export async function getEffectiveSettings(domain?: string): Promise<EffectiveSettings> {
	const global_settings = await getGlobalSettings();
	const site_settings = await getSiteSettings();

	const site_override = domain ? site_settings[domain] : undefined;

	return {
		...global_settings,
		...site_override,
		auto_translate: site_override?.auto_translate ?? false,
	};
}

export async function updateGlobalSettings(
	updates: Partial<GlobalSettings>
): Promise<GlobalSettings> {
	const current = await getGlobalSettings();
	const updated = { ...current, ...updates };
	await chrome.storage.local.set({ [STORAGE_KEYS.GLOBAL]: updated });
	return updated;
}

export async function updateSiteSettings(
	domain: string,
	updates: Partial<SiteSettings[string]>
): Promise<void> {
	const current = await getSiteSettings();
	const site_current = current[domain] || { auto_translate: false };
	const updated = {
		...current,
		[domain]: { ...site_current, ...updates },
	};
	await chrome.storage.local.set({ [STORAGE_KEYS.SITES]: updated });
}

export async function removeSiteSettings(domain: string): Promise<void> {
	const current = await getSiteSettings();
	delete current[domain];
	await chrome.storage.local.set({ [STORAGE_KEYS.SITES]: current });
}
