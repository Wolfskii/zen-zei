<script lang="ts">
	import { api, hasAdminKey } from '$lib/api'
	import AddSoundModal from '$lib/components/AddSoundModal.svelte'
	import CategoryFilter from '$lib/components/CategoryFilter.svelte'
	import EmptyState from '$lib/components/EmptyState.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import Header from '$lib/components/Header.svelte'
	import MixBar from '$lib/components/MixBar.svelte'
	import SettingsModal from '$lib/components/SettingsModal.svelte'
	import SoundGrid from '$lib/components/SoundGrid.svelte'
	import type { Sound } from '$lib/types'

	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	let localSounds = $state<Sound[] | null>(null)
	const sounds = $derived(localSounds ?? data.sounds)
	let category = $state<string | null>(null)
	let addOpen = $state(false)
	let settingsOpen = $state(false)
	let admin = $state(false)

	$effect(() => {
		if (typeof window === 'undefined') return
		void settingsOpen
		admin = hasAdminKey() || data.isAdmin
	})

	const visible = $derived(category ? sounds.filter((sound) => sound.category.slug === category) : sounds)

	function currentSounds(): Sound[] {
		return localSounds ?? data.sounds
	}

	function replaceSound(next: Sound) {
		localSounds = currentSounds().map((sound) => (sound.id === next.id ? next : sound))
	}

	async function vote(sound: Sound, stars: number) {
		const { sound: next } = await api.vote(sound.id, stars)
		replaceSound(next)
	}

	async function remove(sound: Sound) {
		if (!confirm(`Delete “${sound.name}”?`)) return
		await api.remove(sound.id)
		localSounds = currentSounds().filter((item) => item.id !== sound.id)
	}
</script>

<Header
	onadd={() => (addOpen = true)}
	onsettings={() => {
		settingsOpen = true
		admin = hasAdminKey() || data.isAdmin
	}}
/>

<section class="hero">
	<p class="eyebrow">Nature · ASMR · background</p>
	<h1>Build a quiet that is yours.</h1>
	<p class="lede">Play several looping squares at once. Paste a YouTube link or drop your own file. Rate what stays in the shared library.</p>
</section>

<CategoryFilter categories={data.categories} bind:value={category} />

<div class="stage">
	{#if visible.length === 0}
		<EmptyState title="Nothing in this category yet" body="Add a YouTube loop or a custom file and it will show up for everyone." />
	{:else}
		<SoundGrid sounds={visible} canDelete={admin} onvote={vote} ondelete={remove} />
	{/if}
</div>

<MixBar {sounds} />
<Footer />

<AddSoundModal bind:open={addOpen} categories={data.categories} oncreated={(sound) => (localSounds = [sound, ...currentSounds()])} />
<SettingsModal bind:open={settingsOpen} />

<style>
	.hero {
		margin: 1.25rem 0 1.4rem;
		max-width: 40rem;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.16em;
		font-size: 0.72rem;
		color: var(--gold);
		margin-bottom: 0.55rem;
	}

	h1 {
		font-size: clamp(2.2rem, 6vw, 3.6rem);
		line-height: 1.02;
		font-style: italic;
		font-weight: 600;
		margin-bottom: 0.7rem;
	}

	.lede {
		color: var(--muted);
		font-size: 1.05rem;
		line-height: 1.5;
	}

	.stage {
		margin-top: 1.2rem;
	}
</style>
