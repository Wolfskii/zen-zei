<script lang="ts">
	import { parseShelfJson, stringifyShelf, type Shelf } from '$lib/shelf'

	let { shelf, onrestore }: { shelf: Shelf; onrestore?: (next: Shelf) => void } = $props()

	let fileInput = $state<HTMLInputElement | undefined>(undefined)

	function download() {
		const blob = new Blob([stringifyShelf(shelf)], { type: 'application/json' })
		const href = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = href
		link.download = 'zenzei-shelf.json'
		link.click()
		URL.revokeObjectURL(href)
	}

	async function restore(files: FileList | null) {
		const file = files?.[0]
		if (fileInput) fileInput.value = ''
		if (!file) return
		const parsed = parseShelfJson(await file.text())
		if (!parsed) {
			window.alert('That file is not a Zen-Zei backup.')
			return
		}
		if (!window.confirm('Replace favourites, lists, and mixes on this device?')) return
		onrestore?.(parsed)
	}
</script>

<footer>
	<p>Zen-Zei mixes looping YouTube, files, and links. Save a mix, copy a link, or press R for a surprise. Press ? for keys.</p>
	<p class="backup">
		<button type="button" onclick={download}>Download lists</button>
		<button type="button" onclick={() => fileInput?.click()}>Restore from file</button>
		<input bind:this={fileInput} class="visually-hidden" type="file" accept="application/json,.json" tabindex="-1" aria-hidden="true" onchange={(event) => restore((event.currentTarget as HTMLInputElement).files)} />
	</p>
</footer>

<style>
	footer {
		padding: 2rem 0 1rem;
		color: var(--muted);
		font-size: 0.85rem;
		text-align: center;
	}

	.backup {
		display: flex;
		justify-content: center;
		gap: 0.85rem;
		margin-top: 0.55rem;
	}

	.backup button {
		border: 0;
		background: transparent;
		color: var(--accent-strong);
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}
</style>
