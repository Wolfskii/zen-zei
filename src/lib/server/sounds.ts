import { and, asc, avg, count, eq } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import type { Category, Sound, SoundKind } from '$lib/types'
import { isIconCover, publicCoverUrl } from '$lib/cover'
import { fromStoredAudioUrl } from './remote-audio'
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
	kind: SoundKind
	name: string
	description: string
	categoryId: string
	icon: string | null
	youtubeUrl?: string | null
	youtubeVideoId?: string | null
	audioPath?: string | null
	coverPath?: string | null
}

export async function createSound(input: NewSoundInput & { id?: string }, voterId: string): Promise<Sound> {
	const id = input.id ?? crypto.randomUUID()
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
	patch: Partial<NewSoundInput>,
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
			coverPath: patch.coverPath === undefined ? existing.coverPath : patch.coverPath,
			audioPath: patch.audioPath === undefined ? existing.audioPath : patch.audioPath,
			youtubeUrl: patch.youtubeUrl === undefined ? existing.youtubeUrl : patch.youtubeUrl,
			youtubeVideoId: patch.youtubeVideoId === undefined ? existing.youtubeVideoId : patch.youtubeVideoId
		})
		.where(eq(sounds.id, id))

	if (patch.audioPath && existing.audioPath && patch.audioPath !== existing.audioPath) {
		await removeFile(existing.audioPath)
	}
	if (patch.coverPath !== undefined && existing.coverPath && patch.coverPath !== existing.coverPath) {
		await removeFile(existing.coverPath)
	}

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
	const source = await getAudioSource(id)
	return source?.kind === 'file' ? source.path : null
}

export type AudioSource = { kind: 'file'; path: string } | { kind: 'remote'; url: string }

export async function getAudioSource(id: string): Promise<AudioSource | null> {
	const [row] = await db.select({ audioPath: sounds.audioPath }).from(sounds).where(eq(sounds.id, id)).limit(1)
	if (!row?.audioPath) return null
	const remote = fromStoredAudioUrl(row.audioPath)
	if (remote) return { kind: 'remote', url: remote }
	const path = resolveStoredPath(row.audioPath)
	return path ? { kind: 'file', path } : null
}

export async function getCoverPath(id: string): Promise<string | null> {
	const [row] = await db.select({ coverPath: sounds.coverPath }).from(sounds).where(eq(sounds.id, id)).limit(1)
	return resolveStoredPath(row?.coverPath ?? null)
}

function resolveStoredPath(stored: string | null): string | null {
	if (!stored || isIconCover(stored) || stored.startsWith('url:')) return null
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

function toKind(raw: string): SoundKind {
	if (raw === 'file') return 'file'
	if (raw === 'url') return 'url'
	return 'youtube'
}

function toSound(row: SoundRow, category: CategoryRow, average: number, count: number, mine: number | null): Sound {
	const kind = toKind(row.kind)
	const coverUrl = publicCoverUrl(row.id, row.coverPath, row.youtubeVideoId)

	return {
		id: row.id,
		kind,
		name: row.name,
		description: row.description,
		category: toCategory(category),
		youtubeUrl: row.youtubeUrl,
		youtubeVideoId: row.youtubeVideoId,
		audioRemoteUrl: fromStoredAudioUrl(row.audioPath),
		icon: row.icon,
		coverUrl,
		audioUrl: kind === 'youtube' ? null : `/api/v1/sounds/${row.id}/audio`,
		rating: { average, count, mine },
		createdAt: row.createdAt.toISOString()
	}
}

async function removeFile(relative: string | null): Promise<void> {
	if (!relative || relative.startsWith('bundled:') || relative.startsWith('url:') || isIconCover(relative)) return
	try {
		await unlink(absoluteUploadPath(relative))
	} catch {
		// Missing files are fine — the row is already gone.
	}
}
