<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children, tone }: { children: Snippet; tone?: string } = $props()
</script>

<span class="badge" data-tone={tone}>
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
		background: rgba(var(--tint, var(--cat-nature)), 0.16);
		border: 1px solid rgba(var(--tint, var(--cat-nature)), 0.28);
		color: rgb(var(--tint, var(--cat-nature)));
	}

	.badge[data-tone='nature'] {
		--tint: var(--cat-nature);
	}
	.badge[data-tone='asmr'] {
		--tint: var(--cat-asmr);
	}
	.badge[data-tone='background'] {
		--tint: var(--cat-background);
	}
	.badge[data-tone='ambient'] {
		--tint: var(--cat-ambient);
	}
</style>
