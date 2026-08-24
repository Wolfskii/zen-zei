<script lang="ts">
	import { Plus, Settings } from '@lucide/svelte'
	import Button from './ui/Button.svelte'
	import IconButton from './ui/IconButton.svelte'

	let {
		onadd,
		onsettings
	}: {
		onadd: () => void
		onsettings: () => void
	} = $props()
</script>

<header class="header glass">
	<a href="/" class="brand">
		<span class="mark">Z</span>
		<span>
			<strong>Zen-Zei</strong>
			<small>layered quiet</small>
		</span>
	</a>
	<div class="actions">
		<IconButton label="Settings" onclick={onsettings}>
			<Settings size={18} />
		</IconButton>
		<Button variant="primary" onclick={onadd}>
			<Plus size={16} />
			Add sound
		</Button>
	</div>
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
		color: var(--muted);
		font-size: 0.75rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
