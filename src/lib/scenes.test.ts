import { describe, expect, it } from 'vitest'
import { layersForSceneIndex, resolveScene, SCENES, sceneIsActive, sceneIsReady } from '$lib/scenes'
import type { Sound } from '$lib/types'

function fake(name: string, id: string): Sound {
	return {
		id,
		kind: 'file',
		name,
		description: '',
		category: { id: 'c', slug: 'nature', name: 'Nature', icon: 'Trees', sortOrder: 1 },
		youtubeUrl: null,
		youtubeVideoId: null,
		audioRemoteUrl: null,
		icon: null,
		coverUrl: null,
		audioUrl: '/x',
		rating: { average: 0, count: 0, mine: null },
		createdAt: ''
	}
}

const rain = fake('Rain', '00000000-0000-4000-8000-000000000011')
const thunder = fake('Thunder', '00000000-0000-4000-8000-000000000012')

describe('scenes', () => {
	it('resolves Storm when rain and thunder exist', () => {
		const storm = SCENES.find((scene) => scene.id === 'storm')!
		expect(sceneIsReady(storm, [rain, thunder])).toBe(true)
		expect(resolveScene(storm, [rain, thunder]).map((layer) => layer.sound.name)).toEqual(['Rain', 'Thunder'])
	})

	it('hides Focus without lofi', () => {
		const focus = SCENES.find((scene) => scene.id === 'focus')!
		expect(sceneIsReady(focus, [rain, thunder])).toBe(false)
	})

	it('is active only when every layer is playing', () => {
		const storm = SCENES.find((scene) => scene.id === 'storm')!
		expect(sceneIsActive(storm, [rain, thunder], [rain.id])).toBe(false)
		expect(sceneIsActive(storm, [rain, thunder], [rain.id, thunder.id])).toBe(true)
	})

	it('resolves key 1 as Storm when the catalog has both layers', () => {
		expect(layersForSceneIndex(0, [rain, thunder])?.map((layer) => layer.sound.name)).toEqual(['Rain', 'Thunder'])
		expect(layersForSceneIndex(3, [rain, thunder])).toBeNull()
		expect(layersForSceneIndex(9, [rain, thunder])).toBeNull()
	})
})
