import { and, asc, avg, count, eq } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import type { Category, Sound } from '$lib/types'
import { youtubeThumbnailUrl } from '$lib/youtube'
import { db } from './db'
import { categories, sounds, votes } from './schema'
import { absoluteUploadPath } from './uploads'

type SoundRow = typeof sounds.$inferSelect
type CategoryRow = typeof categories.$inferSelect

export async function listCategories(): Promise<Category[]> {
	const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name))
	return rows.map(toCategory)
}

export async function getCategory(id: string): Promise<Category | null> {
	const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
	return row ? toCategory(row) : null
}

export async function listSounds(opts: { categorySlug?: string | null; voterId: string }): Promise<Sound[]> {
	const mineRows = await db.select().from(votes).where(eq(votes.voterId, opts.voterId))
	const mineBySound = new Map(mineRows.map((row) => [row.soundId, row.stars]))

	const rows = await db
		.select({
			sound: sounds,
			category: categories,
			ratingAvg: avg(votes.stars),
			ratingCount: count(votes.soundId)
		})
		.from(sounds)
		.innerJoin(categories, eq(sounds.categoryId, categories.id))
		.leftJoin(votes, eq(votes.soundId, sounds.id))
		.where(opts.categorySlug ? eq(categories.slug, opts.categorySlug) : undefined)
		.groupBy(sounds.id, categories.id)
		.orderBy(asc(sounds.createdAt))

	return rows.map((row) => toSound(row.sound, row.category, Number(row.ratingAvg ?? 0), Number(row.ratingCount ?? 0), mineBySound.get(row.sound.id) ?? null))
}

export async function getSound(id: string, voterId: string): Promise<Sound | null> {
	const [mine] = await db
		.select()
		.from(votes)
		.where(and(eq(votes.soundId, id), eq(votes.voterId, voterId)))
		.limit(1)

	const [row] = await db
		.select({
			sound: sounds,
			category: categories,
			ratingAvg: avg(votes.stars),
			ratingCount: count(votes.soundId)
		})
		.from(sounds)
		.innerJoin(categories, eq(sounds.categoryId, categories.id))
		.leftJoin(votes, eq(votes.soundId, sounds.id))
		.where(eq(sounds.id, id))
		.groupBy(sounds.id, categories.id)
		.limit(1)

	if (!row) return null
	return toSound(row.sound, row.category, Number(row.ratingAvg ?? 0), Number(row.ratingCount ?? 0), mine?.stars ?? null)
}

export type NewSoundInput = {
	kind: 'youtube' | 'file'
	name: string
	description: string
	categoryId: string
	icon: string | null
	youtubeUrl?: string | null
	youtubeVideoId?: string | null
	audioPath?: string | null
	coverPath?: string | null
}

export async function createSound(input: NewSoundInput, voterId: string): Promise<Sound> {
	const id = crypto.randomUUID()
	await db.insert(sounds).values({
		id,
		kind: input.kind,
		name: input.name.trim(),
		description: input.description.trim(),
		categoryId: input.categoryId,
		icon: input.icon,
		youtubeUrl: input.youtubeUrl ?? null,
		youtubeVideoId: input.youtubeVideoId ?? null,
		audioPath: input.audioPath ?? null,
		coverPath: input.coverPath ?? null
	})
	const created = await getSound(id, voterId)
	if (!created) throw new Error('Sound insert failed')
	return created
}

export async function updateSound(
	id: string,
	patch: Partial<Pick<NewSoundInput, 'name' | 'description' | 'categoryId' | 'icon' | 'coverPath'>>,
	voterId: string
): Promise<Sound | null> {
	const [existing] = await db.select().from(sounds).where(eq(sounds.id, id)).limit(1)
	if (!existing) return null

	await db
		.update(sounds)
		.set({
			name: patch.name?.trim() ?? existing.name,
			description: patch.description?.trim() ?? existing.description,
			categoryId: patch.categoryId ?? existing.categoryId,
			icon: patch.icon === undefined ? existing.icon : patch.icon,
			coverPath: patch.coverPath === undefined ? existing.coverPath : patch.coverPath
		})
		.where(eq(sounds.id, id))

	return getSound(id, voterId)
}

export async function deleteSound(id: string): Promise<boolean> {
	const [existing] = await db.select().from(sounds).where(eq(sounds.id, id)).limit(1)
	if (!existing) return false

	await db.delete(sounds).where(eq(sounds.id, id))
	await removeFile(existing.audioPath)
	await removeFile(existing.coverPath)
	return true
}

export async function upsertVote(soundId: string, voterId: string, stars: number): Promise<Sound | null> {
	if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
		throw new Error('Stars must be an integer from 1 to 5')
	}

	const [existing] = await db.select().from(sounds).where(eq(sounds.id, soundId)).limit(1)
	if (!existing) return null

	await db
		.insert(votes)
		.values({ soundId, voterId, stars })
		.onConflictDoUpdate({
			target: [votes.soundId, votes.voterId],
			set: { stars, updatedAt: new Date() }
		})

	return getSound(soundId, voterId)
}

export async function getAudioPath(id: string): Promise<string | null> {
	const [row] = await db.select({ audioPath: sounds.audioPath }).from(sounds).where(eq(sounds.id, id)).limit(1)
	return resolveStoredPath(row?.audioPath ?? null)
}

export async function getCoverPath(id: string): Promise<string | null> {
	const [row] = await db.select({ coverPath: sounds.coverPath }).from(sounds).where(eq(sounds.id, id)).limit(1)
	return resolveStoredPath(row?.coverPath ?? null)
}

function resolveStoredPath(stored: string | null): string | null {
	if (!stored) return null
	if (stored.startsWith('bundled:')) {
		return join(process.cwd(), 'static', ...stored.slice('bundled:'.length).split('/'))
	}
	return absoluteUploadPath(stored)
}

function toCategory(row: CategoryRow): Category {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		icon: row.icon,
		sortOrder: row.sortOrder
	}
}

function toSound(row: SoundRow, category: CategoryRow, average: number, count: number, mine: number | null): Sound {
	const kind = row.kind === 'file' ? 'file' : 'youtube'
	const coverUrl = row.coverPath ? `/api/v1/sounds/${row.id}/cover` : row.youtubeVideoId ? youtubeThumbnailUrl(row.youtubeVideoId) : null

	return {
		id: row.id,
		kind,
		name: row.name,
		description: row.description,
		category: toCategory(category),
		youtubeUrl: row.youtubeUrl,
		youtubeVideoId: row.youtubeVideoId,
		icon: row.icon,
		coverUrl,
		audioUrl: kind === 'file' ? `/api/v1/sounds/${row.id}/audio` : null,
		rating: { average, count, mine },
		createdAt: row.createdAt.toISOString()
	}
}

async function removeFile(relative: string | null): Promise<void> {
	if (!relative || relative.startsWith('bundled:')) return
	try {
		await unlink(absoluteUploadPath(relative))
	} catch {
		// Missing files are fine — the row is already gone.
	}
}
