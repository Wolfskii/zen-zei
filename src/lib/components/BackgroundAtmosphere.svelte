<script lang="ts">
	import { onMount } from 'svelte'
	import { mix } from '$lib/audio/mix.svelte'
	import { daypart } from '$lib/daypart'
	import { loadPrefs, PREFS_EVENT, PREFS_STORAGE_KEY, type Prefs } from '$lib/prefs'

	const src = `${import.meta.env.BASE_URL}videos/rain.mp4`
	const part = daypart()
	let prefs = $state<Prefs>(typeof localStorage === 'undefined' ? { keepAwake: true, still: false, sort: 'loved', lastScene: null } : loadPrefs())
	const lively = $derived(Object.values(mix.channels).some((channel) => channel.playing))
	const tints = $derived(
		[...new Set(Object.values(mix.channels).filter((channel) => channel.playing && channel.category).map((channel) => channel.category))]
	)

	onMount(() => {
		prefs = loadPrefs()
		function onPrefs(event: Event) {
			const next = (event as CustomEvent<Prefs>).detail
			prefs = next ?? loadPrefs()
		}
		function onStorage(event: StorageEvent) {
			if (event.key !== PREFS_STORAGE_KEY) return
			prefs = loadPrefs()
		}
		window.addEventListener(PREFS_EVENT, onPrefs)
		window.addEventListener('storage', onStorage)
		return () => {
			window.removeEventListener(PREFS_EVENT, onPrefs)
			window.removeEventListener('storage', onStorage)
		}
	})
</script>

<div class="atmosphere" class:lively class:still={prefs.still} data-tone={part.tone} aria-hidden="true">
	{#if !prefs.still}
		<video autoplay muted loop playsinline poster="">
			<source {src} type="video/mp4" />
		</video>
	{/if}
	<div class="fog"></div>
	{#each tints as tint}
		<div class="tint" data-cat={tint}></div>
	{/each}
	<div class="grain"></div>
</div>

<style>
	.atmosphere {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		--glow: 157, 204, 176;
		--warm: 228, 197, 138;
	}

	.atmosphere[data-tone='morning'] {
		--glow: 228, 197, 138;
		--warm: 245, 214, 160;
	}

	.atmosphere[data-tone='afternoon'] {
		--glow: 157, 204, 176;
		--warm: 180, 214, 196;
	}

	.atmosphere[data-tone='evening'] {
		--glow: 196, 150, 110;
		--warm: 228, 197, 138;
	}

	.atmosphere[data-tone='night'] {
		--glow: 110, 140, 176;
		--warm: 158, 201, 224;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(0.7) brightness(0.55);
		transition: filter 1.2s ease;
	}

	.atmosphere[data-tone='morning'] video {
		filter: saturate(0.78) brightness(0.62) hue-rotate(-8deg);
	}

	.atmosphere[data-tone='evening'] video {
		filter: saturate(0.82) brightness(0.5) hue-rotate(12deg);
	}

	.atmosphere[data-tone='night'] video {
		filter: saturate(0.55) brightness(0.42) hue-rotate(18deg);
	}

	.atmosphere.lively video {
		filter: saturate(0.9) brightness(0.7);
	}

	.atmosphere[data-tone='morning'].lively video {
		filter: saturate(0.88) brightness(0.72) hue-rotate(-8deg);
	}

	.atmosphere[data-tone='evening'].lively video {
		filter: saturate(0.92) brightness(0.62) hue-rotate(12deg);
	}

	.atmosphere[data-tone='night'].lively video {
		filter: saturate(0.68) brightness(0.52) hue-rotate(18deg);
	}

	.atmosphere.still {
		background: radial-gradient(circle at 20% 0%, rgba(var(--warm), 0.22), transparent 42%),
			radial-gradient(circle at 90% 80%, rgba(var(--glow), 0.16), #071016 58%);
	}

	.fog {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 18% 8%, rgba(var(--warm), 0.2), transparent 42%),
			radial-gradient(circle at 82% 88%, rgba(var(--glow), 0.14), transparent 46%),
			linear-gradient(180deg, rgba(7, 16, 22, 0.32), rgba(7, 16, 22, 0.74));
		transition: background 1.2s ease;
	}

	.tint {
		position: absolute;
		width: 55%;
		height: 55%;
		border-radius: 50%;
		filter: blur(64px);
		opacity: 0.28;
		transition: opacity 0.8s ease;
	}

	.tint[data-cat='nature'] {
		top: -10%;
		left: -8%;
		background: rgb(var(--cat-nature));
	}

	.tint[data-cat='asmr'] {
		top: 10%;
		right: -12%;
		background: rgb(var(--cat-asmr));
	}

	.tint[data-cat='background'] {
		bottom: -8%;
		left: 18%;
		background: rgb(var(--cat-background));
	}

	.tint[data-cat='ambient'] {
		bottom: 6%;
		right: 4%;
		background: rgb(var(--cat-ambient));
	}

	.grain {
		position: absolute;
		inset: 0;
		opacity: 0.18;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
	}
</style>
