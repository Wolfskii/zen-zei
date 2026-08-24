<script lang="ts">
	let {
		label,
		value = $bindable(''),
		placeholder = '',
		name,
		rows = 3
	}: {
		label: string
		value?: string
		placeholder?: string
		name?: string
		rows?: number
	} = $props()
</script>

<label class="field">
	<span>{label}</span>
	<textarea {name} {placeholder} {rows} bind:value></textarea>
</label>

<style>
	.field {
		display: grid;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	textarea {
		width: 100%;
		resize: vertical;
		min-height: 5rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.25);
		padding: 0.7rem 0.85rem;
		outline: none;
	}

	textarea:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(157, 204, 176, 0.2);
	}
</style>
