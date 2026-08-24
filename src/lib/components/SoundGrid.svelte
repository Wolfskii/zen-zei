<script lang="ts">
	import type { Sound } from '$lib/types'
	import SoundCard from './SoundCard.svelte'

	let {
		sounds,
		canDelete = false,
		onvote,
		ondelete
	}: {
		sounds: Sound[]
		canDelete?: boolean
		onvote: (sound: Sound, stars: number) => void
		ondelete?: (sound: Sound) => void
	} = $props()
</script>

<div class="grid">
	{#each sounds as sound (sound.id)}
		<SoundCard {sound} {canDelete} onvote={(stars) => onvote(sound, stars)} ondelete={() => ondelete?.(sound)} />
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16.5rem, 1fr));
		gap: 1.1rem;
	}
</style>
