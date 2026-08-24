<script lang="ts">
	import { Star } from '@lucide/svelte'

	let {
		value = 0,
		count = 0,
		mine = null,
		interactive = false,
		onchange
	}: {
		value?: number
		count?: number
		mine?: number | null
		interactive?: boolean
		onchange?: (stars: number) => void
	} = $props()

	let hover = $state(0)
	const display = $derived(hover || mine || value)
</script>

<div class="rating" class:interactive>
	<div class="stars" role={interactive ? 'radiogroup' : 'img'} aria-label={`${value.toFixed(1)} out of 5`}>
		{#each [1, 2, 3, 4, 5] as star}
			{#if interactive}
				<button
					type="button"
					class="star"
					class:on={display >= star}
					role="radio"
					aria-checked={mine === star}
					aria-label={`${star} star${star === 1 ? '' : 's'}`}
					onmouseenter={() => (hover = star)}
					onmouseleave={() => (hover = 0)}
					onclick={() => onchange?.(star)}
				>
					<Star size={16} strokeWidth={1.6} fill={display >= star ? 'currentColor' : 'none'} />
				</button>
			{:else}
				<span class="star" class:on={value >= star - 0.25}>
					<Star size={16} strokeWidth={1.6} fill={value >= star - 0.25 ? 'currentColor' : 'none'} />
				</span>
			{/if}
		{/each}
	</div>
	<span class="meta">{value > 0 ? value.toFixed(1) : '—'} · {count}</span>
</div>

<style>
	.rating {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--gold);
	}

	.stars {
		display: flex;
		gap: 0.05rem;
	}

	.star {
		background: none;
		border: 0;
		padding: 0.05rem;
		color: inherit;
		opacity: 0.35;
		display: inline-flex;
	}

	.star.on {
		opacity: 1;
	}

	.interactive .star {
		cursor: pointer;
	}

	.meta {
		color: var(--muted);
		font-size: 0.75rem;
	}
</style>
