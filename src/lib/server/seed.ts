import { env } from './env'
import { db } from './db'
import { categories, sounds } from './schema'

/** Stable ids so `ZENZEI_SEED=1` can re-run without duplicating rows. */
export const SEED_CATEGORIES = [
	{ id: '00000000-0000-4000-8000-000000000001', slug: 'nature', name: 'Nature', icon: 'Trees', sortOrder: 1 },
	{ id: '00000000-0000-4000-8000-000000000002', slug: 'asmr', name: 'ASMR', icon: 'Headphones', sortOrder: 2 },
	{ id: '00000000-0000-4000-8000-000000000003', slug: 'background', name: 'Background', icon: 'Radio', sortOrder: 3 },
	{ id: '00000000-0000-4000-8000-000000000004', slug: 'ambient', name: 'Ambient', icon: 'Sparkles', sortOrder: 4 }
] as const

const NATURE = SEED_CATEGORIES[0].id
const ASMR = SEED_CATEGORIES[1].id
const BACKGROUND = SEED_CATEGORIES[2].id

/**
 * Built-in catalog. Rain uses the WAV shipped in `static/sounds`.
 * Extra YouTube rows are 10-hour-style loops; some videos may still block embedding.
 */
const SEED_SOUNDS = [
	{
		id: '00000000-0000-4000-8000-000000000011',
		kind: 'file',
		name: 'Rain',
		description: 'A close, steady rainfall. Mix it under thunder or a fireplace.',
		categoryId: NATURE,
		icon: 'CloudRain',
		audioPath: 'bundled:sounds/rain.wav',
		youtubeUrl: null,
		youtubeVideoId: null
	},
	{
		id: '00000000-0000-4000-8000-000000000012',
		kind: 'youtube',
		name: 'Thunder',
		description: 'Distant rolling thunder. Pair it with rain.',
		categoryId: NATURE,
		icon: 'CloudLightning',
		audioPath: null,
		youtubeUrl: 'https://www.youtube.com/watch?v=NI0M03vCoXg',
		youtubeVideoId: 'NI0M03vCoXg'
	},
	{
		id: '00000000-0000-4000-8000-000000000013',
		kind: 'youtube',
		name: 'Ocean waves',
		description: 'Shoreline wash for focus or sleep.',
		categoryId: NATURE,
		icon: 'Waves',
		audioPath: null,
		youtubeUrl: 'https://www.youtube.com/watch?v=bn9F19Hi1Lk',
		youtubeVideoId: 'bn9F19Hi1Lk'
	},
	{
		id: '00000000-0000-4000-8000-000000000014',
		kind: 'youtube',
		name: 'Fireplace',
		description: 'Crackling wood fire as a warm background layer.',
		categoryId: BACKGROUND,
		icon: 'Flame',
		audioPath: null,
		youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
		youtubeVideoId: 'L_LUpnjgPso'
	},
	{
		id: '00000000-0000-4000-8000-000000000015',
		kind: 'youtube',
		name: 'Soft whispers',
		description: 'Quiet close-mic ASMR texture. Volume down if it feels too intimate.',
		categoryId: ASMR,
		icon: 'AudioLines',
		audioPath: null,
		youtubeUrl: 'https://www.youtube.com/watch?v=z7oWplCaH-I',
		youtubeVideoId: 'z7oWplCaH-I'
	}
] as const

/** Inserts seed rows with ON CONFLICT DO NOTHING. Safe on every boot. */
export async function seed(): Promise<void> {
	if (!env.seed) return

	for (const category of SEED_CATEGORIES) {
		await db.insert(categories).values(category).onConflictDoNothing()
	}

	for (const sound of SEED_SOUNDS) {
		await db.insert(sounds).values(sound).onConflictDoNothing()
	}
}
