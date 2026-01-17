<script lang="ts">
	import { settings, saveGlobalSettings } from '../stores/settings';

	let is_open = false;
	let temp_value = $settings.temperature;
	let prompt_value = $settings.custom_prompt || '';

	function toggle() {
		is_open = !is_open;
	}

	async function handleTempChange(e: Event) {
		const target = e.target as HTMLInputElement;
		temp_value = parseFloat(target.value);
		await saveGlobalSettings({ temperature: temp_value });
	}

	async function handlePromptChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		prompt_value = target.value;
		await saveGlobalSettings({
			custom_prompt: prompt_value.trim() || null
		});
	}
</script>

<div class="advanced">
	<button class="toggle" on:click={toggle}>
		<span class="arrow" class:open={is_open}>&#9654;</span>
		Advanced Settings
	</button>

	{#if is_open}
		<div class="content">
			<div class="field">
				<label for="temperature">
					Temperature: {temp_value}
				</label>
				<input
					type="range"
					id="temperature"
					min="0"
					max="1"
					step="0.1"
					value={temp_value}
					on:change={handleTempChange}
				/>
			</div>

			<div class="field">
				<label for="prompt">Custom System Prompt</label>
				<textarea
					id="prompt"
					rows="3"
					placeholder="Leave empty for default..."
					value={prompt_value}
					on:change={handlePromptChange}
				></textarea>
			</div>
		</div>
	{/if}
</div>

<style>
	.advanced {
		border-top: 1px solid #e5e7eb;
		padding-top: 0.75rem;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		padding: 0.25rem 0;
		font-size: 0.875rem;
		color: #6b7280;
		cursor: pointer;
		border-radius: 4px;
		transition: color 150ms;
	}

	.toggle:hover {
		color: #374151;
	}

	.toggle:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
	}

	.arrow {
		font-size: 0.625rem;
		transition: transform 150ms;
	}

	.arrow.open {
		transform: rotate(90deg);
	}

	.content {
		margin-top: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #374151;
	}

	input[type="range"] {
		width: 100%;
	}

	textarea {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.8rem;
		font-family: inherit;
		resize: vertical;
		transition: border-color 150ms, box-shadow 150ms;
	}

	textarea:hover {
		border-color: #9ca3af;
	}

	textarea:focus {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
	}

	input[type="range"]:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
	}

	@media (prefers-color-scheme: dark) {
		.advanced {
			border-color: #374151;
		}

		.toggle {
			color: #9ca3af;
		}

		.toggle:hover {
			color: #d1d5db;
		}

		label {
			color: #d1d5db;
		}

		textarea {
			background: #1f2937;
			border-color: #374151;
			color: #f3f4f6;
		}

		textarea:hover {
			border-color: #4b5563;
		}
	}
</style>
