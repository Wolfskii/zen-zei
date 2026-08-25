<script lang="ts">
	import { Search } from '@lucide/svelte'

	let {
		value = $bindable(''),
		placeholder = 'Search',
		label = 'Search sounds',
		id = 'sound-search'
	}: {
		value?: string
		placeholder?: string
		label?: string
		id?: string
	} = $props()
</script>

<label class="search">
	<span class="visually-hidden">{label}</span>
	<Search size={16} />
	<input
		{id}
		type="search"
		{placeholder}
		autocomplete="off"
		{value}
		oninput={(event) => (value = (event.currentTarget as HTMLInputElement).value)}
	/>
</label>

<style>
	.search {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		min-width: min(18rem, 100%);
		padding: 0.5rem 0.85rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: var(--glass);
		backdrop-filter: blur(12px);
		color: var(--muted);
	}

	input {
		flex: 1;
		border: 0;
		background: transparent;
		outline: none;
		color: var(--text);
		min-width: 0;
	}

	input::-webkit-search-cancel-button {
		filter: invert(1);
	}
</style>
