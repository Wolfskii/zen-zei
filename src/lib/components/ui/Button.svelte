<script lang="ts">
	import type { Snippet } from 'svelte'

	type Variant = 'primary' | 'ghost' | 'glass' | 'danger'

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		onclick,
		children,
		ariaLabel
	}: {
		variant?: Variant
		type?: 'button' | 'submit'
		disabled?: boolean
		onclick?: (event: MouseEvent) => void
		children: Snippet
		ariaLabel?: string
	} = $props()
</script>

<button {type} class="btn {variant}" {disabled} {onclick} aria-label={ariaLabel}>
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		border-radius: 999px;
		padding: 0.65rem 1.15rem;
		border: 1px solid transparent;
		transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn:not(:disabled):hover {
		transform: translateY(-1px);
	}

	.primary {
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
		color: #102018;
		font-weight: 600;
	}

	.ghost {
		background: transparent;
		border-color: var(--glass-border);
		color: var(--text);
	}

	.glass {
		background: var(--glass);
		border-color: var(--glass-border);
		backdrop-filter: blur(16px);
	}

	.danger {
		background: rgba(224, 139, 139, 0.16);
		border-color: rgba(224, 139, 139, 0.35);
		color: #ffd6d6;
	}
</style>
