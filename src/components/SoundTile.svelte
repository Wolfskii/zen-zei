<script lang="ts">
	export let soundName: string
	export let soundFile: string
	let isPlaying = false

	function togglePlay(event: any) {
		const audio = event.target.nextElementSibling as HTMLAudioElement
		if (audio.paused) {
			audio.play()
			isPlaying = true
		} else {
			audio.pause()
			isPlaying = false
		}
	}
</script>

<div class="sound-tile">
	<h3>{soundName}</h3>
	<button on:click={togglePlay}>
		{#if isPlaying}
			Pause
		{:else}
			Play
		{/if}
	</button>
	<audio>
		<source src={soundFile} />
	</audio>
	<slot />
</div>

<style>
	.sound-tile {
		background-color: rgba(0, 0, 0, 0.2);
		aspect-ratio: 1/1;
		padding: 2rem;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		text-align: center;
	}
</style>
