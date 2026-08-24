<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()
</script>

<span class="badge">
	{@render children()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background: rgba(157, 204, 176, 0.16);
		border: 1px solid rgba(157, 204, 176, 0.28);
		color: var(--accent-strong);
	}
</style>
