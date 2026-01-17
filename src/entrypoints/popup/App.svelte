<script lang="ts">
	import { onMount } from 'svelte';
	import {
		initializeStores,
		is_loading,
		ollama_status,
		current_domain,
		site_auto_translate,
		saveSiteSettings,
	} from './stores/settings';
	import StatusIndicator from './components/StatusIndicator.svelte';
	import LanguageSelect from './components/LanguageSelect.svelte';
	import ModelSelect from './components/ModelSelect.svelte';
	import AdvancedSettings from './components/AdvancedSettings.svelte';
	import ErrorDisplay from './components/ErrorDisplay.svelte';
	import './app.css';

	onMount(() => {
		initializeStores();
	});

	async function handleAutoTranslateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		await saveSiteSettings($current_domain, target.checked);
	}

	async function translateCurrentPage() {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tab?.id) {
			await chrome.tabs.sendMessage(tab.id, { action: 'trigger_translate' });
			window.close();
		}
	}
</script>

<main>
	<header>
		<h1>Ollama Translate</h1>
	</header>

	{#if $is_loading}
		<div class="loading">Loading...</div>
	{:else}
		<div class="content">
			<ErrorDisplay />

			{#if $ollama_status.connected}
				<StatusIndicator />

				<div class="settings">
					<LanguageSelect />
					<ModelSelect />

					{#if $current_domain}
						<div class="auto-translate">
							<label class="checkbox-label">
								<input
									type="checkbox"
									checked={$site_auto_translate}
									on:change={handleAutoTranslateChange}
								/>
								Auto-translate on {$current_domain}
							</label>
						</div>
					{/if}

					<AdvancedSettings />
				</div>

				<button class="translate-btn" on:click={translateCurrentPage}>
					Translate This Page
				</button>
			{/if}
		</div>
	{/if}
</main>

<style>
	main {
		padding: 1rem;
	}

	header {
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}

	h1 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
	}

	.loading {
		padding: 2rem;
		text-align: center;
		color: #6b7280;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.settings {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.auto-translate {
		padding: 0.5rem 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
	}

	.checkbox-label input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}

	.translate-btn {
		width: 100%;
		padding: 0.75rem;
		margin-top: 0.5rem;
		background: #f59e0b;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 150ms;
	}

	.translate-btn:hover {
		background: #d97706;
	}

	.translate-btn:active {
		background: #b45309;
	}

	@media (prefers-color-scheme: dark) {
		header {
			border-color: #374151;
		}

		h1 {
			color: #f3f4f6;
		}

		.checkbox-label {
			color: #d1d5db;
		}
	}
</style>
