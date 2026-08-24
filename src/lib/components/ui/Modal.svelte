<script lang="ts">
	import { X } from '@lucide/svelte'
	import type { Snippet } from 'svelte'
	import { onMount } from 'svelte'
	import IconButton from './IconButton.svelte'

	let {
		open = $bindable(false),
		title,
		children
	}: {
		open?: boolean
		title: string
		children: Snippet
	} = $props()

	function close() {
		open = false
	}

	onMount(() => {
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape' && open) close()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	})
</script>

{#if open}
	<div class="overlay">
		<button type="button" class="backdrop" aria-label="Close dialog" onclick={close}></button>
		<div class="dialog glass" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
			<header>
				<h2 id="modal-title">{title}</h2>
				<IconButton label="Close" onclick={close}>
					<X size={18} />
				</IconButton>
			</header>
			<div class="body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: grid;
		place-items: center;
		padding: 1.25rem;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: rgba(4, 8, 10, 0.55);
	}

	.dialog {
		position: relative;
		z-index: 1;
		width: min(36rem, 100%);
		max-height: min(90vh, 52rem);
		overflow: auto;
		border-radius: var(--radius);
		padding: 1.1rem 1.2rem 1.3rem;
		outline: none;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 1.45rem;
	}

	.body {
		display: grid;
		gap: 0.9rem;
	}
</style>
