<script lang="ts">
	import { Bookmark, Dices, History, ListMusic, Pencil, Plus, RotateCcw, X } from '@lucide/svelte'
	import { mix } from '$lib/audio/mix.svelte'
	import { formatRelative } from '$lib/format-time'
	import { surpriseLayers } from '$lib/library'
	import { mixFingerprint, resolveList, resolveSavedMix, type SavedList, type SavedMix } from '$lib/shelf'
	import { resolveScene, SCENES, sceneIsActive, sceneIsReady } from '$lib/scenes'
	import type { Sound } from '$lib/types'
	import Button from './ui/Button.svelte'

	let {
		sounds,
		mixes = [],
		lists = [],
		recents = [],
		suggest = null,
		ondeleteMix,
		ondeleteList,
		ondeleteRecent,
		onkeepRecent,
		oncreateList,
		onrenameList,
		onrenameMix,
		browseListId = null,
		onbrowseList,
		lastSceneId = null,
		onlastScene,
		compact = false
	}: {
		sounds: Sound[]
		mixes?: SavedMix[]
		lists?: SavedList[]
		recents?: SavedMix[]
		suggest?: string | null
		ondeleteMix?: (id: string) => void
		ondeleteList?: (id: string) => void
		ondeleteRecent?: (id: string) => void
		onkeepRecent?: (id: string) => void
		oncreateList?: (name: string) => void
		onrenameList?: (id: string, name: string) => void
		onrenameMix?: (id: string, name: string) => void
		browseListId?: string | null
		onbrowseList?: (id: string) => void
		lastSceneId?: string | null
		onlastScene?: (id: string) => void
		compact?: boolean
	} = $props()

	const ready = $derived(SCENES.filter((scene) => sceneIsReady(scene, sounds)))
	const playingIds = $derived(
		Object.entries(mix.channels)
			.filter(([, channel]) => channel.playing)
			.map(([id]) => id)
	)
	const usableMixes = $derived(mixes.filter((item) => resolveSavedMix(item, sounds).length > 0))
	const usableRecents = $derived(recents.filter((item) => resolveSavedMix(item, sounds).length > 0))
	const lastScene = $derived(lastSceneId ? SCENES.find((scene) => scene.id === lastSceneId) : null)
	const lastReady = $derived(!!lastScene && sceneIsReady(lastScene, sounds))
	let creating = $state(false)
	let newName = $state('')
	let editing = $state<{ kind: 'list' | 'mix'; id: string } | null>(null)
	let editName = $state('')
	let now = $state(Date.now())

	$effect(() => {
		if (!usableRecents.length) return
		now = Date.now()
		const id = setInterval(() => (now = Date.now()), 30_000)
		return () => clearInterval(id)
	})

	function recentKept(item: SavedMix): boolean {
		const fp = mixFingerprint(item)
		return mixes.some((saved) => mixFingerprint(saved) === fp)
	}

	async function start(sceneId: string) {
		const scene = SCENES.find((item) => item.id === sceneId)
		if (!scene) return
		const layers = resolveScene(scene, sounds)
		if (layers.length < 2) return
		onlastScene?.(sceneId)
		await mix.applyMix(layers)
	}

	async function surprise() {
		const layers = surpriseLayers(sounds)
		if (!layers.length) return
		await mix.applyMix(layers)
	}

	async function startMix(item: SavedMix) {
		const layers = resolveSavedMix(item, sounds)
		if (!layers.length) return
		await mix.applyMix(layers, item.master)
	}

	async function startList(item: SavedList) {
		const found = resolveList(item, sounds)
		if (!found.length) return
		await mix.applyMix(found.map((sound) => ({ sound, volume: mix.volumeOf(sound.id) })))
	}

	function mixActive(item: SavedMix): boolean {
		const layers = resolveSavedMix(item, sounds)
		if (!layers.length) return false
		return layers.every((layer) => playingIds.includes(layer.sound.id)) && playingIds.length === layers.length
	}

	function listActive(item: SavedList): boolean {
		const found = resolveList(item, sounds)
		if (!found.length) return false
		return found.every((sound) => playingIds.includes(sound.id)) && playingIds.length === found.length
	}

	function commitList(event: Event) {
		event.preventDefault()
		oncreateList?.(newName)
		newName = ''
		creating = false
	}

	function startRename(kind: 'list' | 'mix', id: string, name: string) {
		editing = { kind, id }
		editName = name
		creating = false
	}

	function commitRename(event: Event) {
		event.preventDefault()
		if (!editing) return
		if (editing.kind === 'list') onrenameList?.(editing.id, editName)
		else onrenameMix?.(editing.id, editName)
		editing = null
		editName = ''
	}
</script>

{#if sounds.length}
	<div class="scenes">
		<p>Scenes</p>
		<div class="chips">
			<button type="button" class="chip surprise" title="Random 2–3 layers · R" onclick={() => surprise()}>
				<Dices size={14} />
				Surprise
				<small>shuffle a mix</small>
			</button>
			{#if lastScene && lastReady}
				<button type="button" class="chip surprise" title={`${lastScene.label} · Shift+R`} aria-label="Play last scene" onclick={() => start(lastScene.id)}>
					<RotateCcw size={14} />
					Again
					<small>{lastScene.label}</small>
				</button>
			{/if}
			{#each ready as scene}
				{@const key = SCENES.findIndex((item) => item.id === scene.id) + 1}
				<button
					type="button"
					class="chip"
					class:on={sceneIsActive(scene, sounds, playingIds)}
					class:hint={suggest === scene.id && !sceneIsActive(scene, sounds, playingIds)}
					title={`${scene.hint} · ${key}`}
					onclick={() => start(scene.id)}
				>
					<span class="num">{key}</span>
					{scene.label}
					<small>{scene.hint}</small>
				</button>
			{/each}
		</div>
	</div>
{/if}

{#if sounds.length && !compact}
	<div class="scenes">
		<p>Yours</p>
		<div class="chips">
			{#if creating}
				<form class="create glass" onsubmit={commitList}>
					<label>
						<span class="visually-hidden">List name</span>
						<input bind:value={newName} maxlength="40" placeholder="Name this list" />
					</label>
					<Button variant="primary" type="submit">Create</Button>
					<button type="button" class="saved-del" aria-label="Cancel" onclick={() => (creating = false)}>
						<X size={12} />
					</button>
				</form>
			{:else}
				<button type="button" class="chip add" aria-label="New list" onclick={() => (creating = true)}>
					<Plus size={14} />
					List
					<small>this device</small>
				</button>
			{/if}
			{#each lists as item}
				{#if editing?.kind === 'list' && editing.id === item.id}
					<form class="create glass" onsubmit={commitRename}>
						<label>
							<span class="visually-hidden">List name</span>
							<input bind:value={editName} maxlength="40" />
						</label>
						<Button variant="primary" type="submit">Rename</Button>
						<button type="button" class="saved-del" aria-label="Cancel" onclick={() => (editing = null)}>
							<X size={12} />
						</button>
					</form>
				{:else}
					<div class="saved" class:on={listActive(item)} class:browse={browseListId === item.id}>
						<button type="button" class="saved-play" onclick={() => startList(item)} title="Play this list">
							<ListMusic size={13} />
							{item.name}
						</button>
						<button
							type="button"
							class="saved-count"
							class:on={browseListId === item.id}
							aria-pressed={browseListId === item.id}
							aria-label={browseListId === item.id ? `Stop browsing ${item.name}` : `Browse ${item.name}`}
							onclick={() => onbrowseList?.(item.id)}
						>
							{resolveList(item, sounds).length}
						</button>
						<button type="button" class="saved-del" aria-label="Rename {item.name}" onclick={() => startRename('list', item.id, item.name)}>
							<Pencil size={12} />
						</button>
						<button type="button" class="saved-del" aria-label="Remove {item.name}" onclick={() => ondeleteList?.(item.id)}>
							<X size={12} />
						</button>
					</div>
				{/if}
			{/each}
			{#each usableMixes as item}
				{#if editing?.kind === 'mix' && editing.id === item.id}
					<form class="create glass" onsubmit={commitRename}>
						<label>
							<span class="visually-hidden">Mix name</span>
							<input bind:value={editName} maxlength="40" />
						</label>
						<Button variant="primary" type="submit">Rename</Button>
						<button type="button" class="saved-del" aria-label="Cancel" onclick={() => (editing = null)}>
							<X size={12} />
						</button>
					</form>
				{:else}
					<div class="saved" class:on={mixActive(item)}>
						<button type="button" class="saved-play" onclick={() => startMix(item)} title="Play this mix">
							<Bookmark size={13} />
							{item.name}
						</button>
						<button type="button" class="saved-del" aria-label="Rename {item.name}" onclick={() => startRename('mix', item.id, item.name)}>
							<Pencil size={12} />
						</button>
						<button type="button" class="saved-del" aria-label="Remove {item.name}" onclick={() => ondeleteMix?.(item.id)}>
							<X size={12} />
						</button>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{/if}

{#if sounds.length && !compact && usableRecents.length}
	<div class="scenes">
		<p>Recent</p>
		<div class="chips">
			{#each usableRecents as item (item.id)}
				<div class="saved" class:on={mixActive(item)}>
					<button type="button" class="saved-play" onclick={() => startMix(item)} title="Play this mix">
						<History size={13} />
						{item.name}
						<span class="when">{formatRelative(item.savedAt, now)}</span>
					</button>
					{#if !recentKept(item)}
						<button type="button" class="saved-del" aria-label="Keep {item.name} in Yours" onclick={() => onkeepRecent?.(item.id)}>
							<Bookmark size={12} />
						</button>
					{/if}
					<button type="button" class="saved-del" aria-label="Forget {item.name}" onclick={() => ondeleteRecent?.(item.id)}>
						<X size={12} />
					</button>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.scenes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem 0.85rem;
		margin-top: 0.85rem;
	}

	p {
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-size: 0.68rem;
		color: var(--gold);
		margin: 0;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.chip {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.05rem;
		padding: 0.4rem 0.85rem 0.45rem;
		border-radius: 1rem;
		border: 1px solid var(--glass-border);
		background: var(--glass);
		backdrop-filter: blur(12px);
		color: var(--text);
		text-align: left;
		line-height: 1.15;
	}

	.num {
		position: absolute;
		top: 0.28rem;
		right: 0.4rem;
		font-size: 0.62rem;
		letter-spacing: 0;
		color: var(--gold);
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
	}

	.chip.on .num {
		color: rgba(16, 32, 24, 0.55);
	}

	.chip.surprise,
	.chip.add {
		flex-direction: row;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.85rem;
	}

	.chip.surprise small,
	.chip.add small {
		display: none;
	}

	@media (min-width: 720px) {
		.chip.surprise,
		.chip.add {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.05rem;
			padding: 0.4rem 0.85rem 0.45rem;
		}

		.chip.surprise small,
		.chip.add small {
			display: inline;
		}
	}

	.chip small {
		color: var(--muted);
		font-size: 0.7rem;
		letter-spacing: 0;
		text-transform: none;
	}

	.chip.on {
		color: #102018;
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
		border-color: transparent;
	}

	.chip.on small {
		color: rgba(16, 32, 24, 0.7);
	}

	.chip.hint {
		border-color: rgba(228, 197, 138, 0.55);
		box-shadow: 0 0 0 1px rgba(228, 197, 138, 0.18);
	}

	.create {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.35rem 0.3rem 0.45rem;
		border-radius: 999px;
	}

	.create input {
		width: 8.5rem;
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.28);
		border-radius: 0.7rem;
		padding: 0.38rem 0.55rem;
		outline: none;
	}

	.create :global(.btn) {
		padding: 0.38rem 0.7rem;
		font-size: 0.8rem;
	}

	.saved {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: var(--glass);
		overflow: hidden;
	}

	.saved.on {
		border-color: transparent;
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
	}

	.saved.browse:not(.on) {
		border-color: rgba(228, 197, 138, 0.55);
		box-shadow: 0 0 0 1px rgba(228, 197, 138, 0.18);
	}

	.saved-play {
		border: 0;
		background: transparent;
		color: inherit;
		padding: 0.42rem 0.55rem 0.42rem 0.75rem;
		font-size: 0.88rem;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.saved-count {
		border: 0;
		background: transparent;
		color: var(--muted);
		padding: 0.42rem 0.15rem;
		min-width: 1.35rem;
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
	}

	.saved-count.on {
		color: var(--gold);
		font-weight: 600;
	}

	.saved.on .saved-play,
	.saved.on .saved-del,
	.saved.on .saved-count {
		color: #102018;
	}

	.saved-del {
		border: 0;
		background: transparent;
		color: var(--muted);
		padding: 0.42rem 0.55rem 0.42rem 0.2rem;
		display: grid;
		place-items: center;
	}

	.saved-del + .saved-del {
		padding-left: 0.15rem;
		padding-right: 0.55rem;
	}

	.when {
		font-size: 0.68rem;
		color: var(--muted);
		letter-spacing: 0;
		text-transform: none;
		font-weight: 400;
	}

	.saved.on .when {
		color: rgba(16, 32, 24, 0.62);
	}
</style>
