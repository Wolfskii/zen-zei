import { describe, expect, it } from 'vitest'
import { companionLayer, evenLevel, masterMood, pinPlaying, sortSounds, surpriseLayers, soundKindLabel } from '$lib/library'
import type { Sound } from '$lib/types'

function fake(name: string, id: string, slug: string, average: number, createdAt: string): Sound {
	return {
		id,
		kind: 'file',
		name,
		description: '',
		category: { id: slug, slug, name: slug, icon: 'Trees', sortOrder: 1 },
		youtubeUrl: null,
		youtubeVideoId: null,
		audioRemoteUrl: null,
		icon: null,
		coverUrl: null,
		audioUrl: '/x',
		rating: { average, count: average > 0 ? 2 : 0, mine: null },
		createdAt
	}
}

const rain = fake('Rain', 'a', 'nature', 5, '2024-01-01')
const thunder = fake('Thunder', 'b', 'nature', 2, '2026-01-01')
const lofi = fake('Lofi radio', 'c', 'background', 4, '2025-06-01')

describe('soundKindLabel', () => {
	it('names catalog sources', () => {
		expect(soundKindLabel('youtube')).toBe('YouTube')
		expect(soundKindLabel('file')).toBe('File')
		expect(soundKindLabel('url')).toBe('Link')
	})
})

describe('sortSounds', () => {
	it('orders by rating, name, and recency', () => {
		expect(sortSounds([thunder, rain, lofi], 'loved').map((sound) => sound.name)).toEqual(['Rain', 'Lofi radio', 'Thunder'])
		expect(sortSounds([thunder, rain, lofi], 'name').map((sound) => sound.name)).toEqual(['Lofi radio', 'Rain', 'Thunder'])
		expect(sortSounds([rain, lofi, thunder], 'new').map((sound) => sound.name)).toEqual(['Thunder', 'Lofi radio', 'Rain'])
	})
})

describe('pinPlaying', () => {
	it('keeps mix order at the front and leaves the rest sorted as given', () => {
		expect(pinPlaying([rain, thunder, lofi], []).map((sound) => sound.id)).toEqual(['a', 'b', 'c'])
		expect(pinPlaying([rain, thunder, lofi], ['c', 'a']).map((sound) => sound.id)).toEqual(['c', 'a', 'b'])
		expect(pinPlaying([rain, thunder, lofi], ['missing', 'b']).map((sound) => sound.id)).toEqual(['b', 'a', 'c'])
	})
})

describe('surpriseLayers', () => {
	it('returns unique layers with a seeded rng', () => {
		let i = 0
		const seq = [0.1, 0.8, 0.2, 0.9, 0.3, 0.4, 0.5, 0.6]
		const random = () => seq[i++ % seq.length]
		const layers = surpriseLayers([rain, thunder, lofi], random)
		expect(layers.length).toBeGreaterThanOrEqual(2)
		expect(new Set(layers.map((layer) => layer.sound.id)).size).toBe(layers.length)
		for (const layer of layers) {
			expect(layer.volume).toBeGreaterThan(0)
			expect(layer.volume).toBeLessThanOrEqual(1)
		}
	})
})

describe('evenLevel', () => {
	it('averages stacked volumes', () => {
		expect(evenLevel([])).toBe(1)
		expect(evenLevel([1, 0.5])).toBe(0.75)
		expect(evenLevel([0.72, 1])).toBe(0.86)
	})
})

describe('masterMood', () => {
	it('snaps hush, room, and full', () => {
		expect(masterMood(0.32)).toBe('hush')
		expect(masterMood(0.68)).toBe('room')
		expect(masterMood(1)).toBe('full')
		expect(masterMood(0.5)).toBeNull()
	})
})

describe('companionLayer', () => {
	it('prefers a different category and skips playing ids', () => {
		let i = 0
		const random = () => [0.1, 0.2, 0.3][i++ % 3]
		const layer = companionLayer([rain, thunder, lofi], ['a'], random)
		expect(layer?.sound.id).toBe('c')
		expect(layer?.volume).toBeGreaterThan(0)
		expect(companionLayer([rain, thunder], ['a', 'b'])).toBeNull()
	})
})
