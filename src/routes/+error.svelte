<script lang="ts">
	let { error } = $props<{ error?: { message?: string } }>()
</script>

<section class="panel glass">
	<h1>Something broke the quiet.</h1>
	<p>{error?.message ?? 'Unknown error'}</p>
	<a href="/">Back to the mixer</a>
</section>

<style>
	.panel {
		margin-top: 4rem;
		padding: 2rem;
		border-radius: var(--radius);
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	p {
		color: var(--muted);
		margin-bottom: 1rem;
	}
</style>
