<script>
	import Header from '../components/Header.svelte'
	import Footer from '../components/Footer.svelte'
	import './styles.scss'
	import RainVideo from '../lib/videos/rain.mp4'
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
	<source src={RainVideo} type="video/mp4" />
</video>

<style>
	#app {
		position: relative;
		overflow: hidden;
		z-index: 2;
	}

	#overlay {
		position: fixed;
		right: 0;
		bottom: 0;
		min-width: 100%;
		min-height: 100vh;
		background-color: rgba(0, 0, 0, 0.2);
		z-index: 1;
	}

	#bg-video {
		position: fixed;
		right: 0;
		bottom: 0;
		min-width: 100%;
		min-height: 100vh;
		z-index: 0;
	}
</style>
