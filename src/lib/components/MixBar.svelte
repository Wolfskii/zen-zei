<script lang="ts">
	import { Bookmark, Blend, Film, Headphones, Image, LayoutGrid, Link2, Maximize2, Monitor, Moon, Pause, Plus, Volume2, VolumeX } from '@lucide/svelte'
	import { mix } from '$lib/audio/mix.svelte'
	import { formatElapsed } from '$lib/format-time'
	import { companionLayer, MASTER_MOODS, masterMood } from '$lib/library'
	import { mixPageUrl, mixLine, type SharedMix } from '$lib/mix-share'
	import { addMix, createList, listNameFromSounds, mixNameFromLayers, type Shelf } from '$lib/shelf'
	import type { Sound } from '$lib/types'
	import Icon from './ui/Icon.svelte'
	import Button from './ui/Button.svelte'
	import Slider from './ui/Slider.svelte'

	let {
		sounds,
		pendingShared = null,
		keepAwake = true,
		still = false,
		listening = false,
		onstartShared,
		ondismissShared,
		onshelf,
		onKeepAwake,
		onStill,
		onListen
	}: {
		sounds: Sound[]
		pendingShared?: SharedMix | null
		keepAwake?: boolean
		still?: boolean
		listening?: boolean
		onstartShared?: () => void
		ondismissShared?: () => void
		onshelf?: (shelf: Shelf) => void
		onKeepAwake?: (value: boolean) => void
		onStill?: (value: boolean) => void
		onListen?: () => void
	} = $props()

	const playing = $derived(
		Object.entries(mix.channels)
			.filter(([, channel]) => channel.playing)
			.map(([id]) => sounds.find((sound) => sound.id === id))
			.filter((sound): sound is Sound => !!sound)
	)

	const sharedLayers = $derived(
		(pendingShared?.layers ?? []).map((layer) => sounds.find((sound) => sound.id === layer.id)).filter((sound): sound is Sound => !!sound)
	)

	const SLEEP_MINUTES = [15, 30, 45, 60, 90]
	let sleepOpen = $state(false)
	let now = $state(Date.now())
	let copied = $state(false)
	let copiedText = $state(false)
	let copyTimer: ReturnType<typeof setTimeout> | null = null
	let saveOpen = $state(false)
	let saveName = $state('')
	let saveKind = $state<'mix' | 'list'>('mix')

	$effect(() => {
		if (!mix.sleepUntil && !mix.sessionStartedAt) return
		now = Date.now()
		const id = setInterval(() => (now = Date.now()), 1000)
		return () => clearInterval(id)
	})

	const sleepLeft = $derived(mix.sleepUntil ? Math.max(0, mix.sleepUntil - now) : 0)
	const elapsed = $derived(mix.sessionStartedAt ? Math.max(0, now - mix.sessionStartedAt) : 0)
	const muted = $derived(mix.masterVolume <= 0.001)
	const canCompanion = $derived(playing.length > 0 && sounds.some((sound) => !playing.some((item) => item.id === sound.id)))

	function formatLeft(ms: number): string {
		const total = Math.ceil(ms / 1000)
		const minutes = Math.floor(total / 60)
		const seconds = total % 60
		return `${minutes}:${String(seconds).padStart(2, '0')}`
	}

	function pickSleep(minutes: number | null) {
		mix.setSleepMinutes(minutes)
		sleepOpen = false
	}

	function flashCopied(asText: boolean) {
		copied = !asText
		copiedText = asText
		if (copyTimer) clearTimeout(copyTimer)
		copyTimer = setTimeout(() => {
			copied = false
			copiedText = false
		}, 1800)
	}

	async function writeClipboard(value: string, asText: boolean) {
		try {
			await navigator.clipboard.writeText(value)
		} catch {
			// still flash so the control reads as done
		}
		flashCopied(asText)
	}

	async function copyMix(asText = false) {
		if (asText) {
			const line = mixLine(
				playing.map((sound) => ({ name: sound.name, volume: mix.volumeOf(sound.id) })),
				mix.masterVolume
			)
			if (!line) return
			await writeClipboard(line, true)
			return
		}
		const url = mixPageUrl(`${window.location.origin}${window.location.pathname}`, {
			master: mix.masterVolume,
			layers: playing.map((sound) => ({ id: sound.id, volume: mix.volumeOf(sound.id) }))
		})
		if (!url) return
		history.replaceState(null, '', `${window.location.pathname}${new URL(url).search}`)
		await writeClipboard(url, false)
	}

	function volumeWheel(node: HTMLElement, id: string) {
		function onWheel(event: WheelEvent) {
			event.preventDefault()
			mix.nudgeLayer(id, event.deltaY > 0 ? -0.05 : 0.05)
		}
		node.addEventListener('wheel', onWheel, { passive: false })
		return {
			update(next: string) {
				id = next
			},
			destroy() {
				node.removeEventListener('wheel', onWheel)
			}
		}
	}

	function openSave() {
		if (!saveOpen) {
			saveKind = 'mix'
			saveName = mixNameFromLayers(playing.map((sound) => sound.name))
		}
		saveOpen = !saveOpen
		sleepOpen = false
	}

	function setSaveKind(kind: 'mix' | 'list') {
		saveKind = kind
		const names = playing.map((sound) => sound.name)
		saveName = kind === 'list' ? listNameFromSounds(names) : mixNameFromLayers(names)
	}

	function commitSave(event: Event) {
		event.preventDefault()
		const names = playing.map((sound) => sound.name)
		const shelf =
			saveKind === 'list'
				? createList(saveName || listNameFromSounds(names), playing.map((sound) => sound.id))
				: addMix({
						name: saveName,
						master: mix.masterVolume,
						layers: playing.map((sound) => ({ id: sound.id, volume: mix.volumeOf(sound.id) }))
					})
		saveOpen = false
		onshelf?.(shelf)
	}

	async function addCompanion() {
		const layer = companionLayer(
			sounds,
			playing.map((sound) => sound.id)
		)
		if (!layer) return
		mix.setVolume(layer.sound.id, layer.volume)
		await mix.play(layer.sound)
	}
</script>

<aside class="bar glass">
	<div class="now">
		{#if pendingShared && sharedLayers.length}
			<p>
				Play this mix?
				<span class="names">{sharedLayers.map((sound) => sound.name).join(' · ')}</span>
			</p>
			<Button variant="primary" onclick={() => onstartShared?.()}>Play mix</Button>
			<Button variant="ghost" onclick={() => ondismissShared?.()}>Not now</Button>
		{:else if mix.pendingResume}
			<p>Resume your last mix?</p>
			<Button variant="primary" onclick={() => mix.resumeMix(sounds)}>Resume</Button>
			<Button variant="ghost" onclick={() => mix.dismissResume()}>Not now</Button>
		{:else if mix.held && playing.length === 0}
			<p>Paused. Space continues.</p>
			<Button variant="primary" onclick={() => mix.resumeHeld(sounds)}>Continue</Button>
		{:else if playing.length === 0}
			<p>Quiet. Start any square — they layer together.</p>
		{:else}
			<div class="chips">
				{#each playing as sound}
					<div
						class="chip"
						class:solo={mix.soloId === sound.id}
						class:focus={mix.lastLayerId === sound.id}
						data-cat={sound.category.slug}
						use:volumeWheel={sound.id}
					>
						<button type="button" class="chip-main" onclick={() => mix.pause(sound.id)}>
							{#if sound.coverUrl}
								<img src={sound.coverUrl} alt="" />
							{:else}
								<Icon name={sound.icon ?? sound.category.icon} size={12} />
							{/if}
							<Pause size={12} />
							{sound.name}
							<span class="pct">{Math.round(mix.volumeOf(sound.id) * 100)}</span>
						</button>
						{#if playing.length > 1}
							<button
								type="button"
								class="solo-btn"
								class:on={mix.soloId === sound.id}
								aria-label={mix.soloId === sound.id ? `Unsolo ${sound.name}` : `Solo ${sound.name}`}
								onclick={() => mix.toggleSolo(sound.id, sounds)}
							>
								<Headphones size={12} />
							</button>
						{/if}
					</div>
				{/each}
				{#if canCompanion}
					<button type="button" class="chip add-layer" aria-label="Add a companion layer" onclick={() => addCompanion()}>
						<Plus size={14} />
					</button>
				{/if}
			</div>
			{#if elapsed > 0}
				<span class="elapsed" title="Listening time">{formatElapsed(elapsed)}</span>
			{/if}
		{/if}
	</div>
	<div class="master">
		<button
			type="button"
			class="iconish"
			class:on={listening}
			aria-pressed={listening}
			aria-label={listening ? 'Show library' : 'Listen'}
			onclick={() => onListen?.()}
		>
			{#if listening}
				<LayoutGrid size={16} />
			{:else}
				<Maximize2 size={16} />
			{/if}
		</button>
		<button
			type="button"
			class="iconish"
			class:on={keepAwake}
			aria-pressed={keepAwake}
			aria-label={keepAwake ? 'Keep screen on while mixing' : 'Let the screen sleep'}
			onclick={() => onKeepAwake?.(!keepAwake)}
		>
			<Monitor size={16} />
		</button>
		<button
			type="button"
			class="iconish"
			class:on={still}
			aria-pressed={still}
			aria-label={still ? 'Use a moving background' : 'Use a still background'}
			onclick={() => onStill?.(!still)}
		>
			{#if still}
				<Image size={16} />
			{:else}
				<Film size={16} />
			{/if}
		</button>
		<div class="sleep">
			<button
				type="button"
				class="iconish"
				class:on={sleepLeft > 0}
				aria-expanded={sleepOpen}
				aria-label={sleepLeft > 0 ? `Sleep timer ${formatLeft(sleepLeft)}` : 'Sleep timer'}
				onclick={() => (sleepOpen = !sleepOpen)}
			>
				<Moon size={16} />
				{#if sleepLeft > 0}
					<span>{formatLeft(sleepLeft)}</span>
				{/if}
			</button>
			{#if sleepOpen}
				<div class="sleep-menu glass" role="listbox" aria-label="Stop mix after">
					<button type="button" class:on={!mix.sleepUntil} onclick={() => pickSleep(null)}>Off</button>
					{#each SLEEP_MINUTES as minutes}
						<button type="button" onclick={() => pickSleep(minutes)}>{minutes} min</button>
					{/each}
				</div>
			{/if}
		</div>
		<button type="button" class="iconish" class:on={muted} aria-label={muted ? 'Unmute' : 'Mute'} onclick={() => mix.toggleMute()}>
			{#if muted}
				<VolumeX size={16} />
			{:else}
				<Volume2 size={16} />
			{/if}
		</button>
		{#if playing.length > 1}
			<button type="button" class="iconish" aria-label="Even layer volumes" onclick={() => mix.evenVolumes()}>
				<Blend size={16} />
			</button>
		{/if}
		<div class="mood" role="group" aria-label="Master level">
			{#each MASTER_MOODS as mood}
				<button
					type="button"
					class:on={masterMood(mix.masterVolume) === mood.id}
					aria-label={`${mood.label} master`}
					onclick={() => mix.setMasterVolume(mood.volume)}
				>
					{mood.label}
				</button>
			{/each}
		</div>
		<Slider label="Master volume" value={mix.masterVolume} oninput={(value) => mix.setMasterVolume(value)} />
		{#if playing.length > 0}
			<div class="sleep">
				<button type="button" class="iconish" class:on={saveOpen} aria-label="Save this mix" aria-expanded={saveOpen} onclick={openSave}>
					<Bookmark size={16} />
				</button>
				{#if saveOpen}
					<form class="save-menu glass" onsubmit={commitSave}>
						<div class="kind" role="group" aria-label="Save as">
							<button type="button" class:on={saveKind === 'mix'} onclick={() => setSaveKind('mix')}>Mix</button>
							<button type="button" class:on={saveKind === 'list'} onclick={() => setSaveKind('list')}>List</button>
						</div>
						<label>
							<span class="visually-hidden">{saveKind === 'list' ? 'List name' : 'Mix name'}</span>
							<input bind:value={saveName} maxlength="40" placeholder={saveKind === 'list' ? 'Name this list' : 'Name this mix'} />
						</label>
						<Button variant="primary" type="submit">Save</Button>
					</form>
				{/if}
			</div>
			<button
				type="button"
				class="iconish"
				class:on={copied || copiedText}
				aria-label={copiedText ? 'Mix copied as text' : copied ? 'Mix link copied' : 'Copy mix link'}
				title="Copy mix link · Shift copies names"
				onclick={(event) => copyMix(event.shiftKey)}
			>
				<Link2 size={16} />
			</button>
		{/if}
		<Button variant="glass" onclick={() => mix.stopAll()}>Stop all</Button>
	</div>
</aside>

<style>
	.bar {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: 0.85rem;
		width: min(1120px, calc(100% - 2rem));
		z-index: 10;
		display: grid;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		border-radius: 1.4rem;
	}

	@media (min-width: 720px) {
		.bar {
			grid-template-columns: 1fr auto;
			align-items: center;
		}
	}

	.now {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.55rem;
		color: var(--muted);
		font-size: 0.92rem;
	}

	.names {
		color: var(--accent-strong);
	}

	.elapsed {
		font-variant-numeric: tabular-nums;
		font-size: 0.78rem;
		color: var(--muted);
		letter-spacing: 0.04em;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: rgba(157, 204, 176, 0.12);
		color: var(--accent-strong);
		overflow: hidden;
	}

	.chip.solo {
		border-color: rgba(228, 197, 138, 0.5);
		color: var(--gold);
	}

	.chip.focus:not(.solo) {
		border-color: rgba(157, 204, 176, 0.55);
		box-shadow: 0 0 0 1px rgba(157, 204, 176, 0.22);
	}

	.chip[data-cat='asmr'] {
		background: rgba(var(--cat-asmr), 0.16);
	}
	.chip[data-cat='background'] {
		background: rgba(var(--cat-background), 0.16);
	}
	.chip[data-cat='ambient'] {
		background: rgba(var(--cat-ambient), 0.16);
	}
	.chip[data-cat='nature'] {
		background: rgba(var(--cat-nature), 0.16);
	}

	.chip-main {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.55rem 0.25rem 0.25rem;
		border: 0;
		background: transparent;
		color: inherit;
	}

	.pct {
		font-variant-numeric: tabular-nums;
		font-size: 0.72rem;
		opacity: 0.72;
		min-width: 1.5rem;
	}

	.add-layer {
		padding: 0.28rem 0.45rem;
		color: var(--muted);
	}

	.chip img {
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 999px;
		object-fit: cover;
	}

	.solo-btn {
		border: 0;
		border-left: 1px solid var(--glass-border);
		background: transparent;
		color: var(--muted);
		padding: 0.35rem 0.45rem;
		display: grid;
		place-items: center;
	}

	.solo-btn.on {
		color: var(--gold);
	}

	.master {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 16rem;
	}

	.master :global(.slider) {
		flex: 1 1 6rem;
		width: auto;
		min-width: 6rem;
	}

	.master :global(.btn) {
		flex-shrink: 0;
		white-space: nowrap;
	}

	.mood {
		display: flex;
		flex-shrink: 0;
		border: 1px solid var(--glass-border);
		border-radius: 999px;
		overflow: hidden;
	}

	.mood button {
		border: 0;
		background: transparent;
		color: var(--muted);
		padding: 0.35rem 0.5rem;
		font-size: 0.72rem;
	}

	.mood button.on {
		color: #102018;
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
		font-weight: 600;
	}

	.sleep {
		position: relative;
	}

	.iconish {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: transparent;
		color: var(--muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.iconish.on {
		color: var(--gold);
		border-color: rgba(228, 197, 138, 0.45);
	}

	.sleep-menu {
		position: absolute;
		right: 0;
		bottom: calc(100% + 0.45rem);
		display: grid;
		min-width: 7.5rem;
		padding: 0.35rem;
		border-radius: 1rem;
		z-index: 12;
	}

	.sleep-menu button {
		border: 0;
		background: transparent;
		text-align: left;
		padding: 0.45rem 0.65rem;
		border-radius: 0.7rem;
		color: var(--text);
	}

	.sleep-menu button:hover,
	.sleep-menu button.on {
		background: rgba(157, 204, 176, 0.16);
	}

	.save-menu {
		position: absolute;
		right: 0;
		bottom: calc(100% + 0.45rem);
		display: grid;
		gap: 0.4rem;
		padding: 0.45rem;
		border-radius: 1rem;
		z-index: 12;
		min-width: 14rem;
	}

	.kind {
		display: flex;
		border: 1px solid var(--glass-border);
		border-radius: 999px;
		overflow: hidden;
	}

	.kind button {
		flex: 1;
		border: 0;
		background: transparent;
		color: var(--muted);
		padding: 0.32rem 0.55rem;
		font-size: 0.78rem;
	}

	.kind button.on {
		color: #102018;
		background: linear-gradient(180deg, var(--accent-strong), var(--accent));
		font-weight: 600;
	}

	.save-menu label {
		display: flex;
	}

	.save-menu input {
		width: 100%;
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.28);
		border-radius: 0.7rem;
		padding: 0.45rem 0.6rem;
		outline: none;
	}
</style>
