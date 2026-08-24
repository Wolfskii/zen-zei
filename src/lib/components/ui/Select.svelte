<script lang="ts">
	type Option = { value: string; label: string }

	let {
		label,
		value = $bindable(''),
		options,
		name
	}: {
		label: string
		value?: string
		options: Option[]
		name?: string
	} = $props()
</script>

<label class="field">
	<span>{label}</span>
	<select {name} bind:value>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</label>

<style>
	.field {
		display: grid;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	select {
		width: 100%;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.35);
		padding: 0.7rem 0.85rem;
		outline: none;
	}

	select:focus {
		border-color: var(--accent);
	}
</style>
