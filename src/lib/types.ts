/**
 * Shared client/server types for the sound catalog.
 * Keep this file free of Node-only imports so Svelte components can use it.
 */

export type SoundKind = 'youtube' | 'file'

export type Category = {
	id: string
	slug: string
	name: string
	icon: string
	sortOrder: number
}

export type SoundRating = {
	/** Mean of 1–5 votes, or 0 when nobody has voted. */
	average: number
	count: number
	/** This visitor's stars, if they have voted. */
	mine: number | null
}

export type Sound = {
	id: string
	kind: SoundKind
	name: string
	description: string
	category: Category
	youtubeUrl: string | null
	youtubeVideoId: string | null
	icon: string | null
	coverUrl: string | null
	audioUrl: string | null
	rating: SoundRating
	createdAt: string
}

export type MixChannelSnapshot = {
	playing: boolean
	volume: number
}

export type MixSnapshot = {
	masterVolume: number
	channels: Record<string, MixChannelSnapshot>
}
