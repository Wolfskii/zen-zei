<script lang="ts">
	import { Waves } from '@lucide/svelte'

	let { title, body }: { title: string; body: string } = $props()
</script>

<div class="empty glass">
	<Waves size={36} />
	<h2>{title}</h2>
	<p>{body}</p>
</div>

<style>
	.empty {
		padding: 3rem 1.5rem;
		border-radius: var(--radius);
		text-align: center;
		display: grid;
		justify-items: center;
		gap: 0.6rem;
		color: var(--muted);
	}

	h2 {
		color: var(--text);
	}
</style>
