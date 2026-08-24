<script lang="ts">
	import type { Category } from '$lib/types'
	import Icon from './ui/Icon.svelte'

	let {
		categories,
		value = $bindable<string | null>(null)
	}: {
		categories: Category[]
		value?: string | null
	} = $props()
</script>

<div class="chips" role="tablist" aria-label="Categories">
	<button type="button" class="chip" class:on={!value} onclick={() => (value = null)}>All</button>
	{#each categories as category}
		<button type="button" class="chip" class:on={value === category.slug} onclick={() => (value = category.slug)}>
			<Icon name={category.icon} size={15} />
			{category.name}
		</button>
	{/each}
</div>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem 0.85rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: var(--glass);
		backdrop-filter: blur(12px);
		color: var(--muted);
	}

	.chip.on {
		color: #102018;
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
		border-color: transparent;
		font-weight: 600;
	}
</style>
