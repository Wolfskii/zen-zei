<script lang="ts">
	import Rain from '../components/soundtiles/Rain.svelte'
</script>

<div class="intro">
	<h1>Zen-Zei</h1>
	<p class="sub-heading">Relax to sounds of the nature</p>
</div>

<div class="sound-tiles">
	<Rain />
	<Rain />
	<Rain />
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
