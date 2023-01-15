<script>
	import Header from '../components/Header.svelte'
	import Footer from '../components/Footer.svelte'
	import './styles.scss'
</script>

<Header />

<main>
	<slot />
</main>

<Footer />

<style>
</style>
