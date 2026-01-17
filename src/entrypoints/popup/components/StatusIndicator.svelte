<script lang="ts">
	import { ollama_status, retryConnection } from '../stores/settings';

	let is_retrying = false;

	async function handleRetry() {
		is_retrying = true;
		await retryConnection();
		is_retrying = false;
	}
</script>

<div class="status-indicator" class:connected={$ollama_status.connected}>
	{#if $ollama_status.connected}
		<span class="status-dot"></span>
		<span>Connected to Ollama</span>
	{:else}
		<span class="status-dot"></span>
		<span>Disconnected</span>
		<button
			class="retry-btn"
			on:click={handleRetry}
			disabled={is_retrying}
		>
			{is_retrying ? '...' : 'Retry'}
		</button>
	{/if}
</div>

<style>
	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: #fef2f2;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #991b1b;
	}

	.status-indicator.connected {
		background: #f0fdf4;
		color: #166534;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
	}

	.connected .status-dot {
		background: #22c55e;
	}

	.retry-btn {
		margin-left: auto;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 150ms, transform 100ms, box-shadow 150ms;
	}

	.retry-btn:hover:not(:disabled) {
		background: #dc2626;
	}

	.retry-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.retry-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px #fef2f2, 0 0 0 4px #ef4444;
	}

	.retry-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-color-scheme: dark) {
		.status-indicator {
			background: rgba(239, 68, 68, 0.1);
			color: #fca5a5;
		}

		.status-indicator.connected {
			background: rgba(34, 197, 94, 0.1);
			color: #86efac;
		}
	}
</style>
