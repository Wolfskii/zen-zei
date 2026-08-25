<script lang="ts">
	import { Plus } from '@lucide/svelte'
	import Button from './ui/Button.svelte'

	let { onadd, quiet = false, now = '' }: { onadd: () => void; quiet?: boolean; now?: string } = $props()
</script>

<header class="header glass" class:quiet>
	<a href="/" class="brand">
		<span class="mark">Z</span>
		<span>
			<strong>Zen-Zei</strong>
			<small>{now || 'layered quiet'}</small>
		</span>
	</a>
	{#if !quiet}
		<div class="actions">
			<Button variant="primary" onclick={onadd}>
				<Plus size={16} />
				Add sound
			</Button>
		</div>
	{/if}
</header>

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

	strong {
		display: block;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
	}

	small {
		display: block;
		color: var(--muted);
		font-size: 0.75rem;
		max-width: min(42vw, 18rem);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header.quiet {
		margin-bottom: 0.65rem;
	}
</style>
