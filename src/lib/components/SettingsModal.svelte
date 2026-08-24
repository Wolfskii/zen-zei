<script lang="ts">
	import { hasAdminKey, setAdminKey } from '$lib/api'
	import Button from './ui/Button.svelte'
	import Modal from './ui/Modal.svelte'
	import TextField from './ui/TextField.svelte'

	let { open = $bindable(false) }: { open?: boolean } = $props()

	let key = $state('')
	let saved = $state(false)

	$effect(() => {
		if (open && typeof sessionStorage !== 'undefined') {
			key = sessionStorage.getItem('zenzei:admin') ?? ''
			saved = hasAdminKey()
		}
	})

	function save() {
		setAdminKey(key.trim())
		saved = hasAdminKey()
	}

	function clear() {
		key = ''
		setAdminKey('')
		saved = false
	}
</script>

<Modal bind:open title="Settings">
	<p class="copy">Paste the server admin key to delete or edit sounds. It stays in this tab only (sessionStorage) and is sent as <code>x-admin-key</code>.</p>
	<TextField label="Admin API key" type="password" bind:value={key} placeholder="ZENZEI_ADMIN_API_KEY" />
	<div class="row">
		<Button variant="primary" onclick={save}>Save key</Button>
		<Button variant="ghost" onclick={clear}>Clear</Button>
	</div>
	<p class="status">{saved ? 'Admin key is active in this tab.' : 'No admin key — voting and adding still work.'}</p>
</Modal>

<style>
	.copy,
	.status {
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.45;
	}

	.row {
		display: flex;
		gap: 0.5rem;
	}

	code {
		font-size: 0.85em;
	}
</style>
