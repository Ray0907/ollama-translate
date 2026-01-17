<script lang="ts">
	import { settings, ollama_status, saveGlobalSettings } from '../stores/settings';

	// Auto-select first model if current setting not in list
	$: if ($ollama_status.models.length > 0 && !$ollama_status.models.includes($settings.model)) {
		saveGlobalSettings({ model: $ollama_status.models[0] });
	}

	async function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		await saveGlobalSettings({ model: target.value });
	}
</script>

<div class="field">
	<label for="model">Model</label>
	<select
		id="model"
		value={$settings.model}
		on:change={handleChange}
		disabled={!$ollama_status.connected}
	>
		{#if $ollama_status.models.length === 0}
			<option value="">No models found</option>
		{:else}
			{#each $ollama_status.models as model}
				<option value={model}>{model}</option>
			{/each}
		{/if}
	</select>

	{#if $ollama_status.connected && $ollama_status.models.length === 0}
		<p class="hint">
			Run <code>ollama pull translategemma:4b</code> to install a model.
		</p>
	{/if}
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

	select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.hint {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
	}

	code {
		background: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 3px;
		font-size: 0.7rem;
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

		.hint {
			color: #9ca3af;
		}

		code {
			background: #374151;
		}
	}
</style>
