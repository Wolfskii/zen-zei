<script lang="ts">
	import { SOUND_ICON_NAMES } from '$lib/icons'
	import { api } from '$lib/api'
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
		oncreated
	}: {
		open?: boolean
		categories: Category[]
		oncreated: (sound: Sound) => void
	} = $props()

	let tab = $state<'youtube' | 'file'>('youtube')
	let youtubeUrl = $state('')
	let name = $state('')
	let description = $state('')
	let categoryId = $state('')
	let icon = $state('CloudRain')
	let audio = $state<File | null>(null)
	let cover = $state<File | null>(null)
	let previewThumb = $state('')
	let busy = $state(false)
	let error = $state('')

	$effect(() => {
		if (categories[0] && !categoryId) categoryId = categories[0].id
	})

	async function preview() {
		error = ''
		try {
			const data = await api.previewYouTube(youtubeUrl)
			if (!name) name = data.title
			previewThumb = data.thumbnailUrl
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not read that YouTube link'
		}
	}

	async function submit(event: Event) {
		event.preventDefault()
		busy = true
		error = ''
		try {
			if (tab === 'youtube') {
				const { sound } = await api.createYouTube({ name, description, categoryId, icon, youtubeUrl })
				oncreated(sound)
			} else {
				if (!audio) throw new Error('Choose an audio file')
				const form = new FormData()
				form.set('kind', 'file')
				form.set('name', name)
				form.set('description', description)
				form.set('categoryId', categoryId)
				form.set('icon', icon)
				form.set('audio', audio)
				if (cover) form.set('cover', cover)
				const { sound } = await api.createFile(form)
				oncreated(sound)
			}
			reset()
			open = false
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not add sound'
		} finally {
			busy = false
		}
	}

	function reset() {
		youtubeUrl = ''
		name = ''
		description = ''
		audio = null
		cover = null
		previewThumb = ''
		error = ''
	}
</script>

<Modal bind:open title="Add a sound">
	<div class="tabs">
		<button type="button" class:on={tab === 'youtube'} onclick={() => (tab = 'youtube')}>YouTube</button>
		<button type="button" class:on={tab === 'file'} onclick={() => (tab = 'file')}>Your file</button>
	</div>

	<form onsubmit={submit}>
		{#if tab === 'youtube'}
			<TextField label="YouTube link" bind:value={youtubeUrl} placeholder="https://www.youtube.com/watch?v=..." required />
			<Button variant="ghost" type="button" onclick={preview}>Fetch title & thumbnail</Button>
			{#if previewThumb}
				<img class="thumb" src={previewThumb} alt="YouTube thumbnail preview" />
			{/if}
		{:else}
			<FileDrop label="Audio loop" accept="audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/*" bind:file={audio} hint="MP3, WAV, OGG, or WebM" />
			<FileDrop label="Cover image (optional)" accept="image/jpeg,image/png,image/webp,image/gif" bind:file={cover} hint="JPEG, PNG, WebP" />
		{/if}

		<TextField label="Name" bind:value={name} required />
		<TextArea label="Description" bind:value={description} placeholder="What does this layer feel like?" />
		<Select label="Category" bind:value={categoryId} options={categories.map((category) => ({ value: category.id, label: category.name }))} />

		<div class="icons">
			<span>Icon</span>
			<div class="icon-grid">
				{#each SOUND_ICON_NAMES as iconName}
					<button type="button" class="icon-pick" class:on={icon === iconName} onclick={() => (icon = iconName)} aria-label={iconName}>
						<Icon name={iconName} size={18} />
					</button>
				{/each}
			</div>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="actions">
			<Button variant="primary" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add to library'}</Button>
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

	form {
		display: grid;
		gap: 0.85rem;
	}

	.thumb {
		width: 100%;
		height: 8rem;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}

	.icons {
		display: grid;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
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
