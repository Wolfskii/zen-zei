import type { Sound } from '$lib/types'

export type SceneLayer = {
	name: string
	volume: number
}

export type Scene = {
	id: string
	label: string
	hint: string
	layers: SceneLayer[]
}

/** Named starters matched against the live catalog by sound name (case-insensitive). */
export const SCENES: Scene[] = [
	{
		id: 'storm',
		label: 'Storm',
		hint: 'Rain + thunder',
		layers: [
			{ name: 'Rain', volume: 1 },
			{ name: 'Thunder', volume: 0.72 }
		]
	},
	{
		id: 'sleep',
		label: 'Sleep',
		hint: 'Rain + ocean',
		layers: [
			{ name: 'Rain', volume: 0.85 },
			{ name: 'Ocean waves', volume: 0.7 }
		]
	},
	{
		id: 'cabin',
		label: 'Cabin',
		hint: 'Fire + rain',
		layers: [
			{ name: 'Fireplace', volume: 0.9 },
			{ name: 'Rain', volume: 0.55 }
		]
	},
	{
		id: 'focus',
		label: 'Focus',
		hint: 'Lofi + rain',
		layers: [
			{ name: 'Lofi radio', volume: 0.62 },
			{ name: 'Rain', volume: 0.48 }
		]
	}
]

export type ResolvedLayer = {
	sound: Sound
	volume: number
}

export function resolveScene(scene: Scene, sounds: Sound[]): ResolvedLayer[] {
	const resolved: ResolvedLayer[] = []
	for (const layer of scene.layers) {
		const sound = sounds.find((item) => item.name.toLowerCase() === layer.name.toLowerCase())
		if (sound) resolved.push({ sound, volume: layer.volume })
	}
	return resolved
}

export function sceneIsReady(scene: Scene, sounds: Sound[]): boolean {
	return resolveScene(scene, sounds).length >= 2
}

/** 0-based index into `SCENES` (keys 1–4). Null when that starter is missing from the catalog. */
export function layersForSceneIndex(index: number, sounds: Sound[]): ResolvedLayer[] | null {
	const scene = SCENES[index]
	if (!scene || !sceneIsReady(scene, sounds)) return null
	return resolveScene(scene, sounds)
}

export function sceneIsActive(scene: Scene, sounds: Sound[], playingIds: string[]): boolean {
	const resolved = resolveScene(scene, sounds)
	if (resolved.length < scene.layers.length) return false
	return resolved.every((layer) => playingIds.includes(layer.sound.id))
}
