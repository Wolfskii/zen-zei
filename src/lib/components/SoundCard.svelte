<script lang="ts">
	import { Heart, ListPlus, Pause, Play, ExternalLink } from '@lucide/svelte'
	import { mix } from '$lib/audio/mix.svelte'
	import { soundKindLabel } from '$lib/library'
	import type { SavedList } from '$lib/shelf'
	import type { Sound } from '$lib/types'
	import { youtubeThumbnailUrl, youtubeWatchUrl } from '$lib/youtube'
	import ListMenu from './ListMenu.svelte'
	import Badge from './ui/Badge.svelte'
	import Icon from './ui/Icon.svelte'
	import Slider from './ui/Slider.svelte'
	import StarRating from './ui/StarRating.svelte'

	let {
		sound,
		favorited = false,
		lists = [],
		onvote,
		onfavorite,
		onToggleList,
		onCreateList
	}: {
		sound: Sound
		favorited?: boolean
		lists?: SavedList[]
		onvote: (stars: number) => void
		onfavorite?: () => void
		onToggleList?: (listId: string) => void
		onCreateList?: (name: string) => void
	} = $props()

	const playing = $derived(mix.channels[sound.id]?.playing === true)
	const volume = $derived(mix.channels[sound.id]?.volume ?? 1)
	const error = $derived(mix.errors[sound.id] ?? '')
	const listed = $derived(lists.some((list) => list.soundIds.includes(sound.id)))
	let listOpen = $state(false)
	let listWrap = $state<HTMLDivElement | undefined>(undefined)

	function onThumbError(event: Event) {
		const img = event.currentTarget as HTMLImageElement
		if (!sound.youtubeVideoId || img.dataset.fallback) return
		img.dataset.fallback = '1'
		img.src = youtubeThumbnailUrl(sound.youtubeVideoId, 'mq')
	}

	$effect(() => {
		if (!listOpen || typeof document === 'undefined') return
		function close(event: PointerEvent) {
			if (listWrap?.contains(event.target as Node)) return
			listOpen = false
		}
		document.addEventListener('pointerdown', close)
		return () => document.removeEventListener('pointerdown', close)
	})
</script>

<article class="card" class:playing class:picking={listOpen} data-cat={sound.category.slug}>
	<div class="media">
		{#if sound.coverUrl}
			<img class="fill" src={sound.coverUrl} alt="" onerror={onThumbError} />
		{:else}
			<div class="fill fallback">
				<Icon name={sound.icon ?? sound.category.icon} size={56} />
			</div>
		{/if}
	</div>

	<button class="hit" type="button" aria-label={playing ? `Pause ${sound.name}` : `Play ${sound.name}`} onclick={() => mix.toggle(sound)}>
		<span class="play">
			{#if playing}
				<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
				<Pause size={28} fill="currentColor" />
			{:else}
				<Play size={28} fill="currentColor" />
			{/if}
		</span>
	</button>

	<div class="pins">
		<button
			type="button"
			class="pin"
			class:on={favorited}
			aria-pressed={favorited}
			aria-label={favorited ? `Remove ${sound.name} from favourites` : `Save ${sound.name} to favourites`}
			onclick={() => onfavorite?.()}
		>
			<Heart size={15} fill={favorited ? 'currentColor' : 'none'} />
		</button>
		<div class="list-wrap" bind:this={listWrap}>
			<button
				type="button"
				class="pin"
				class:on={listed || listOpen}
				aria-expanded={listOpen}
				aria-label={`Add ${sound.name} to a list`}
				onclick={() => (listOpen = !listOpen)}
			>
				<ListPlus size={15} />
			</button>
			{#if listOpen}
				<ListMenu
					{lists}
					soundId={sound.id}
					onToggle={(id) => onToggleList?.(id)}
					onCreate={(name) => {
						onCreateList?.(name)
						listOpen = false
					}}
				/>
			{/if}
		</div>
		{#if sound.youtubeVideoId}
			<a class="pin" href={youtubeWatchUrl(sound.youtubeVideoId)} target="_blank" rel="noreferrer noopener" aria-label={`Open ${sound.name} on YouTube`}>
				<ExternalLink size={15} />
			</a>
		{/if}
	</div>

	<div class="body">
		<div class="top">
			<Badge tone={sound.category.slug}>{sound.category.name}</Badge>
			<span class="kind">{soundKindLabel(sound.kind)}</span>
		</div>
		<h3>{sound.name}</h3>
		<p>{sound.description || 'No description yet.'}</p>
		<StarRating value={sound.rating.average} count={sound.rating.count} mine={sound.rating.mine} interactive onchange={onvote} />
		<div class="vol">
			<Slider label={`${sound.name} volume`} value={volume} oninput={(value) => mix.setVolume(sound.id, value)} />
			<span>{Math.round(volume * 100)}</span>
		</div>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</div>
</article>

<style>
	.card {
		position: relative;
		aspect-ratio: 1 / 1;
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--glass-border);
		background: #0b1512;
		box-shadow: var(--shadow);
		--tint: var(--cat-nature);
	}

	.card.picking {
		overflow: visible;
		z-index: 6;
	}

	.media {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: inherit;
		pointer-events: none;
	}

	.card[data-cat='asmr'] {
		--tint: var(--cat-asmr);
	}
	.card[data-cat='background'] {
		--tint: var(--cat-background);
	}
	.card[data-cat='ambient'] {
		--tint: var(--cat-ambient);
	}

	.card.playing {
		box-shadow:
			var(--shadow),
			0 0 0 1px rgba(var(--tint), 0.5),
			0 0 42px rgba(var(--tint), 0.24);
		animation: glow 4.5s ease-in-out infinite;
	}

	@keyframes glow {
		0%,
		100% {
			box-shadow:
				var(--shadow),
				0 0 0 1px rgba(var(--tint), 0.4),
				0 0 28px rgba(var(--tint), 0.16);
		}
		50% {
			box-shadow:
				var(--shadow),
				0 0 0 1px rgba(var(--tint), 0.75),
				0 0 52px rgba(var(--tint), 0.34);
		}
	}

	.fill {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		pointer-events: none;
	}

	.fallback {
		display: grid;
		place-items: center;
		color: rgb(var(--tint));
		background: radial-gradient(circle at 30% 20%, rgba(var(--tint), 0.32), #0b1512 60%);
	}

	.hit {
		position: absolute;
		inset: 0 0 42% 0;
		z-index: 1;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.pins {
		position: absolute;
		top: 0.55rem;
		right: 0.55rem;
		z-index: 3;
		display: flex;
		gap: 0.3rem;
	}

	.list-wrap {
		position: relative;
	}

	.pin {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		border: 1px solid var(--glass-highlight);
		background: rgba(8, 14, 16, 0.5);
		color: white;
		display: grid;
		place-items: center;
		backdrop-filter: blur(10px);
		text-decoration: none;
	}

	.pin.on {
		color: var(--gold);
		border-color: rgba(228, 197, 138, 0.55);
	}

	.play {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 3.6rem;
		height: 3.6rem;
		border-radius: 999px;
		border: 1px solid var(--glass-highlight);
		background: rgba(8, 14, 16, 0.45);
		color: white;
		display: grid;
		place-items: center;
		backdrop-filter: blur(10px);
		pointer-events: none;
	}

	.eq {
		position: absolute;
		top: -0.55rem;
		display: flex;
		align-items: flex-end;
		gap: 0.14rem;
		height: 0.7rem;
	}

	.eq i {
		display: block;
		width: 0.16rem;
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
		.card.playing {
			animation: none;
		}
		.eq i {
			animation: none;
			transform: scaleY(0.65);
		}
	}

	.hit:hover .play,
	.card.playing .play {
		background: rgba(var(--tint), 0.42);
	}

	.body {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 2;
		padding: 2.2rem 0.9rem 0.9rem;
		display: grid;
		gap: 0.32rem;
		background: linear-gradient(180deg, transparent, rgba(6, 12, 14, 0.88) 38%);
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.45rem;
	}

	.kind {
		font-size: 0.68rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
		opacity: 0.85;
	}

	h3 {
		font-size: 1.15rem;
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
		line-clamp: 2;
		-webkit-line-clamp: 2;
	}

	.vol {
		margin-top: 0.15rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.vol :global(.slider) {
		flex: 1;
		min-width: 0;
	}

	.vol span {
		flex-shrink: 0;
		min-width: 1.7rem;
		font-size: 0.72rem;
		color: var(--muted);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>
