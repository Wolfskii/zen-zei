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
