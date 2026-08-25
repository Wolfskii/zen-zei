import type { Sound, SoundKind } from '$lib/types'

export function soundKindLabel(kind: SoundKind): string {
	if (kind === 'youtube') return 'YouTube'
	if (kind === 'url') return 'Link'
	return 'File'
}

export type LibrarySort = 'loved' | 'name' | 'new'

export function sortSounds(sounds: Sound[], sort: LibrarySort): Sound[] {
	const copy = [...sounds]
	if (sort === 'name') {
		return copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
	}
	if (sort === 'new') {
		return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name))
	}
	return copy.sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count || a.name.localeCompare(b.name))
}

/** Keep currently playing layers at the front, in mix order, so volume stays in reach. */
export function pinPlaying(sounds: Sound[], playingIds: string[]): Sound[] {
	if (!playingIds.length) return sounds
	const rank = new Map(playingIds.map((id, index) => [id, index]))
	const on: Sound[] = []
	const off: Sound[] = []
	for (const sound of sounds) {
		if (rank.has(sound.id)) on.push(sound)
		else off.push(sound)
	}
	on.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
	return [...on, ...off]
}

/** Pick 2–3 layers from different categories when possible. */
export function surpriseLayers(sounds: Sound[], random: () => number = Math.random): { sound: Sound; volume: number }[] {
	if (sounds.length === 0) return []
	const byCat = new Map<string, Sound[]>()
	for (const sound of sounds) {
		const list = byCat.get(sound.category.slug) ?? []
		list.push(sound)
		byCat.set(sound.category.slug, list)
	}
	const slugs = [...byCat.keys()].sort(() => random() - 0.5)
	const picked: Sound[] = []
	for (const slug of slugs) {
		if (picked.length >= 3) break
		const pool = byCat.get(slug) ?? []
		const choice = pool[Math.floor(random() * pool.length)]
		if (choice && !picked.some((item) => item.id === choice.id)) picked.push(choice)
	}
	if (picked.length < 2) {
		for (const sound of [...sounds].sort(() => random() - 0.5)) {
			if (picked.length >= 2) break
			if (!picked.some((item) => item.id === sound.id)) picked.push(sound)
		}
	}
	const count = picked.length >= 3 && random() < 0.4 ? 3 : Math.min(2, picked.length)
	return picked.slice(0, Math.max(1, count)).map((sound) => ({
		sound,
		volume: Math.round((0.48 + random() * 0.47) * 100) / 100
	}))
}

/** Shared volume so stacked layers sit at the same level without jumping the mix. */
export function evenLevel(volumes: number[]): number {
	if (!volumes.length) return 1
	const avg = volumes.reduce((sum, value) => sum + value, 0) / volumes.length
	return Math.round(avg * 100) / 100
}

export const MASTER_MOODS = [
	{ id: 'hush', label: 'Hush', volume: 0.32 },
	{ id: 'room', label: 'Room', volume: 0.68 },
	{ id: 'full', label: 'Full', volume: 1 }
] as const

export type MasterMood = (typeof MASTER_MOODS)[number]['id']

export function masterMood(volume: number): MasterMood | null {
	if (Math.abs(volume - 0.32) < 0.04) return 'hush'
	if (Math.abs(volume - 0.68) < 0.04) return 'room'
	if (volume > 0.97) return 'full'
	return null
}

/** One unused layer from a different category when possible, to grow a mix without replacing it. */
export function companionLayer(sounds: Sound[], playingIds: string[], random: () => number = Math.random): { sound: Sound; volume: number } | null {
	const used = new Set(playingIds)
	const playing = sounds.filter((sound) => used.has(sound.id))
	const usedCats = new Set(playing.map((sound) => sound.category.slug))
	const otherCat = sounds.filter((sound) => !used.has(sound.id) && !usedCats.has(sound.category.slug))
	const pool = otherCat.length ? otherCat : sounds.filter((sound) => !used.has(sound.id))
	if (!pool.length) return null
	const sound = pool[Math.floor(random() * pool.length)]
	if (!sound) return null
	return { sound, volume: Math.round((0.52 + random() * 0.28) * 100) / 100 }
}
