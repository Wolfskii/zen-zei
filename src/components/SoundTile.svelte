<script lang="ts">
	let soundName: any
	let soundFile: any
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

<div>
	<h3>{soundName}</h3>
	<button on:click={togglePlay}>
		{#if isPlaying}
			Pause
		{:else}
			Play
		{/if}
	</button>
	<audio controls autoplay>
		<source src={soundFile} type="audio/mpeg" />
	</audio>
	<slot />
</div>
