<script lang="ts">
	import { ollama_status, retryConnection } from '../stores/settings';

	let is_retrying = false;

	async function handleRetry() {
		is_retrying = true;
		await retryConnection();
		is_retrying = false;
	}
</script>

{#if !$ollama_status.connected}
	<div class="error-box">
		<div class="error-icon">!</div>
		<div class="error-content">
			<p class="error-title">Cannot connect to Ollama</p>
			<p class="error-text">Ollama is not running on your computer.</p>
			<ol class="error-steps">
				<li>Open Terminal</li>
				<li>Run: <code>ollama serve</code></li>
			</ol>
			<div class="error-actions">
				<button
					class="btn btn-primary"
					on:click={handleRetry}
					disabled={is_retrying}
				>
					{is_retrying ? 'Checking...' : 'Retry Connection'}
				</button>
				<a
					class="btn btn-secondary"
					href="https://ollama.com"
					target="_blank"
				>
					Get Ollama
				</a>
			</div>
		</div>
	</div>
{/if}

<style>
	.error-box {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
	}

	.error-icon {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #ef4444;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.error-content {
		flex: 1;
	}

	.error-title {
		margin: 0 0 0.25rem;
		font-weight: 600;
		color: #991b1b;
		font-size: 0.875rem;
	}

	.error-text {
		margin: 0 0 0.5rem;
		color: #b91c1c;
		font-size: 0.8rem;
	}

	.error-steps {
		margin: 0 0 0.75rem;
		padding-left: 1.25rem;
		font-size: 0.8rem;
		color: #b91c1c;
	}

	.error-steps li {
		margin-bottom: 0.25rem;
	}

	code {
		background: #fee2e2;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		font-size: 0.75rem;
	}

	.error-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.375rem 0.75rem;
		font-size: 0.8rem;
		border-radius: 6px;
		cursor: pointer;
		text-decoration: none;
		border: none;
	}

	.btn-primary {
		background: #ef4444;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #dc2626;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	.btn-secondary:hover {
		background: #fef2f2;
	}

	@media (prefers-color-scheme: dark) {
		.error-box {
			background: rgba(239, 68, 68, 0.1);
			border-color: rgba(239, 68, 68, 0.3);
		}

		.error-title {
			color: #fca5a5;
		}

		.error-text,
		.error-steps {
			color: #fca5a5;
		}

		code {
			background: rgba(239, 68, 68, 0.2);
		}

		.btn-secondary {
			background: #1f2937;
			color: #fca5a5;
			border-color: rgba(239, 68, 68, 0.3);
		}
	}
</style>
