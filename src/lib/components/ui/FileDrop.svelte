<script lang="ts">
	let {
		label,
		accept,
		file = $bindable<File | null>(null),
		hint = 'Drop a file or browse'
	}: {
		label: string
		accept: string
		file?: File | null
		hint?: string
	} = $props()

	let over = $state(false)

	function pick(list: FileList | null) {
		file = list?.[0] ?? null
	}
</script>

<div class="drop" class:over>
	<span class="label">{label}</span>
	<label
		ondragover={(event) => {
			event.preventDefault()
			over = true
		}}
		ondragleave={() => (over = false)}
		ondrop={(event) => {
			event.preventDefault()
			over = false
			pick(event.dataTransfer?.files ?? null)
		}}
	>
		<input type="file" {accept} class="visually-hidden" onchange={(event) => pick((event.currentTarget as HTMLInputElement).files)} />
		<strong>{file ? file.name : hint}</strong>
	</label>
</div>

<style>
	.drop {
		display: grid;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	label {
		display: grid;
		place-items: center;
		min-height: 5.5rem;
		padding: 1rem;
		text-align: center;
		border-radius: var(--radius-sm);
		border: 1px dashed var(--glass-border);
		background: rgba(0, 0, 0, 0.22);
		cursor: pointer;
	}

	.over label,
	label:hover {
		border-color: var(--accent);
		background: rgba(157, 204, 176, 0.08);
	}

	strong {
		font-weight: 500;
		color: var(--text);
		word-break: break-all;
	}
</style>
