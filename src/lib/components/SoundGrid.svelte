<script lang="ts">
	import type { SavedList } from '$lib/shelf'
	import type { Sound } from '$lib/types'
	import SoundCard from './SoundCard.svelte'

	let {
		sounds,
		favorites = [],
		lists = [],
		mixing = false,
		onvote,
		onfavorite,
		onToggleList,
		onCreateList
	}: {
		sounds: Sound[]
		favorites?: string[]
		lists?: SavedList[]
		mixing?: boolean
		onvote: (sound: Sound, stars: number) => void
		onfavorite?: (sound: Sound) => void
		onToggleList?: (sound: Sound, listId: string) => void
		onCreateList?: (sound: Sound, name: string) => void
	} = $props()
</script>

<div class="grid" class:mixing>
	{#each sounds as sound (sound.id)}
		<SoundCard
			{sound}
			{lists}
			favorited={favorites.includes(sound.id)}
			onvote={(stars) => onvote(sound, stars)}
			onfavorite={() => onfavorite?.(sound)}
			onToggleList={(listId) => onToggleList?.(sound, listId)}
			onCreateList={(name) => onCreateList?.(sound, name)}
		/>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16.5rem, 1fr));
		gap: 1.1rem;
	}

	.grid.mixing :global(.card:not(.playing)) {
		opacity: 0.48;
		filter: saturate(0.72);
		transition:
			opacity 0.35s ease,
			filter 0.35s ease;
	}

	.grid.mixing :global(.card:not(.playing):hover),
	.grid.mixing :global(.card.picking) {
		opacity: 1;
		filter: none;
	}
</style>
