<script lang="ts">
	let {
		value = 0,
		min = 0,
		max = 1,
		step = 0.01,
		label,
		disabled = false,
		oninput
	}: {
		value?: number
		min?: number
		max?: number
		step?: number
		label: string
		disabled?: boolean
		oninput?: (value: number) => void
	} = $props()
</script>

<label class="slider">
	<span class="visually-hidden">{label}</span>
	<input
		type="range"
		{min}
		{max}
		{step}
		{value}
		{disabled}
		aria-label={label}
		oninput={(event) => oninput?.(Number((event.currentTarget as HTMLInputElement).value))}
	/>
</label>

<style>
	.slider {
		display: block;
		width: 100%;
	}

	input {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 0.35rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.16);
		outline: none;
	}

	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--accent-strong);
		border: 2px solid rgba(16, 32, 24, 0.4);
		box-shadow: 0 0 12px rgba(157, 204, 176, 0.6);
	}

	input::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--accent-strong);
		border: 2px solid rgba(16, 32, 24, 0.4);
	}
</style>
