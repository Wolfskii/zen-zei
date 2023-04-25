<script lang="ts">
	export let soundName: string
	export let youTubeUrl: string

	let isPlaying = false
	let player: any // YouTube player object

	function onYouTubeIframeAPIReady() {
		player = new window.YT.Player('player', {
			height: '390',
			width: '640',
			videoId: getYouTubeVideoId(),
			host: 'https://www.youtube-nocookie.com',
			playerVars: {
				playsinline: 1,
				origin: window.location.host
			},
			events: {
				onReady: onPlayerReady,
				onStateChange: onPlayerStateChange
			}
		})
	}

	function onPlayerReady(event: any) {
		player.playVideo()
		isPlaying = true
	}

	function onPlayerStateChange(event: any) {
		if (event.data === window.YT.PlayerState.PLAYING) {
			isPlaying = true
		} else {
			isPlaying = false
		}
	}

	function getYouTubeVideoId() {
		const videoIdMatch = youTubeUrl.match(/(?:\/|v=)([a-zA-Z0-9_-]{11}).*/)
		if (videoIdMatch) {
			return videoIdMatch[1]
		}
		throw new Error('Invalid YouTube URL')
	}

	$: if (youTubeUrl && typeof window !== 'undefined' && !window.YT) {
		const tag = document.createElement('script')
		tag.src = 'https://www.youtube.com/iframe_api'

		const firstScriptTag = document.getElementsByTagName('script')[0]
		firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

		window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady
	} else if (youTubeUrl && typeof window !== 'undefined' && window.YT) {
		onYouTubeIframeAPIReady()
	}

	function togglePlay(event: any) {
		if (isPlaying) {
			player.pauseVideo()
		} else {
			player.playVideo()
		}
		isPlaying = !isPlaying
	}
</script>

<div class="sound-tile">
	<h3>{soundName}</h3>
	{#if youTubeUrl}
		<div id="player" />
	{:else}
		<slot />
	{/if}

	<button on:click={togglePlay}>
		{#if isPlaying}
			Pause
		{:else}
			Play
		{/if}
	</button>
</div>

<style>
	.sound-tile {
		background-color: rgba(0, 0, 0, 0.2);
		aspect-ratio: 1/1;
		padding: 2rem;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		text-align: center;
	}
</style>
