<script lang="ts">
	import { SOUND_ICON_NAMES } from '$lib/icons'
	import { api } from '$lib/api'
	import { tileLookFromCoverUrl, type TileLook } from '$lib/cover'
	import type { Category, Sound } from '$lib/types'
	import Button from './ui/Button.svelte'
	import FileDrop from './ui/FileDrop.svelte'
	import Icon from './ui/Icon.svelte'
	import Modal from './ui/Modal.svelte'
	import Select from './ui/Select.svelte'
	import TextArea from './ui/TextArea.svelte'
	import TextField from './ui/TextField.svelte'

	let {
		open = $bindable(false),
		categories,
		sound = null,
		oncreated,
		onsaved
	}: {
		open?: boolean
		categories: Category[]
		sound?: Sound | null
		oncreated?: (sound: Sound) => void
		onsaved?: (sound: Sound) => void
	} = $props()

	const editing = $derived(!!sound)
	let filledFor = $state('')

	let tab = $state<'youtube' | 'file' | 'url'>('youtube')
	let look = $state<TileLook>('picture')
	let youtubeUrl = $state('')
	let audioLink = $state('')
	let name = $state('')
	let description = $state('')
	let categoryId = $state('')
	let icon = $state('CloudRain')
	let audio = $state<File | null>(null)
	let cover = $state<File | null>(null)
	let previewThumb = $state('')
	let busy = $state(false)
	let error = $state('')
	let coverPreview = $state('')
	let keepCover = $state(true)

	$effect(() => {
		const isOpen = open
		const id = sound?.id ?? 'new'
		if (!isOpen) {
			filledFor = ''
			return
		}
		if (filledFor === id) return
		filledFor = id
		if (sound) {
			tab = sound.kind === 'url' ? 'url' : sound.kind === 'file' ? 'file' : 'youtube'
			look = tileLookFromCoverUrl(sound.coverUrl)
			youtubeUrl = sound.youtubeUrl ?? ''
			audioLink = sound.audioRemoteUrl ?? ''
			name = sound.name
			description = sound.description
			categoryId = sound.category.id
			icon = sound.icon ?? 'AudioLines'
			previewThumb = sound.coverUrl ?? ''
			audio = null
			cover = null
			keepCover = true
			error = ''
			return
		}
		tab = 'youtube'
		look = 'picture'
		youtubeUrl = ''
		audioLink = ''
		name = ''
		description = ''
		icon = 'CloudRain'
		audio = null
		cover = null
		previewThumb = ''
		error = ''
		keepCover = true
		categoryId = categories[0]?.id ?? ''
	})

	$effect(() => {
		if (!cover) {
			coverPreview = previewThumb
			return
		}
		const url = URL.createObjectURL(cover)
		coverPreview = url
		return () => URL.revokeObjectURL(url)
	})

	async function preview() {
		error = ''
		try {
			const data = await api.previewYouTube(youtubeUrl)
			if (!name) name = data.title
			previewThumb = data.thumbnailUrl
			if (look === 'picture' && !cover) previewThumb = data.thumbnailUrl
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not read that YouTube link'
		}
	}

	async function previewAudioLink() {
		error = ''
		try {
			const data = await api.previewAudio(audioLink)
			if (!name) name = data.suggestedName
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not read that audio link'
		}
	}

	function useVideoStill() {
		cover = null
		keepCover = false
		look = 'picture'
		if (previewThumb && !previewThumb.includes('/cover')) return
		previewThumb = ''
		void preview()
	}

	async function submit(event: Event) {
		event.preventDefault()
		busy = true
		error = ''
		try {
			if (editing && sound) {
				const updated = await saveEdit(sound)
				onsaved?.(updated)
			} else {
				const created = await createSound()
				oncreated?.(created)
			}
			reset()
			open = false
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not save sound'
		} finally {
			busy = false
		}
	}

	async function createSound(): Promise<Sound> {
		if (tab === 'file' && !audio) throw new Error('Choose an audio file')
		if (tab === 'url' && !audioLink.trim()) throw new Error('Paste an MP3 or WAV link')
		const form = new FormData()
		form.set('kind', tab)
		form.set('name', name)
		form.set('description', description)
		form.set('categoryId', categoryId)
		form.set('icon', icon)
		form.set('coverMode', look)
		if (tab === 'youtube') form.set('youtubeUrl', youtubeUrl)
		if (tab === 'url') form.set('audioUrl', audioLink)
		if (tab === 'file' && audio) form.set('audio', audio)
		if (look === 'picture' && cover) form.set('cover', cover)
		const { sound: created } = await api.create(form)
		return created
	}

	async function saveEdit(current: Sound): Promise<Sound> {
		const form = new FormData()
		form.set('name', name)
		form.set('description', description)
		form.set('categoryId', categoryId)
		form.set('icon', icon)
		if (tab === 'youtube') form.set('youtubeUrl', youtubeUrl)
		if (tab === 'url') form.set('audioUrl', audioLink)
		if (look === 'icon') {
			form.set('coverMode', 'icon')
		} else if (cover) {
			form.set('coverMode', 'picture')
			form.set('cover', cover)
		} else if (!keepCover || !current.coverUrl) {
			form.set('coverMode', 'picture')
		}
		if (audio) form.set('audio', audio)
		const { sound: updated } = await api.updateForm(current.id, form)
		return updated
	}

	function reset() {
		youtubeUrl = ''
		audioLink = ''
		name = ''
		description = ''
		audio = null
		cover = null
		previewThumb = ''
		error = ''
		tab = 'youtube'
		look = 'picture'
	}
</script>

<Modal bind:open title={editing ? 'Edit sound' : 'Add a sound'}>
	{#if !editing}
		<div class="tabs source-tabs">
			<button type="button" class:on={tab === 'youtube'} onclick={() => (tab = 'youtube')}>YouTube</button>
			<button type="button" class:on={tab === 'file'} onclick={() => (tab = 'file')}>Your file</button>
			<button type="button" class:on={tab === 'url'} onclick={() => (tab = 'url')}>MP3 / WAV link</button>
		</div>
	{/if}

	<form onsubmit={submit}>
		{#if tab === 'youtube'}
			<TextField label="YouTube link" bind:value={youtubeUrl} placeholder="https://www.youtube.com/watch?v=..." required />
			<Button variant="ghost" type="button" onclick={preview}>Fetch title & thumbnail</Button>
		{:else if tab === 'url'}
			<TextField label="MP3 / WAV link" type="url" bind:value={audioLink} placeholder="https://example.com/rain.mp3" required />
			<Button variant="ghost" type="button" onclick={previewAudioLink}>Check link</Button>
			<p class="hint">Direct file URL (MP3, WAV, OGG, or WebM). YouTube pages belong on the YouTube tab.</p>
		{:else}
			<FileDrop
				label={editing ? 'Replace audio (optional)' : 'Audio loop'}
				accept="audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/*"
				bind:file={audio}
				hint="MP3, WAV, OGG, or WebM"
			/>
		{/if}

		<div class="look">
			<span>Square look</span>
			<div class="tabs">
				<button type="button" class:on={look === 'picture'} onclick={() => (look = 'picture')}>Picture</button>
				<button type="button" class:on={look === 'icon'} onclick={() => (look = 'icon')}>Icon</button>
			</div>
			{#if look === 'picture'}
				<FileDrop label="Your picture" accept="image/jpeg,image/png,image/webp,image/gif" bind:file={cover} hint="JPEG, PNG, or WebP — or leave empty" />
				{#if tab === 'youtube'}
					<Button variant="ghost" type="button" onclick={useVideoStill}>Use the YouTube thumbnail</Button>
				{/if}
				{#if coverPreview}
					<img class="thumb" src={coverPreview} alt="Cover preview" />
				{/if}
				<p class="hint">
					{tab === 'youtube' ? 'No picture uses the video still. Pick Icon if you want a glyph instead.' : 'No picture uses the icon on the tile.'}
				</p>
			{:else}
				<div class="icon-grid">
					{#each SOUND_ICON_NAMES as iconName}
						<button type="button" class="icon-pick" class:on={icon === iconName} onclick={() => (icon = iconName)} aria-label={iconName}>
							<Icon name={iconName} size={18} />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if look === 'picture'}
			<div class="icons">
				<span>Backup icon</span>
				<div class="icon-grid">
					{#each SOUND_ICON_NAMES as iconName}
						<button type="button" class="icon-pick" class:on={icon === iconName} onclick={() => (icon = iconName)} aria-label={iconName}>
							<Icon name={iconName} size={18} />
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<TextField label="Name" bind:value={name} required />
		<TextArea label="Description" bind:value={description} placeholder="What does this layer feel like?" />
		<Select label="Category" bind:value={categoryId} options={categories.map((category) => ({ value: category.id, label: category.name }))} />

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="actions">
			<Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add to library'}</Button>
		</div>
	</form>
</Modal>

<style>
	.tabs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
		padding: 0.25rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid var(--glass-border);
	}

	.tabs button {
		border: 0;
		background: transparent;
		border-radius: 999px;
		padding: 0.5rem;
		color: var(--muted);
	}

	.tabs button.on {
		background: var(--glass-strong);
		color: var(--text);
	}

	.tabs.source-tabs {
		grid-template-columns: repeat(3, 1fr);
	}

	.tabs.source-tabs button {
		padding: 0.45rem 0.35rem;
		font-size: 0.82rem;
	}

	form {
		display: grid;
		gap: 0.85rem;
	}

	.look,
	.icons {
		display: grid;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.hint {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.thumb {
		width: 100%;
		height: 8rem;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(2.3rem, 1fr));
		gap: 0.35rem;
	}

	.icon-pick {
		width: 2.3rem;
		height: 2.3rem;
		border-radius: 0.7rem;
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.25);
		color: var(--text);
		display: grid;
		place-items: center;
	}

	.icon-pick.on {
		border-color: var(--accent);
		background: rgba(157, 204, 176, 0.2);
		color: var(--accent-strong);
	}

	.error {
		color: var(--danger);
		font-size: 0.9rem;
	}

	.actions {
		position: sticky;
		bottom: -0.2rem;
		padding-top: 0.4rem;
		background: linear-gradient(180deg, transparent, rgba(12, 18, 20, 0.92) 30%);
	}
</style>
