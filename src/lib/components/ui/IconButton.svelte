<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		label,
		active = false,
		disabled = false,
		onclick,
		children
	}: {
		label: string
		active?: boolean
		disabled?: boolean
		onclick?: (event: MouseEvent) => void
		children: Snippet
	} = $props()
</script>

<button type="button" class="icon-btn" class:active {disabled} {onclick} aria-label={label} title={label}>
	{@render children()}
</button>

<style>
	.icon-btn {
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: var(--glass);
		color: var(--text);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(16px);
		transition: background 0.15s ease, box-shadow 0.15s ease;
	}

	.icon-btn:hover,
	.icon-btn.active {
		background: var(--glass-strong);
		box-shadow: 0 0 0 1px var(--glass-highlight);
	}

	.icon-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
