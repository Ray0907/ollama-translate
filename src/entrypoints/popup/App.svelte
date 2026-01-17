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
		<div class="loading">
			<div class="skeleton skeleton-status"></div>
			<div class="skeleton skeleton-field"></div>
			<div class="skeleton skeleton-field"></div>
			<div class="skeleton skeleton-btn"></div>
		</div>
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
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.skeleton {
		background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
		background-size: 200% 100%;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		border-radius: 6px;
	}

	.skeleton-status {
		height: 40px;
	}

	.skeleton-field {
		height: 60px;
	}

	.skeleton-btn {
		height: 44px;
		margin-top: 0.5rem;
	}

	@keyframes skeleton-pulse {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
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
		padding: 0.25rem;
		border-radius: 4px;
		transition: background-color 150ms;
	}

	.checkbox-label:hover {
		background: #f9fafb;
	}

	.checkbox-label input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		accent-color: #f59e0b;
	}

	.checkbox-label input:focus-visible {
		outline: 2px solid #f59e0b;
		outline-offset: 2px;
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
		transition: background 150ms, transform 100ms, box-shadow 150ms;
	}

	.translate-btn:hover {
		background: #d97706;
	}

	.translate-btn:active {
		background: #b45309;
		transform: scale(0.98);
	}

	.translate-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px white, 0 0 0 4px #f59e0b;
	}

	@media (prefers-color-scheme: dark) {
		header {
			border-color: #374151;
		}

		h1 {
			color: #f3f4f6;
		}

		.skeleton {
			background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
			background-size: 200% 100%;
		}

		.checkbox-label {
			color: #d1d5db;
		}

		.checkbox-label:hover {
			background: #1f2937;
		}

		.translate-btn:focus-visible {
			box-shadow: 0 0 0 2px #111827, 0 0 0 4px #f59e0b;
		}
	}
</style>
