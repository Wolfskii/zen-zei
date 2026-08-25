<script lang="ts">
	import { Pencil, Plus, Trash2 } from '@lucide/svelte'
	import { api, hasAdminKey, setAdminKey } from '$lib/api'
	import AddSoundModal from '$lib/components/AddSoundModal.svelte'
	import Button from '$lib/components/ui/Button.svelte'
	import Icon from '$lib/components/ui/Icon.svelte'
	import TextField from '$lib/components/ui/TextField.svelte'
	import type { Sound } from '$lib/types'

	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	let unlocked = $state(false)
	let checking = $state(true)
	let key = $state('')
	let gateError = $state('')
	let localSounds = $state<Sound[] | null>(null)
	const sounds = $derived(localSounds ?? data.sounds)
	let editorOpen = $state(false)
	let editing = $state<Sound | null>(null)

	function currentSounds(): Sound[] {
		return localSounds ?? data.sounds
	}

	$effect(() => {
		if (typeof window === 'undefined') return
		void unlockFromStorage()
	})

	async function unlockFromStorage() {
		if (!hasAdminKey()) {
			checking = false
			unlocked = false
			return
		}
		try {
			await api.adminSession()
			unlocked = true
		} catch {
			setAdminKey('')
			unlocked = false
		} finally {
			checking = false
		}
	}

	async function unlock(event: Event) {
		event.preventDefault()
		gateError = ''
		setAdminKey(key.trim())
		try {
			await api.adminSession()
			unlocked = true
		} catch {
			setAdminKey('')
			gateError = 'That key was rejected.'
		}
	}

	function signOut() {
		setAdminKey('')
		key = ''
		unlocked = false
	}

	function openCreate() {
		editing = null
		editorOpen = true
	}

	function openEdit(sound: Sound) {
		editing = sound
		editorOpen = true
	}

	function oncreated(sound: Sound) {
		localSounds = [sound, ...currentSounds()]
	}

	function onsaved(sound: Sound) {
		localSounds = currentSounds().map((item) => (item.id === sound.id ? sound : item))
		editing = null
	}

	async function remove(sound: Sound) {
		if (!confirm(`Delete “${sound.name}” from the shared library?`)) return
		await api.remove(sound.id)
		localSounds = currentSounds().filter((item) => item.id !== sound.id)
	}
</script>

<svelte:head>
	<title>{unlocked ? 'Library · Zen-Zei' : 'Zen-Zei'}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<header class="header glass">
	<a href="/" class="brand">
		<span class="mark">Z</span>
		<span>
			<strong>{unlocked ? 'Library' : 'Zen-Zei'}</strong>
			<small>{unlocked ? 'catalog' : 'layered quiet'}</small>
		</span>
	</a>
	<div class="actions">
		<a href="/">Mixer</a>
		{#if unlocked}
			<Button variant="ghost" onclick={signOut}>Sign out</Button>
			<Button variant="primary" onclick={openCreate}>
				<Plus size={16} />
				Add sound
			</Button>
		{/if}
	</div>
</header>

{#if checking}
	<p class="muted">A moment…</p>
{:else if !unlocked}
	<section class="gate glass">
		<h1>Private</h1>
		<p class="muted">This page is locked.</p>
		<form onsubmit={unlock}>
			<TextField label="Key" type="password" bind:value={key} required />
			<Button variant="primary" type="submit">Unlock</Button>
			{#if gateError}
				<p class="error">{gateError}</p>
			{/if}
		</form>
	</section>
{:else}
	<section class="hero">
		<h1>Library</h1>
		<p class="muted">{sounds.length} sounds · votes stay when you edit · delete is permanent</p>
	</section>

	<div class="table-wrap glass">
		<table>
			<thead>
				<tr>
					<th>Cover</th>
					<th>Name</th>
					<th>Category</th>
					<th>Kind</th>
					<th>Stars</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each sounds as sound (sound.id)}
					<tr>
						<td>
							{#if sound.coverUrl}
								<img src={sound.coverUrl} alt="" />
							{:else}
								<span class="ph"><Icon name={sound.icon ?? sound.category.icon} size={22} /></span>
							{/if}
						</td>
						<td>
							<strong>{sound.name}</strong>
							<small>{sound.description}</small>
						</td>
						<td>{sound.category.name}</td>
						<td class="kind">{sound.kind === 'url' ? 'Link' : sound.kind}</td>
						<td>{sound.rating.average.toFixed(1)} · {sound.rating.count}</td>
						<td class="ops">
							<button type="button" class="op" onclick={() => openEdit(sound)} aria-label="Edit {sound.name}">
								<Pencil size={16} />
							</button>
							<button type="button" class="op danger" onclick={() => remove(sound)} aria-label="Delete {sound.name}">
								<Trash2 size={16} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<AddSoundModal bind:open={editorOpen} categories={data.categories} sound={editing} {oncreated} {onsaved} />

<style>
	.header {
		position: sticky;
		top: 0.75rem;
		z-index: 15;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.65rem 0.75rem 0.65rem 0.85rem;
		border-radius: 1.4rem;
		margin-bottom: 1.5rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		text-decoration: none;
		color: inherit;
	}

	.mark {
		width: 2.3rem;
		height: 2.3rem;
		border-radius: 0.85rem;
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-weight: 700;
		background: linear-gradient(160deg, var(--accent-strong), var(--accent));
		color: #102018;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.actions a {
		color: var(--text);
		text-decoration: none;
		padding: 0.5rem 0.85rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
	}

	.hero h1,
	.gate h1 {
		font-size: 2.2rem;
		margin-bottom: 0.35rem;
	}

	.muted {
		color: var(--muted);
	}

	.gate {
		max-width: 26rem;
		padding: 1.4rem;
		border-radius: var(--radius);
	}

	.gate form {
		display: grid;
		gap: 0.85rem;
		margin-top: 1rem;
	}

	.error {
		color: var(--danger);
		margin: 0;
	}

	.table-wrap {
		overflow: auto;
		border-radius: var(--radius);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.75rem 0.9rem;
		text-align: left;
		vertical-align: middle;
		border-bottom: 1px solid var(--glass-border);
	}

	th {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 500;
	}

	td img {
		width: 3.4rem;
		height: 3.4rem;
		object-fit: cover;
		border-radius: 0.7rem;
	}

	td strong {
		display: block;
		font-family: var(--font-display);
	}

	td small {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: var(--muted);
		max-width: 22rem;
	}

	.kind {
		text-transform: capitalize;
		color: var(--muted);
	}

	.ph {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.ops {
		white-space: nowrap;
		text-align: right;
	}

	.op {
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: var(--glass);
		color: var(--text);
		display: inline-grid;
		place-items: center;
	}

	.op.danger {
		color: #ffd6d6;
		border-color: rgba(224, 139, 139, 0.35);
	}
</style>
