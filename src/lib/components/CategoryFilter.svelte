<script lang="ts">
	import { Heart } from '@lucide/svelte'
	import type { Category } from '$lib/types'
	import Icon from './ui/Icon.svelte'

	let {
		categories,
		value = $bindable<string | null>(null),
		favouritesOnly = $bindable(false),
		nowOnly = $bindable(false),
		favouriteCount = 0,
		playingCount = 0,
		listActive = false,
		onpick
	}: {
		categories: Category[]
		value?: string | null
		favouritesOnly?: boolean
		nowOnly?: boolean
		favouriteCount?: number
		playingCount?: number
		listActive?: boolean
		onpick?: () => void
	} = $props()

	function showAll() {
		value = null
		favouritesOnly = false
		nowOnly = false
		onpick?.()
	}

	function showFavourites() {
		value = null
		favouritesOnly = true
		nowOnly = false
		onpick?.()
	}

	function showNow() {
		value = null
		favouritesOnly = false
		nowOnly = true
		onpick?.()
	}

	function showCategory(slug: string) {
		value = slug
		favouritesOnly = false
		nowOnly = false
		onpick?.()
	}
</script>

<div class="chips" role="tablist" aria-label="Categories">
	<button type="button" class="chip" class:on={!value && !favouritesOnly && !nowOnly && !listActive} onclick={showAll}>All</button>
	<button type="button" class="chip fav" class:on={favouritesOnly} onclick={showFavourites}>
		<Heart size={14} fill={favouritesOnly || favouriteCount > 0 ? 'currentColor' : 'none'} />
		Favourites
		{#if favouriteCount > 0}
			<small>{favouriteCount}</small>
		{/if}
	</button>
	{#if playingCount > 0 || nowOnly}
		<button type="button" class="chip" class:on={nowOnly} aria-label="Now playing" onclick={showNow}>
			Now
			<small>{playingCount}</small>
		</button>
	{/if}
	{#each categories as category}
						<button type="button" class="chip" class:on={!favouritesOnly && !nowOnly && value === category.slug} onclick={() => showCategory(category.slug)}>
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

	.chip small {
		color: inherit;
		opacity: 0.75;
		font-size: 0.72rem;
	}

	.chip.on {
		color: #102018;
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
		border-color: transparent;
		font-weight: 600;
	}
</style>
