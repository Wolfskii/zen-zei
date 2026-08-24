<script lang="ts">
	import { Pause, Play, Trash2 } from '@lucide/svelte'
	import { mix } from '$lib/audio/mix.svelte'
	import type { Sound } from '$lib/types'
	import Badge from './ui/Badge.svelte'
	import Icon from './ui/Icon.svelte'
	import IconButton from './ui/IconButton.svelte'
	import Slider from './ui/Slider.svelte'
	import StarRating from './ui/StarRating.svelte'

	let {
		sound,
		canDelete = false,
		onvote,
		ondelete
	}: {
		sound: Sound
		canDelete?: boolean
		onvote: (stars: number) => void
		ondelete?: () => void
	} = $props()

	const playing = $derived(mix.channels[sound.id]?.playing === true)
	const volume = $derived(mix.channels[sound.id]?.volume ?? 0.72)
	const error = $derived(mix.errors[sound.id] ?? '')
</script>

<article class="card" class:playing>
	<div class="cover">
		{#if sound.coverUrl}
			<img src={sound.coverUrl} alt="" />
		{:else}
			<div class="fallback">
				<Icon name={sound.icon ?? sound.category.icon} size={48} />
			</div>
		{/if}
		<div class="veil"></div>
		<button class="play" type="button" aria-label={playing ? `Stop ${sound.name}` : `Play ${sound.name}`} onclick={() => mix.toggle(sound)}>
			{#if playing}
				<Pause size={28} fill="currentColor" />
			{:else}
				<Play size={28} fill="currentColor" />
			{/if}
		</button>
	</div>

	<div class="body">
		<div class="top">
			<Badge>{sound.category.name}</Badge>
			{#if canDelete}
				<IconButton label="Delete sound" onclick={() => ondelete?.()}>
					<Trash2 size={16} />
				</IconButton>
			{/if}
		</div>
		<h3>{sound.name}</h3>
		<p>{sound.description || 'No description yet.'}</p>
		<StarRating value={sound.rating.average} count={sound.rating.count} mine={sound.rating.mine} interactive onchange={onvote} />
		<div class="vol">
			<Slider label={`${sound.name} volume`} value={volume} oninput={(value) => mix.setVolume(sound.id, value)} />
		</div>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</div>
</article>

<style>
	.card {
		display: grid;
		grid-template-rows: 1fr auto;
		aspect-ratio: 1 / 1;
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--glass-border);
		background: var(--glass);
		box-shadow: var(--shadow);
		backdrop-filter: blur(22px) saturate(160%);
		position: relative;
	}

	.card.playing {
		box-shadow:
			var(--shadow),
			0 0 0 1px rgba(157, 204, 176, 0.45),
			0 0 42px rgba(157, 204, 176, 0.22);
	}

	.cover {
		position: relative;
		min-height: 0;
		background: #0b1512;
	}

	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.fallback {
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--accent-strong);
		background: radial-gradient(circle at 30% 20%, rgba(157, 204, 176, 0.25), transparent 55%);
	}

	.veil {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 20%, rgba(6, 12, 14, 0.88));
	}

	.play {
		position: absolute;
		inset: auto 0 42% 0;
		margin: 0 auto;
		width: 3.4rem;
		height: 3.4rem;
		border-radius: 999px;
		border: 1px solid var(--glass-highlight);
		background: rgba(255, 255, 255, 0.16);
		color: white;
		display: grid;
		place-items: center;
		backdrop-filter: blur(10px);
	}

	.body {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.85rem 0.95rem 0.95rem;
		display: grid;
		gap: 0.35rem;
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h3 {
		font-size: 1.2rem;
		line-height: 1.1;
	}

	p {
		color: var(--muted);
		font-size: 0.82rem;
		line-height: 1.35;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.error {
		color: var(--danger);
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.vol {
		margin-top: 0.15rem;
	}
</style>
