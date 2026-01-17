<script lang="ts">
	import { settings, saveGlobalSettings } from '../stores/settings';
	import { SUPPORTED_LANGUAGES } from '../../../shared/constants';

	async function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		await saveGlobalSettings({ target_lang: target.value });
	}
</script>

<div class="field">
	<label for="language">Target Language</label>
	<select id="language" value={$settings.target_lang} on:change={handleChange}>
		{#each SUPPORTED_LANGUAGES as lang}
			<option value={lang.code}>{lang.name}</option>
		{/each}
	</select>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: white;
		cursor: pointer;
		transition: border-color 150ms, box-shadow 150ms;
	}

	select:hover:not(:disabled) {
		border-color: #9ca3af;
	}

	select:focus {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
	}

	select:focus-visible {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
	}

	@media (prefers-color-scheme: dark) {
		label {
			color: #d1d5db;
		}

		select {
			background: #1f2937;
			border-color: #374151;
			color: #f3f4f6;
		}

		select:hover:not(:disabled) {
			border-color: #4b5563;
		}
	}
</style>
