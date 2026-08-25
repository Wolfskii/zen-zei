<script lang="ts">
	import { mix } from '$lib/audio/mix.svelte'
	import { mixNameFromLayers } from '$lib/shelf'
	import type { Sound } from '$lib/types'

	let { sounds, keepAwake = true }: { sounds: Sound[]; keepAwake?: boolean } = $props()

	const playing = $derived(
		Object.entries(mix.channels)
			.filter(([, channel]) => channel.playing)
			.map(([id]) => sounds.find((sound) => sound.id === id))
			.filter((sound): sound is Sound => !!sound)
	)

	const title = $derived(playing.length ? `${mixNameFromLayers(playing.map((sound) => sound.name))} · Zen-Zei` : 'Zen-Zei')

	$effect(() => {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
		const layers = playing
		const catalog = sounds
		if (layers.length) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: mixNameFromLayers(layers.map((sound) => sound.name)),
				artist: 'Zen-Zei',
				album: 'layered quiet',
				artwork: layers
					.filter((sound) => sound.coverUrl)
					.slice(0, 3)
					.map((sound) => ({ src: sound.coverUrl as string, sizes: '512x512', type: 'image/jpeg' }))
			})
			navigator.mediaSession.playbackState = 'playing'
		} else {
			if (!mix.held) navigator.mediaSession.metadata = null
			navigator.mediaSession.playbackState = mix.held ? 'paused' : 'none'
		}
		navigator.mediaSession.setActionHandler('play', () => {
			if (mix.held) void mix.resumeHeld(catalog)
		})
		navigator.mediaSession.setActionHandler('pause', () => {
			if (mix.playingIds.length) mix.pausePlaying()
		})
		navigator.mediaSession.setActionHandler('stop', () => mix.stopAll())
		return () => {
			navigator.mediaSession.setActionHandler('play', null)
			navigator.mediaSession.setActionHandler('pause', null)
			navigator.mediaSession.setActionHandler('stop', null)
		}
	})

	$effect(() => {
		if (typeof navigator === 'undefined' || !keepAwake || !playing.length || !navigator.wakeLock) return
		const wakeLock = navigator.wakeLock
		let sentinel: WakeLockSentinel | null = null
		let cancelled = false
		async function lock() {
			if (cancelled || document.visibilityState !== 'visible') return
			try {
				sentinel = await wakeLock.request('screen')
			} catch {
				sentinel = null
			}
		}
		void lock()
		function onVisibility() {
			if (document.visibilityState === 'visible') void lock()
		}
		document.addEventListener('visibilitychange', onVisibility)
		return () => {
			cancelled = true
			document.removeEventListener('visibilitychange', onVisibility)
			void sentinel?.release()
		}
	})
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
