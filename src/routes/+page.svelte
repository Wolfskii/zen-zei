<script lang="ts">
	import SoundTile from '../components/SoundTile.svelte'
	import RainSound from '../lib/sounds/rain.wav'
</script>

<div class="intro">
	<h1>Zen-Zei</h1>
	<p class="sub-heading">Relax to sounds of the nature</p>
</div>

<div class="sound-tiles">
	<SoundTile soundName="Thunder" youTubeUrl="https://www.youtube.com/watch?v=NI0M03vCoXg" />
	<SoundTile soundName="Rain" soundFile={RainSound} />
</div>

<style>
	:global(:root) {
		display: flex;
		justify-content: center;
	}

	.intro {
		display: flex;
		flex-direction: column;
		margin-bottom: 2rem;
	}

	.sound-tiles {
		display: flex;
		gap: 2rem;
	}
</style>
