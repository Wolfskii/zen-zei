<script lang="ts">
	import '$lib/styles/global.css'
	import BackgroundAtmosphere from '$lib/components/BackgroundAtmosphere.svelte'

	import type { LayoutProps } from './$types'

	let { children }: LayoutProps = $props()
</script>

<svelte:head>
	<title>Zen-Zei</title>
</svelte:head>

<BackgroundAtmosphere />
<div class="shell">
	{@render children()}
</div>

<style>
	.shell {
		position: relative;
		z-index: 1;
		width: min(1120px, calc(100% - 2rem));
		margin: 0 auto;
		padding: 0.75rem 0 7.5rem;
	}
</style>
