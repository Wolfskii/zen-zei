<script lang="ts">
	import { SOUND_ICONS, isSoundIconName } from '$lib/icons'

	let {
		name,
		size = 20,
		strokeWidth = 1.75
	}: {
		name: string
		size?: number
		strokeWidth?: number
	} = $props()

	const Cmp = $derived(isSoundIconName(name) ? SOUND_ICONS[name] : SOUND_ICONS.AudioLines)
</script>

<Cmp {size} {strokeWidth} />
