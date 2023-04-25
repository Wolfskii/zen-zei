<script lang="ts">
	import Header from '../components/Header.svelte'
	import Footer from '../components/Footer.svelte'
	import './styles.scss'
</script>

<div id="app">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<div id="overlay" />

<video autoplay muted loop id="bg-video">
	<source src="%sveltekit.assets%/videos/rain.mp4" type="video/mp4" />
</video>
