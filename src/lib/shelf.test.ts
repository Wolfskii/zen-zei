import { beforeEach, describe, expect, it } from 'vitest'
import {
	addMix,
	addRecent,
	createList,
	listNameFromSounds,
	loadShelf,
	MAX_FAVORITES,
	MAX_RECENTS,
	mixNameFromLayers,
	parseShelfJson,
	pruneShelf,
	removeList,
	removeMix,
	removeRecent,
	keepRecent,
	renameList,
	renameMix,
	resolveList,
	resolveSavedMix,
	restoreShelf,
	SHELF_STORAGE_KEY,
	stringifyShelf,
	toggleFavorite,
	toggleSoundInList,
	type SavedMix
} from '$lib/shelf'
import type { Sound } from '$lib/types'

function mockStorage() {
	const store: Record<string, string> = {}
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: (key: string) => store[key] ?? null,
			setItem: (key: string, value: string) => {
				store[key] = String(value)
			},
			removeItem: (key: string) => {
				delete store[key]
			},
			clear: () => {
				for (const key of Object.keys(store)) delete store[key]
			}
		}
	})
	return store
}

function fakeSound(id: string, name = id): Sound {
	return {
		id,
		kind: 'file',
		name,
		description: '',
		category: { id: 'nature', slug: 'nature', name: 'Nature', icon: 'Trees', sortOrder: 1 },
		youtubeUrl: null,
		youtubeVideoId: null,
		audioRemoteUrl: null,
		icon: null,
		coverUrl: null,
		audioUrl: '/x',
		rating: { average: 0, count: 0, mine: null },
		createdAt: '2026-01-01'
	}
}

describe('mixNameFromLayers', () => {
	it('joins two names and summarizes longer stacks', () => {
		expect(mixNameFromLayers([])).toBe('Untitled mix')
		expect(mixNameFromLayers(['Rain'])).toBe('Rain')
		expect(mixNameFromLayers(['Rain', 'Thunder'])).toBe('Rain + Thunder')
		expect(mixNameFromLayers(['Rain', 'Thunder', 'Fireplace'])).toBe('Rain + 2 more')
	})
})

describe('listNameFromSounds', () => {
	it('uses untitled list when empty', () => {
		expect(listNameFromSounds([])).toBe('Untitled list')
		expect(listNameFromSounds(['Rain', 'Thunder'])).toBe('Rain + Thunder')
	})
})

describe('shelf', () => {
	let store: Record<string, string>

	beforeEach(() => {
		store = mockStorage()
	})

	it('toggles favourites on this device and reloads them', () => {
		toggleFavorite('rain')
		toggleFavorite('thunder')
		toggleFavorite('rain')
		expect(loadShelf().favorites).toEqual(['thunder'])
		expect(JSON.parse(store[SHELF_STORAGE_KEY]).favorites).toEqual(['thunder'])
	})

	it('caps favourites', () => {
		let shelf = loadShelf()
		for (let i = 0; i < MAX_FAVORITES + 8; i++) {
			shelf = toggleFavorite(`s${i}`, shelf)
		}
		expect(shelf.favorites).toHaveLength(MAX_FAVORITES)
		expect(shelf.favorites[0]).toBe(`s${MAX_FAVORITES + 7}`)
	})

	it('creates lists, toggles sounds, and drops missing catalog ids when resolving', () => {
		let shelf = createList('Night', ['a', 'b', 'a'])
		expect(shelf.lists[0].soundIds).toEqual(['a', 'b'])
		shelf = toggleSoundInList(shelf.lists[0].id, 'c', shelf)
		expect(shelf.lists[0].soundIds).toEqual(['a', 'b', 'c'])
		shelf = toggleSoundInList(shelf.lists[0].id, 'b', shelf)
		expect(shelf.lists[0].soundIds).toEqual(['a', 'c'])
		const resolved = resolveList(shelf.lists[0], [fakeSound('c', 'Crickets'), fakeSound('z', 'Gone')])
		expect(resolved.map((sound) => sound.id)).toEqual(['c'])
		shelf = removeList(shelf.lists[0].id, shelf)
		expect(shelf.lists).toEqual([])
	})

	it('saves mixes and ignores unknown layers on play', () => {
		const shelf = addMix({
			name: 'Storm',
			master: 0.8,
			layers: [
				{ id: 'rain', volume: 0.7 },
				{ id: 'missing', volume: 0.4 }
			]
		})
		expect(shelf.mixes[0].name).toBe('Storm')
		const layers = resolveSavedMix(shelf.mixes[0], [fakeSound('rain', 'Rain')])
		expect(layers).toEqual([{ sound: fakeSound('rain', 'Rain'), volume: 0.7 }])
		expect(removeMix(shelf.mixes[0].id, shelf).mixes).toEqual([])
	})

	it('renames lists and mixes', () => {
		let shelf = createList('Night', ['a'])
		shelf = addMix({ name: 'Storm', master: 1, layers: [{ id: 'rain', volume: 1 }] }, shelf)
		shelf = renameList(shelf.lists[0].id, '  Cabin stack  ', shelf)
		shelf = renameMix(shelf.mixes[0].id, '', shelf)
		expect(shelf.lists[0].name).toBe('Cabin stack')
		expect(shelf.mixes[0].name).toBe('Untitled mix')
	})

	it('migrates named mixes from the previous localStorage key', () => {
		const legacy: SavedMix[] = [
			{
				id: 'mix-1',
				name: 'Cabin',
				master: 0.9,
				layers: [{ id: 'fire', volume: 0.5 }],
				savedAt: 1
			}
		]
		store['zenzei:saved:v1'] = JSON.stringify(legacy)
		const shelf = loadShelf()
		expect(shelf.mixes[0].name).toBe('Cabin')
		expect(JSON.parse(store[SHELF_STORAGE_KEY]).mixes[0].name).toBe('Cabin')
	})

	it('prunes ids that left the catalog but keeps empty lists', () => {
		let shelf = toggleFavorite('gone')
		shelf = toggleFavorite('rain', shelf)
		shelf = createList('Keep', ['gone', 'rain'], shelf)
		shelf = createList('Empty soon', ['gone'], shelf)
		shelf = addMix({ name: 'Old', master: 1, layers: [{ id: 'gone', volume: 1 }] }, shelf)
		shelf = pruneShelf(['rain'], shelf)
		expect(shelf.favorites).toEqual(['rain'])
		expect(shelf.lists.find((item) => item.name === 'Keep')?.soundIds).toEqual(['rain'])
		expect(shelf.lists.find((item) => item.name === 'Empty soon')?.soundIds).toEqual([])
		expect(shelf.mixes).toEqual([])
	})

	it('keeps stacked recents, skips duplicates, and drops thin leftovers', () => {
		let shelf = addRecent({
			name: 'Storm',
			master: 1,
			layers: [
				{ id: 'rain', volume: 1 },
				{ id: 'thunder', volume: 0.72 }
			]
		})
		shelf = addRecent(
			{
				name: 'Storm',
				master: 1,
				layers: [
					{ id: 'rain', volume: 1 },
					{ id: 'thunder', volume: 0.72 }
				]
			},
			shelf
		)
		expect(shelf.recents).toHaveLength(1)
		shelf = addRecent(
			{
				name: 'Cabin',
				master: 0.9,
				layers: [
					{ id: 'fire', volume: 0.9 },
					{ id: 'rain', volume: 0.55 }
				]
			},
			shelf
		)
		expect(shelf.recents.map((item) => item.name)).toEqual(['Cabin', 'Storm'])
		shelf = pruneShelf(['rain'], shelf)
		expect(shelf.recents).toEqual([])
		expect(removeRecent(addRecent({ name: 'Keep', master: 1, layers: [{ id: 'a', volume: 1 }, { id: 'b', volume: 1 }] }).recents[0].id).recents).toEqual([])
		expect(MAX_RECENTS).toBe(8)
		let kept = addRecent({
			name: 'Storm',
			master: 1,
			layers: [
				{ id: 'rain', volume: 1 },
				{ id: 'thunder', volume: 0.72 }
			]
		})
		kept = keepRecent(kept.recents[0].id, kept)
		expect(kept.mixes).toHaveLength(1)
		expect(kept.mixes[0].name).toBe('Storm')
		expect(keepRecent(kept.recents[0].id, kept).mixes).toHaveLength(1)
	})

	it('round-trips a backup and rejects junk', () => {
		toggleFavorite('rain')
		createList('Night', ['rain'])
		const json = stringifyShelf(loadShelf())
		expect(parseShelfJson(json)?.favorites).toEqual(['rain'])
		expect(parseShelfJson('{not json')).toBeNull()
		expect(parseShelfJson('[]')).toBeNull()
		expect(parseShelfJson('{"favorites":["thunder"],"mixes":[],"lists":[]}')?.favorites).toEqual(['thunder'])
		store[SHELF_STORAGE_KEY] = json
		const restored = restoreShelf('{"favorites":["cabin"],"mixes":[],"lists":[]}')
		expect(restored?.favorites).toEqual(['cabin'])
		expect(loadShelf().favorites).toEqual(['cabin'])
		expect(restoreShelf('nope')).toBeNull()
		expect(loadShelf().favorites).toEqual(['cabin'])
	})
})
