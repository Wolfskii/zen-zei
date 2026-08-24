<script lang="ts">
	let {
		label,
		value = $bindable(''),
		placeholder = '',
		type = 'text',
		name,
		required = false
	}: {
		label: string
		value?: string
		placeholder?: string
		type?: 'text' | 'url' | 'password'
		name?: string
		required?: boolean
	} = $props()
</script>

<label class="field">
	<span>{label}</span>
	<input {type} {name} {placeholder} {required} bind:value />
</label>

<style>
	.field {
		display: grid;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	input {
		width: 100%;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.25);
		padding: 0.7rem 0.85rem;
		outline: none;
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(157, 204, 176, 0.2);
	}
</style>
