<script lang="ts">
	import { X } from '@lucide/svelte'
	import IconButton from './ui/IconButton.svelte'

	let { open = $bindable(false) }: { open?: boolean } = $props()

	const rows = [
		{ keys: '/', does: 'Focus search' },
		{ keys: '1–4', does: 'Start a scene' },
		{ keys: '[ ]', does: 'Master quieter or louder' },
		{ keys: '{ }', does: 'Last layer quieter or louder' },
		{ keys: 'E', does: 'Even layer volumes' },
		{ keys: 'A', does: 'Add a companion layer' },
		{ keys: 'N', does: 'Now playing only' },
		{ keys: 'C', does: 'Copy mix link (Shift: names)' },
		{ keys: 'Space', does: 'Pause or continue the mix' },
		{ keys: 'R', does: 'Surprise mix (Shift: last scene)' },
		{ keys: 'L', does: 'Listen mode' },
		{ keys: 'M', does: 'Mute or unmute' },
		{ keys: 'Esc', does: 'Stop everything' },
		{ keys: '?', does: 'Show or hide this list' }
	]

	function close() {
		open = false
	}

	$effect(() => {
		if (!open || typeof window === 'undefined') return
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.preventDefault()
				close()
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	})
</script>

{#if open}
	<div class="overlay">
		<button type="button" class="backdrop" aria-label="Close shortcuts" onclick={close}></button>
		<div class="card glass" role="dialog" aria-modal="true" aria-labelledby="keys-title">
			<header>
				<h2 id="keys-title">Keys</h2>
				<IconButton label="Close" onclick={close}>
					<X size={18} />
				</IconButton>
			</header>
			<dl>
				{#each rows as row}
					<div>
						<dt><kbd>{row.keys}</kbd></dt>
						<dd>{row.does}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: end center;
		padding: 0 1rem 6.5rem;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: rgba(4, 8, 10, 0.35);
	}

	.card {
		position: relative;
		z-index: 1;
		width: min(22rem, 100%);
		padding: 1rem 1.1rem 1.15rem;
		border-radius: 1.3rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.65rem;
	}

	h2 {
		font-size: 1.25rem;
	}

	dl {
		display: grid;
		gap: 0.45rem;
		margin: 0;
	}

	dl div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	dt {
		margin: 0;
	}

	dd {
		margin: 0;
		color: var(--muted);
		font-size: 0.9rem;
	}

	kbd {
		display: inline-block;
		min-width: 3.2rem;
		padding: 0.2rem 0.5rem;
		border-radius: 0.55rem;
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.28);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		text-align: center;
	}
</style>
