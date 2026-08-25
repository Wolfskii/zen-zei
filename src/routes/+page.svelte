<script lang="ts">
	import { api } from '$lib/api'
	import { mix } from '$lib/audio/mix.svelte'
	import AddSoundModal from '$lib/components/AddSoundModal.svelte'
	import CategoryFilter from '$lib/components/CategoryFilter.svelte'
	import EmptyState from '$lib/components/EmptyState.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import Header from '$lib/components/Header.svelte'
	import ListenStage from '$lib/components/ListenStage.svelte'
	import MixBar from '$lib/components/MixBar.svelte'
	import PlaybackSession from '$lib/components/PlaybackSession.svelte'
	import SceneStrip from '$lib/components/SceneStrip.svelte'
	import ShortcutsHint from '$lib/components/ShortcutsHint.svelte'
	import SoundGrid from '$lib/components/SoundGrid.svelte'
	import SearchField from '$lib/components/ui/SearchField.svelte'
	import { onMount, tick } from 'svelte'
	import { daypart } from '$lib/daypart'
	import { formatClock } from '$lib/format-time'
	import { pinPlaying, sortSounds, surpriseLayers, companionLayer, type LibrarySort } from '$lib/library'
	import { MIX_CAPTURE_EVENT, type MixCapture } from '$lib/mix-capture'
	import { parseMixSearch, stripMixSearch, mixLine, mixPageUrl, type SharedMix } from '$lib/mix-share'
	import { layersForSceneIndex, resolveScene, SCENES } from '$lib/scenes'
	import { loadPrefs, setKeepAwake, setStill, setSort, setLastScene, defaultPrefs } from '$lib/prefs'
	import {
		createList,
		emptyShelf,
		listNameFromSounds,
		loadShelf,
		mixNameFromLayers,
		persistShelf,
		pruneShelf,
		addRecent,
		removeList,
		removeMix,
		removeRecent,
		keepRecent,
		renameList,
		renameMix,
		SHELF_STORAGE_KEY,
		toggleFavorite,
		toggleSoundInList,
		type Shelf
	} from '$lib/shelf'
	import type { Sound, SoundKind } from '$lib/types'

	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	let localSounds = $state<Sound[] | null>(null)
	const sounds = $derived(localSounds ?? data.sounds)
	let category = $state<string | null>(null)
	let query = $state('')
	let addOpen = $state(false)
	let keysOpen = $state(false)
	let pendingShared = $state<SharedMix | null>(null)
	let sort = $state<LibrarySort>(typeof localStorage === 'undefined' ? 'loved' : loadPrefs().sort)
	let shelf = $state<Shelf>(typeof localStorage === 'undefined' ? emptyShelf() : loadShelf())
	let prefs = $state(typeof localStorage === 'undefined' ? defaultPrefs() : loadPrefs())
	let favouritesOnly = $state(false)
	let nowOnly = $state(false)
	let kind = $state<SoundKind | null>(null)
	let listen = $state(false)
	let browseListId = $state<string | null>(null)
	let clock = $state('')
	const part = daypart()

	const playingIds = $derived(
		Object.entries(mix.channels)
			.filter(([, channel]) => channel.playing)
			.map(([id]) => id)
	)

	const browsing = $derived(shelf.lists.find((item) => item.id === browseListId) ?? null)

	const playingNames = $derived(
		playingIds
			.map((id) => sounds.find((sound) => sound.id === id)?.name)
			.filter((name): name is string => !!name)
			.join(' · ')
	)

	const visible = $derived(
		pinPlaying(
			sortSounds(
				sounds.filter((sound) => {
					if (nowOnly) {
						if (!playingIds.includes(sound.id)) return false
					} else if (!playingIds.includes(sound.id)) {
						if (browsing && !browsing.soundIds.includes(sound.id)) return false
						if (favouritesOnly && !shelf.favorites.includes(sound.id)) return false
						if (category && sound.category.slug !== category) return false
						if (kind && sound.kind !== kind) return false
					}
					const needle = query.trim().toLowerCase()
					if (!needle) return true
					return `${sound.name} ${sound.description} ${sound.category.name}`.toLowerCase().includes(needle)
				}),
				sort
			),
			playingIds
		)
	)

	const emptyTitle = $derived(
		query.trim()
			? 'Nothing matches that search'
			: nowOnly
				? 'Nothing playing yet'
				: browsing
					? 'Nothing in this list yet'
					: favouritesOnly
						? 'Nothing in your favourites yet'
						: kind
							? 'Nothing from that source yet'
							: 'Nothing in this category yet'
	)
	const emptyBody = $derived(
		query.trim()
			? 'Try another word, or clear the search.'
			: nowOnly
				? 'Start a square, a scene, or a surprise mix.'
				: browsing
					? 'Add squares from the library with the list button on a tile.'
					: favouritesOnly
						? 'Heart a square. Favourites and lists stay on this browser, not in the shared library.'
						: kind
							? 'Try Any, or add a YouTube loop, a file, or a link.'
							: 'Add a YouTube loop or a custom file and it will show up for everyone.'
	)

	onMount(() => {
		function catalogIds() {
			return new Set((localSounds ?? data.sounds).map((sound) => sound.id))
		}
		shelf = pruneShelf(catalogIds(), loadShelf())
		function onStorage(event: StorageEvent) {
			if (event.key !== SHELF_STORAGE_KEY) return
			shelf = pruneShelf(catalogIds(), loadShelf())
		}
		window.addEventListener('storage', onStorage)
		function onCapture(event: Event) {
			const capture = (event as CustomEvent<MixCapture>).detail
			if (!capture?.layers?.length) return
			shelf = addRecent(
				{
					name: mixNameFromLayers(capture.layers.map((layer) => layer.name)),
					master: capture.master,
					layers: capture.layers.map((layer) => ({ id: layer.id, volume: layer.volume }))
				},
				shelf
			)
		}
		window.addEventListener(MIX_CAPTURE_EVENT, onCapture)
		const tickClock = () => (clock = formatClock(new Date()))
		tickClock()
		const clockId = setInterval(tickClock, 15_000)
		const parsed = parseMixSearch(window.location.search)
		if (parsed) {
			const found = parsed.layers.filter((layer) => (localSounds ?? data.sounds).some((sound) => sound.id === layer.id))
			if (!found.length) history.replaceState(null, '', stripMixSearch(window.location.href))
			else {
				pendingShared = { master: parsed.master, layers: found }
				mix.dismissResume()
			}
		}
		return () => {
			window.removeEventListener('storage', onStorage)
			window.removeEventListener(MIX_CAPTURE_EVENT, onCapture)
			clearInterval(clockId)
		}
	})

	$effect(() => {
		if (typeof window === 'undefined') return
		const catalog = sounds
		function typing(event: KeyboardEvent) {
			const target = event.target as HTMLElement | null
			return !!target?.closest('input, textarea, select, [contenteditable="true"], [role="radio"], [role="slider"]')
		}
		function dialogOpen() {
			return !!document.querySelector('[role="dialog"]')
		}
		function onKey(event: KeyboardEvent) {
			if (typing(event)) return
			if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
				event.preventDefault()
				keysOpen = !keysOpen
				return
			}
			if (event.key === '/' && !event.shiftKey) {
				if (event.defaultPrevented) return
				event.preventDefault()
				listen = false
				void tick().then(() => document.getElementById('sound-search')?.focus())
				return
			}
			if (dialogOpen()) return
			if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key >= '1' && event.key <= '4') {
				event.preventDefault()
				const index = Number(event.key) - 1
				const scene = SCENES[index]
				const layers = layersForSceneIndex(index, catalog)
				if (scene && layers) {
					rememberScene(scene.id)
					void mix.applyMix(layers)
				}
				return
			}
			if (event.key === '{' || event.key === '}') {
				event.preventDefault()
				mix.nudgeLayer(null, event.key === '}' ? 0.05 : -0.05)
				return
			}
			if (event.key === '[' || event.key === ']') {
				event.preventDefault()
				if (event.shiftKey) mix.nudgeLayer(null, event.key === ']' ? 0.05 : -0.05)
				else mix.nudgeMaster(event.key === ']' ? 0.05 : -0.05)
				return
			}
			if (event.key === 'e' || event.key === 'E') {
				event.preventDefault()
				mix.evenVolumes()
				return
			}
			if (event.key === 'a' || event.key === 'A') {
				event.preventDefault()
				const layer = companionLayer(catalog, mix.playingIds)
				if (!layer) return
				mix.setVolume(layer.sound.id, layer.volume)
				void mix.play(layer.sound)
				return
			}
			if (event.key === 'n' || event.key === 'N') {
				event.preventDefault()
				listen = false
				if (!mix.playingIds.length && !nowOnly) return
				nowOnly = !nowOnly
				if (nowOnly) {
					favouritesOnly = false
					category = null
					browseListId = null
				}
				return
			}
			if ((event.key === 'c' || event.key === 'C') && !event.ctrlKey && !event.metaKey) {
				event.preventDefault()
				void copyPlaying(event.shiftKey)
				return
			}
			if (event.key === 'l' || event.key === 'L') {
				event.preventDefault()
				listen = !listen
				return
			}
			if (event.key === 'r' || event.key === 'R') {
				event.preventDefault()
				if (event.shiftKey) {
					replayLastScene(catalog)
					return
				}
				const layers = surpriseLayers(catalog)
				if (layers.length) void mix.applyMix(layers)
				return
			}
			if (event.key === 'm' || event.key === 'M') {
				event.preventDefault()
				mix.toggleMute()
				return
			}
			if (event.key === 'Escape') {
				event.preventDefault()
				mix.stopAll()
				return
			}
			if (event.key === ' ' || event.code === 'Space') {
				event.preventDefault()
				void mix.toggleHeld(catalog)
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	})

	$effect(() => {
		if (!playingIds.length && nowOnly) nowOnly = false
	})

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

	async function startShared() {
		if (!pendingShared) return
		const shared = pendingShared
		pendingShared = null
		const layers = shared.layers
			.map((layer) => {
				const sound = sounds.find((item) => item.id === layer.id)
				return sound ? { sound, volume: layer.volume } : null
			})
			.filter((layer): layer is { sound: Sound; volume: number } => !!layer)
		await mix.applyMix(layers, shared.master)
	}

	function dismissShared() {
		pendingShared = null
		if (typeof window !== 'undefined') history.replaceState(null, '', stripMixSearch(window.location.href))
	}

	function deleteMix(id: string) {
		shelf = removeMix(id, shelf)
	}

	function deleteList(id: string) {
		if (browseListId === id) browseListId = null
		shelf = removeList(id, shelf)
	}

	function clearBrowse() {
		browseListId = null
	}

	function browseList(id: string) {
		listen = false
		if (browseListId === id) {
			browseListId = null
			return
		}
		browseListId = id
		category = null
		favouritesOnly = false
		nowOnly = false
	}

	function restoreShelfFromBackup(next: Shelf) {
		const pruned = pruneShelf(new Set(currentSounds().map((sound) => sound.id)), next)
		persistShelf(pruned)
		if (browseListId && !pruned.lists.some((item) => item.id === browseListId)) browseListId = null
		shelf = pruned
	}

	function favoriteSound(sound: Sound) {
		shelf = toggleFavorite(sound.id, shelf)
	}

	function toggleInList(sound: Sound, listId: string) {
		shelf = toggleSoundInList(listId, sound.id, shelf)
	}

	function createListFromSound(sound: Sound, name: string) {
		shelf = createList(name || listNameFromSounds([sound.name]), [sound.id], shelf)
	}

	function createEmptyList(name: string) {
		shelf = createList(name, [], shelf)
	}

	function renameSavedList(id: string, name: string) {
		shelf = renameList(id, name, shelf)
	}

	function renameSavedMix(id: string, name: string) {
		shelf = renameMix(id, name, shelf)
	}

	function deleteRecent(id: string) {
		shelf = removeRecent(id, shelf)
	}

	function keepSavedRecent(id: string) {
		shelf = keepRecent(id, shelf)
	}

	function pickSort(next: LibrarySort) {
		sort = next
		prefs = setSort(next, prefs)
	}

	function toggleKeepAwake(value: boolean) {
		prefs = setKeepAwake(value, prefs)
	}

	function toggleStill(value: boolean) {
		prefs = setStill(value, prefs)
	}

	function rememberScene(id: string) {
		if (id === 'storm' || id === 'sleep' || id === 'cabin' || id === 'focus') {
			prefs = setLastScene(id, prefs)
		}
	}

	function replayLastScene(catalog = sounds) {
		const scene = SCENES.find((item) => item.id === prefs.lastScene)
		if (!scene) return
		const layers = resolveScene(scene, catalog)
		if (layers.length < 2) return
		void mix.applyMix(layers)
	}

	async function copyPlaying(asText: boolean) {
		const layers = playingIds
			.map((id) => {
				const sound = sounds.find((item) => item.id === id)
				return sound ? { id: sound.id, name: sound.name, volume: mix.volumeOf(id) } : null
			})
			.filter((layer): layer is { id: string; name: string; volume: number } => !!layer)
		if (!layers.length) return
		if (asText) {
			const line = mixLine(layers, mix.masterVolume)
			if (!line) return
			try {
				await navigator.clipboard.writeText(line)
			} catch {
				return
			}
			return
		}
		const url = mixPageUrl(`${window.location.origin}${window.location.pathname}`, {
			master: mix.masterVolume,
			layers: layers.map((layer) => ({ id: layer.id, volume: layer.volume }))
		})
		if (!url) return
		history.replaceState(null, '', `${window.location.pathname}${new URL(url).search}`)
		try {
			await navigator.clipboard.writeText(url)
		} catch {
			return
		}
	}
</script>

<Header onadd={() => (addOpen = true)} quiet={listen} now={playingNames} />
<PlaybackSession {sounds} keepAwake={prefs.keepAwake} />

<section class="hero" class:quiet={listen} class:mixing={playingIds.length > 0 && !listen}>
	<p class="eyebrow">{part.hello}{clock ? ` · ${clock}` : ''} · Nature · ASMR · background</p>
	{#if !listen}
		<h1>Build a quiet that is yours.</h1>
		<p class="lede">Play several looping squares at once. Heart favourites, keep lists and mixes on this device, and rate what stays in the shared library.</p>
		<p class="whisper">{part.line}</p>
	{/if}
</section>

{#if !listen}
	<div class="toolbar">
		<CategoryFilter
			categories={data.categories}
			bind:value={category}
			bind:favouritesOnly
			bind:nowOnly
			favouriteCount={shelf.favorites.length}
			playingCount={playingIds.length}
			listActive={!!browseListId}
			onpick={clearBrowse}
		/>
		<div class="tools">
			<div class="sort" role="group" aria-label="Sort library">
				<button type="button" class:on={sort === 'loved'} onclick={() => pickSort('loved')}>Loved</button>
				<button type="button" class:on={sort === 'name'} onclick={() => pickSort('name')}>A–Z</button>
				<button type="button" class:on={sort === 'new'} onclick={() => pickSort('new')}>New</button>
			</div>
			<div class="sort" role="group" aria-label="Source">
				<button type="button" class:on={!kind} aria-label="Any source" onclick={() => (kind = null)}>Any</button>
				<button type="button" class:on={kind === 'youtube'} aria-label="YouTube only" onclick={() => (kind = 'youtube')}>YT</button>
				<button type="button" class:on={kind === 'file'} aria-label="Files only" onclick={() => (kind = 'file')}>File</button>
				<button type="button" class:on={kind === 'url'} aria-label="Links only" onclick={() => (kind = 'url')}>Link</button>
			</div>
			<SearchField bind:value={query} placeholder="Search the library" />
		</div>
	</div>
{/if}

<SceneStrip
	{sounds}
	mixes={shelf.mixes}
	lists={shelf.lists}
	recents={shelf.recents}
	suggest={part.suggest}
	{browseListId}
	compact={listen}
	ondeleteMix={deleteMix}
	ondeleteList={deleteList}
	ondeleteRecent={deleteRecent}
	onkeepRecent={keepSavedRecent}
	oncreateList={createEmptyList}
	onrenameList={renameSavedList}
	onrenameMix={renameSavedMix}
	onbrowseList={browseList}
	lastSceneId={prefs.lastScene}
	onlastScene={rememberScene}
/>

<div class="stage">
	{#if listen}
		<ListenStage {sounds} />
	{:else if visible.length === 0}
		<EmptyState title={emptyTitle} body={emptyBody} />
	{:else}
		<SoundGrid
			sounds={visible}
			favorites={shelf.favorites}
			lists={shelf.lists}
			mixing={playingIds.length > 0}
			onvote={vote}
			onfavorite={favoriteSound}
			onToggleList={toggleInList}
			onCreateList={createListFromSound}
		/>
	{/if}
</div>

<MixBar
	{sounds}
	{pendingShared}
	keepAwake={prefs.keepAwake}
	still={prefs.still}
	listening={listen}
	onstartShared={startShared}
	ondismissShared={dismissShared}
	onshelf={(next) => (shelf = next)}
	onKeepAwake={toggleKeepAwake}
	onStill={toggleStill}
	onListen={() => (listen = !listen)}
/>
<Footer {shelf} onrestore={restoreShelfFromBackup} />
<ShortcutsHint bind:open={keysOpen} />

<AddSoundModal bind:open={addOpen} categories={data.categories} oncreated={(sound) => (localSounds = [sound, ...currentSounds()])} />

<style>
	.hero {
		margin: 1.25rem 0 1.4rem;
		max-width: 40rem;
	}

	.hero.quiet {
		margin: 0.4rem 0 0.2rem;
	}

	.hero.mixing {
		margin: 0.55rem 0 0.8rem;
	}

	.hero.mixing h1 {
		font-size: clamp(1.55rem, 4.2vw, 2.35rem);
		margin-bottom: 0.35rem;
	}

	.hero.mixing .lede {
		display: none;
	}

	.hero.mixing .whisper {
		margin-top: 0.35rem;
		font-size: 0.95rem;
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

	.whisper {
		margin-top: 0.7rem;
		color: var(--gold);
		font-family: var(--font-display);
		font-style: italic;
		font-size: 1.02rem;
		opacity: 0.85;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.85rem;
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.55rem;
	}

	.sort {
		display: flex;
		border: 1px solid var(--glass-border);
		border-radius: 999px;
		background: var(--glass);
		overflow: hidden;
	}

	.sort button {
		border: 0;
		background: transparent;
		color: var(--muted);
		padding: 0.45rem 0.7rem;
		font-size: 0.82rem;
	}

	.sort button.on {
		color: #102018;
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
		font-weight: 600;
	}

	.stage {
		margin-top: 1.2rem;
	}
</style>
