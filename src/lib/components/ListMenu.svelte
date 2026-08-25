<script lang="ts">
	import type { SavedList } from '$lib/shelf'
	import Button from './ui/Button.svelte'

	let {
		lists,
		soundId,
		onToggle,
		onCreate
	}: {
		lists: SavedList[]
		soundId: string
		onToggle: (listId: string) => void
		onCreate: (name: string) => void
	} = $props()

	let name = $state('')

	function create(event: Event) {
		event.preventDefault()
		onCreate(name)
		name = ''
	}
</script>

<div class="menu glass" role="menu" aria-label="Add to a list">
	<p>Your lists</p>
	{#if lists.length}
		<ul>
			{#each lists as list}
				{@const on = list.soundIds.includes(soundId)}
				<li>
					<button type="button" class:on role="menuitemcheckbox" aria-checked={on} onclick={() => onToggle(list.id)}>
						<span>{list.name}</span>
						<small>{on ? 'In list' : `${list.soundIds.length}`}</small>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="hint">Name a list, then add more squares to it.</p>
	{/if}
	<form onsubmit={create}>
		<label>
			<span class="visually-hidden">New list name</span>
			<input bind:value={name} maxlength="40" placeholder="New list" />
		</label>
		<Button variant="primary" type="submit">Add</Button>
	</form>
</div>

<style>
	.menu {
		position: absolute;
		top: calc(100% + 0.35rem);
		right: 0;
		z-index: 8;
		width: 13.5rem;
		padding: 0.55rem;
		border-radius: 1rem;
		display: grid;
		gap: 0.4rem;
	}

	p {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.62rem;
		color: var(--gold);
	}

	.hint {
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.78rem;
		color: var(--muted);
		line-height: 1.35;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 9rem;
		overflow: auto;
		display: grid;
		gap: 0.15rem;
	}

	button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		border: 0;
		background: transparent;
		color: var(--text);
		padding: 0.4rem 0.5rem;
		border-radius: 0.7rem;
		text-align: left;
		font-size: 0.88rem;
	}

	button:hover,
	button.on {
		background: rgba(157, 204, 176, 0.16);
	}

	small {
		color: var(--muted);
		font-size: 0.7rem;
	}

	button.on small {
		color: var(--gold);
	}

	form {
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	input {
		width: 7.2rem;
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.28);
		border-radius: 0.7rem;
		padding: 0.42rem 0.55rem;
		outline: none;
	}

	form :global(.btn) {
		padding: 0.42rem 0.7rem;
		font-size: 0.8rem;
	}
</style>
