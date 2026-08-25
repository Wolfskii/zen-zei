import type { Sound } from '$lib/types'

export const SHELF_STORAGE_KEY = 'zenzei:shelf:v1'
const LEGACY_MIXES_KEY = 'zenzei:saved:v1'

export const MAX_FAVORITES = 64
export const MAX_MIXES = 24
export const MAX_LISTS = 24
export const MAX_LIST_SOUNDS = 32
export const MAX_RECENTS = 8

export type SavedMix = {
	id: string
	name: string
	master: number
	layers: { id: string; volume: number }[]
	savedAt: number
}

export type SavedList = {
	id: string
	name: string
	soundIds: string[]
	savedAt: number
}

export type Shelf = {
	favorites: string[]
	mixes: SavedMix[]
	lists: SavedList[]
	recents: SavedMix[]
}

export function emptyShelf(): Shelf {
	return { favorites: [], mixes: [], lists: [], recents: [] }
}

export function mixNameFromLayers(names: string[]): string {
	const clean = names.map((name) => name.trim()).filter(Boolean)
	if (!clean.length) return 'Untitled mix'
	if (clean.length === 1) return clean[0]
	if (clean.length === 2) return `${clean[0]} + ${clean[1]}`
	return `${clean[0]} + ${clean.length - 1} more`
}

export function listNameFromSounds(names: string[]): string {
	const mix = mixNameFromLayers(names)
	return mix === 'Untitled mix' ? 'Untitled list' : mix
}

export function loadShelf(): Shelf {
	if (typeof localStorage === 'undefined') return emptyShelf()
	try {
		const raw = localStorage.getItem(SHELF_STORAGE_KEY)
		if (raw) return normalizeShelf(JSON.parse(raw))
	} catch {
		// fall through to legacy
	}
	const migrated = migrateLegacyMixes()
	if (migrated.mixes.length) persistShelf(migrated)
	return migrated
}

export function persistShelf(shelf: Shelf): void {
	if (typeof localStorage === 'undefined') return
	localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(normalizeShelf(shelf)))
}

export function stringifyShelf(shelf: Shelf): string {
	return JSON.stringify(normalizeShelf(shelf), null, 2)
}

export function parseShelfJson(text: string): Shelf | null {
	try {
		const parsed = JSON.parse(text) as unknown
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
		return normalizeShelf(parsed)
	} catch {
		return null
	}
}

export function restoreShelf(text: string): Shelf | null {
	const next = parseShelfJson(text)
	if (!next) return null
	persistShelf(next)
	return next
}

export function pruneShelf(knownIds: Iterable<string>, shelf = loadShelf()): Shelf {
	const known = knownIds instanceof Set ? knownIds : new Set(knownIds)
	const next: Shelf = {
		favorites: shelf.favorites.filter((id) => known.has(id)),
		mixes: shelf.mixes
			.map((mix) => ({ ...mix, layers: mix.layers.filter((layer) => known.has(layer.id)) }))
			.filter((mix) => mix.layers.length > 0),
		lists: shelf.lists.map((list) => ({
			...list,
			soundIds: list.soundIds.filter((id) => known.has(id))
		})),
		recents: shelf.recents
			.map((mix) => ({ ...mix, layers: mix.layers.filter((layer) => known.has(layer.id)) }))
			.filter((mix) => mix.layers.length > 1)
	}
	if (JSON.stringify(next) !== JSON.stringify(shelf)) persistShelf(next)
	return next
}

export function mixFingerprint(mix: Pick<SavedMix, 'master' | 'layers'>): string {
	return `${mix.master.toFixed(2)}:${mix.layers.map((layer) => `${layer.id}:${layer.volume.toFixed(2)}`).join(',')}`
}

export function addRecent(mix: Omit<SavedMix, 'id' | 'savedAt'> & { id?: string }, shelf = loadShelf()): Shelf {
	const layers = uniqueLayers(mix.layers)
	if (layers.length < 2) return shelf
	const nextMix: SavedMix = {
		id: mix.id ?? crypto.randomUUID(),
		name: mix.name.trim() || 'Untitled mix',
		master: clamp01(mix.master),
		layers,
		savedAt: Date.now()
	}
	const fp = mixFingerprint(nextMix)
	if (shelf.recents[0] && mixFingerprint(shelf.recents[0]) === fp) return shelf
	const next: Shelf = {
		...shelf,
		recents: [nextMix, ...shelf.recents.filter((item) => mixFingerprint(item) !== fp)].slice(0, MAX_RECENTS)
	}
	persistShelf(next)
	return next
}

export function removeRecent(id: string, shelf = loadShelf()): Shelf {
	const next: Shelf = { ...shelf, recents: shelf.recents.filter((item) => item.id !== id) }
	persistShelf(next)
	return next
}

/** Copy a recent stack into named mixes. Same fingerprint is a no-op. */
export function keepRecent(id: string, shelf = loadShelf()): Shelf {
	const recent = shelf.recents.find((item) => item.id === id)
	if (!recent?.layers.length) return shelf
	const fp = mixFingerprint(recent)
	if (shelf.mixes.some((item) => mixFingerprint(item) === fp)) return shelf
	return addMix({ name: recent.name, master: recent.master, layers: recent.layers }, shelf)
}

export function toggleFavorite(soundId: string, shelf = loadShelf()): Shelf {
	const id = soundId.trim()
	if (!id) return shelf
	const has = shelf.favorites.includes(id)
	const next: Shelf = {
		...shelf,
		favorites: has ? shelf.favorites.filter((item) => item !== id) : [id, ...shelf.favorites.filter((item) => item !== id)].slice(0, MAX_FAVORITES)
	}
	persistShelf(next)
	return next
}

export function addMix(mix: Omit<SavedMix, 'id' | 'savedAt'> & { id?: string }, shelf = loadShelf()): Shelf {
	const nextMix: SavedMix = {
		id: mix.id ?? crypto.randomUUID(),
		name: mix.name.trim() || 'Untitled mix',
		master: clamp01(mix.master),
		layers: uniqueLayers(mix.layers),
		savedAt: Date.now()
	}
	if (!nextMix.layers.length) return shelf
	const next: Shelf = {
		...shelf,
		mixes: [nextMix, ...shelf.mixes.filter((item) => item.id !== nextMix.id)].slice(0, MAX_MIXES)
	}
	persistShelf(next)
	return next
}

export function removeMix(id: string, shelf = loadShelf()): Shelf {
	const next: Shelf = { ...shelf, mixes: shelf.mixes.filter((item) => item.id !== id) }
	persistShelf(next)
	return next
}

export function renameMix(id: string, name: string, shelf = loadShelf()): Shelf {
	const label = name.trim() || 'Untitled mix'
	const next: Shelf = {
		...shelf,
		mixes: shelf.mixes.map((item) => (item.id === id ? { ...item, name: label, savedAt: Date.now() } : item))
	}
	persistShelf(next)
	return next
}

export function createList(name: string, soundIds: string[] = [], shelf = loadShelf()): Shelf {
	const list: SavedList = {
		id: crypto.randomUUID(),
		name: name.trim() || 'Untitled list',
		soundIds: uniqueIds(soundIds).slice(0, MAX_LIST_SOUNDS),
		savedAt: Date.now()
	}
	const next: Shelf = {
		...shelf,
		lists: [list, ...shelf.lists].slice(0, MAX_LISTS)
	}
	persistShelf(next)
	return next
}

export function toggleSoundInList(listId: string, soundId: string, shelf = loadShelf()): Shelf {
	const id = soundId.trim()
	if (!id) return shelf
	const current = shelf.lists.find((item) => item.id === listId)
	if (!current) return shelf
	const has = current.soundIds.includes(id)
	const soundIds = has ? current.soundIds.filter((item) => item !== id) : [...current.soundIds, id].slice(0, MAX_LIST_SOUNDS)
	const list: SavedList = { ...current, soundIds, savedAt: Date.now() }
	const next: Shelf = {
		...shelf,
		lists: [list, ...shelf.lists.filter((item) => item.id !== listId)]
	}
	persistShelf(next)
	return next
}

export function removeList(id: string, shelf = loadShelf()): Shelf {
	const next: Shelf = { ...shelf, lists: shelf.lists.filter((item) => item.id !== id) }
	persistShelf(next)
	return next
}

export function renameList(id: string, name: string, shelf = loadShelf()): Shelf {
	const label = name.trim() || 'Untitled list'
	const next: Shelf = {
		...shelf,
		lists: shelf.lists.map((item) => (item.id === id ? { ...item, name: label, savedAt: Date.now() } : item))
	}
	persistShelf(next)
	return next
}

export function resolveSavedMix(saved: SavedMix, sounds: Sound[]): { sound: Sound; volume: number }[] {
	const layers: { sound: Sound; volume: number }[] = []
	for (const layer of saved.layers) {
		const sound = sounds.find((item) => item.id === layer.id)
		if (sound) layers.push({ sound, volume: layer.volume })
	}
	return layers
}

export function resolveList(list: SavedList, sounds: Sound[]): Sound[] {
	const found: Sound[] = []
	for (const id of list.soundIds) {
		const sound = sounds.find((item) => item.id === id)
		if (sound) found.push(sound)
	}
	return found
}

function migrateLegacyMixes(): Shelf {
	const shelf = emptyShelf()
	if (typeof localStorage === 'undefined') return shelf
	try {
		const raw = localStorage.getItem(LEGACY_MIXES_KEY)
		if (!raw) return shelf
		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return shelf
		shelf.mixes = parsed.map(asMix).filter((item): item is SavedMix => !!item).slice(0, MAX_MIXES)
	} catch {
		return emptyShelf()
	}
	return shelf
}

function normalizeShelf(raw: unknown): Shelf {
	if (!raw || typeof raw !== 'object') return emptyShelf()
	const data = raw as Record<string, unknown>
	const mixesSource = Array.isArray(data.mixes) ? data.mixes : []
	const listsSource = Array.isArray(data.lists) ? data.lists : []
	const recentsSource = Array.isArray(data.recents) ? data.recents : []
	return {
		favorites: uniqueIds(asStringArray(data.favorites)).slice(0, MAX_FAVORITES),
		mixes: mixesSource.map(asMix).filter((item): item is SavedMix => !!item).slice(0, MAX_MIXES),
		lists: listsSource.map(asList).filter((item): item is SavedList => !!item).slice(0, MAX_LISTS),
		recents: recentsSource.map(asMix).filter((item): item is SavedMix => !!item).slice(0, MAX_RECENTS)
	}
}

function asMix(item: unknown): SavedMix | null {
	if (!item || typeof item !== 'object') return null
	const raw = item as Record<string, unknown>
	if (typeof raw.id !== 'string' || !raw.id) return null
	if (typeof raw.name !== 'string') return null
	if (!Array.isArray(raw.layers)) return null
	const layers = uniqueLayers(
		raw.layers.flatMap((layer) => {
			if (!layer || typeof layer !== 'object') return []
			const row = layer as { id?: unknown; volume?: unknown }
			if (typeof row.id !== 'string' || !row.id) return []
			return [{ id: row.id, volume: typeof row.volume === 'number' ? clamp01(row.volume) : 1 }]
		})
	)
	if (!layers.length) return null
	return {
		id: raw.id,
		name: raw.name,
		master: typeof raw.master === 'number' ? clamp01(raw.master) : 1,
		layers,
		savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : 0
	}
}

function asList(item: unknown): SavedList | null {
	if (!item || typeof item !== 'object') return null
	const raw = item as Record<string, unknown>
	if (typeof raw.id !== 'string' || !raw.id) return null
	if (typeof raw.name !== 'string') return null
	return {
		id: raw.id,
		name: raw.name,
		soundIds: uniqueIds(asStringArray(raw.soundIds)).slice(0, MAX_LIST_SOUNDS),
		savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : 0
	}
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return []
	return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function uniqueIds(ids: string[]): string[] {
	const seen = new Set<string>()
	const out: string[] = []
	for (const id of ids) {
		const trimmed = id.trim()
		if (!trimmed || seen.has(trimmed)) continue
		seen.add(trimmed)
		out.push(trimmed)
	}
	return out
}

function uniqueLayers(layers: { id: string; volume: number }[]): { id: string; volume: number }[] {
	const seen = new Set<string>()
	const out: { id: string; volume: number }[] = []
	for (const layer of layers) {
		const id = layer.id.trim()
		if (!id || seen.has(id)) continue
		seen.add(id)
		out.push({ id, volume: clamp01(layer.volume) })
	}
	return out
}

function clamp01(value: number): number {
	if (!Number.isFinite(value)) return 1
	return Math.min(1, Math.max(0, value))
}
