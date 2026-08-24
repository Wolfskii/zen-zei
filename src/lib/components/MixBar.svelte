<script lang="ts">
	import { Pause, Volume2 } from '@lucide/svelte'
	import { mix } from '$lib/audio/mix.svelte'
	import type { Sound } from '$lib/types'
	import Button from './ui/Button.svelte'
	import Slider from './ui/Slider.svelte'

	let { sounds }: { sounds: Sound[] } = $props()

	const playing = $derived(
		Object.entries(mix.channels)
			.filter(([, channel]) => channel.playing)
			.map(([id]) => sounds.find((sound) => sound.id === id))
			.filter((sound): sound is Sound => !!sound)
	)
</script>

<aside class="bar glass">
	<div class="now">
		{#if mix.pendingResume}
			<p>Resume your last mix?</p>
			<Button variant="primary" onclick={() => mix.resumeMix(sounds)}>Resume</Button>
			<Button variant="ghost" onclick={() => mix.dismissResume()}>Not now</Button>
		{:else if playing.length === 0}
			<p>Quiet. Start any square — they layer together.</p>
		{:else}
			<div class="chips">
				{#each playing as sound}
					<button type="button" class="chip" onclick={() => mix.pause(sound.id)}>
						<Pause size={12} />
						{sound.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>
	<div class="master">
		<Volume2 size={16} />
		<Slider label="Master volume" value={mix.masterVolume} oninput={(value) => mix.setMasterVolume(value)} />
		<Button variant="glass" onclick={() => mix.stopAll()}>Stop all</Button>
	</div>
</aside>

<style>
	.bar {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: 0.85rem;
		width: min(1120px, calc(100% - 2rem));
		z-index: 10;
		display: grid;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		border-radius: 1.4rem;
	}

	@media (min-width: 720px) {
		.bar {
			grid-template-columns: 1fr auto;
			align-items: center;
		}
	}

	.now {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.55rem;
		color: var(--muted);
		font-size: 0.92rem;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--glass-border);
		background: rgba(157, 204, 176, 0.12);
		color: var(--accent-strong);
	}

	.master {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 16rem;
	}
</style>
