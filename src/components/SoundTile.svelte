<script lang="ts">
	import SoundTileLocalFile from './SoundTileLocalFile.svelte'
	import SoundTileYoutube from './SoundTileYoutube.svelte'

	export let soundName: string
	export let soundFile: string = ''
	export let youTubeUrl: string = ''
</script>

{#if soundFile !== ''}
	<SoundTileLocalFile {soundName} {soundFile} />
{:else if youTubeUrl !== ''}
	<SoundTileYoutube {soundName} {youTubeUrl} />
{/if}
