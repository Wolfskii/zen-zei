<script lang="ts">
	import { Pause } from '@lucide/svelte'
	import { mix } from '$lib/audio/mix.svelte'
	import type { Sound } from '$lib/types'
	import EmptyState from './EmptyState.svelte'
	import Icon from './ui/Icon.svelte'
	import Slider from './ui/Slider.svelte'

	let { sounds }: { sounds: Sound[] } = $props()

	const playing = $derived(
		Object.entries(mix.channels)
			.filter(([, channel]) => channel.playing)
			.map(([id]) => sounds.find((sound) => sound.id === id))
			.filter((sound): sound is Sound => !!sound)
	)
</script>

{#if playing.length === 0}
	<EmptyState title="Listening" body="Press 1–4 for a scene, R to shuffle, or L for the library." />
{:else}
	<div class="layers">
		{#each playing as sound (sound.id)}
			<article class="layer glass" data-cat={sound.category.slug}>
				<div class="art">
					{#if sound.coverUrl}
						<img src={sound.coverUrl} alt="" />
					{:else}
						<Icon name={sound.icon ?? sound.category.icon} size={40} />
					{/if}
					<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
				</div>
				<div class="meta">
					<p>{sound.category.name}</p>
					<h3>{sound.name}</h3>
					<div class="vol">
						<Slider label={`${sound.name} volume`} value={mix.channels[sound.id]?.volume ?? 1} oninput={(value) => mix.setVolume(sound.id, value)} />
						<span>{Math.round((mix.channels[sound.id]?.volume ?? 1) * 100)}</span>
					</div>
				</div>
				<button type="button" class="pause" aria-label={`Pause ${sound.name}`} onclick={() => mix.pause(sound.id)}>
					<Pause size={16} fill="currentColor" />
				</button>
			</article>
		{/each}
	</div>
{/if}

<style>
	.layers {
		display: grid;
		gap: 0.85rem;
		margin-top: 0.4rem;
	}

	@media (min-width: 720px) {
		.layers {
			grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		}
	}

	.layer {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0.85rem;
		align-items: center;
		padding: 1rem;
		border-radius: 1.35rem;
		--tint: var(--cat-nature);
		animation: glow 5s ease-in-out infinite;
	}

	.layer[data-cat='asmr'] {
		--tint: var(--cat-asmr);
	}
	.layer[data-cat='background'] {
		--tint: var(--cat-background);
	}
	.layer[data-cat='ambient'] {
		--tint: var(--cat-ambient);
	}

	@keyframes glow {
		0%,
		100% {
			box-shadow:
				var(--shadow),
				0 0 0 1px rgba(var(--tint), 0.28),
				0 0 28px rgba(var(--tint), 0.16);
		}
		50% {
			box-shadow:
				var(--shadow),
				0 0 0 1px rgba(var(--tint), 0.55),
				0 0 48px rgba(var(--tint), 0.28);
		}
	}

	.art {
		position: relative;
		width: 5.2rem;
		height: 5.2rem;
		border-radius: 1.1rem;
		overflow: hidden;
		display: grid;
		place-items: center;
		background: radial-gradient(circle at 30% 20%, rgba(var(--tint), 0.35), #0b1512 70%);
		color: rgb(var(--tint));
	}

	.art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.eq {
		position: absolute;
		bottom: 0.4rem;
		display: flex;
		align-items: flex-end;
		gap: 0.16rem;
		height: 0.85rem;
	}

	.eq i {
		display: block;
		width: 0.18rem;
		height: 100%;
		border-radius: 99px;
		background: rgb(var(--tint));
		transform-origin: bottom;
		animation: eq 0.9s ease-in-out infinite;
	}

	.eq i:nth-child(2) {
		animation-delay: 0.18s;
	}
	.eq i:nth-child(3) {
		animation-delay: 0.32s;
	}

	@keyframes eq {
		0%,
		100% {
			transform: scaleY(0.35);
		}
		50% {
			transform: scaleY(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.layer {
			animation: none;
		}
		.eq i {
			animation: none;
			transform: scaleY(0.65);
		}
	}

	.meta {
		min-width: 0;
		display: grid;
		gap: 0.2rem;
	}

	.meta p {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.62rem;
		color: var(--gold);
	}

	h3 {
		font-size: 1.35rem;
		line-height: 1.15;
	}

	.vol {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-top: 0.35rem;
	}

	.vol :global(.slider) {
		flex: 1;
		min-width: 0;
	}

	.vol span {
		min-width: 1.7rem;
		font-size: 0.72rem;
		color: var(--muted);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.pause {
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: rgba(8, 14, 16, 0.35);
		color: var(--text);
		display: grid;
		place-items: center;
	}
</style>
