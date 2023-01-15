<script>
	import Counter from '../components/Counter.svelte'
</script>

<svelte:head>
	<title>Zen-Zei</title>
	<meta name="description" content="Zen-Zei application" />
</svelte:head>

<section>
	<h1>Zen-Zei</h1>
	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
