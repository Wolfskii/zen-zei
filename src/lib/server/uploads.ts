import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { env } from './env'

const AUDIO_TYPES = new Set(['audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/flac'])
const COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const AUDIO_EXT: Record<string, string> = {
	'audio/mpeg': 'mp3',
	'audio/wav': 'wav',
	'audio/wave': 'wav',
	'audio/x-wav': 'wav',
	'audio/ogg': 'ogg',
	'audio/webm': 'webm',
	'audio/mp4': 'm4a',
	'audio/flac': 'flac'
}

const COVER_EXT: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif'
}

export function audioDir(): string {
	return join(env.uploadDir, 'audio')
}

export function coverDir(): string {
	return join(env.uploadDir, 'covers')
}

export async function ensureUploadDirs(): Promise<void> {
	await mkdir(audioDir(), { recursive: true })
	await mkdir(coverDir(), { recursive: true })
}

export function isAudioType(type: string): boolean {
	return AUDIO_TYPES.has(type)
}

export function isCoverType(type: string): boolean {
	return COVER_TYPES.has(type)
}

/**
 * Writes an uploaded blob under the uploads volume.
 * Paths stored in Postgres are relative (`audio/uuid.ext`) so the volume can move.
 */
export async function saveUpload(kind: 'audio' | 'cover', id: string, file: File): Promise<string> {
	const type = file.type || (kind === 'audio' ? 'audio/mpeg' : 'image/jpeg')
	const ext = kind === 'audio' ? AUDIO_EXT[type] ?? 'bin' : COVER_EXT[type] ?? 'bin'
	const relative = `${kind === 'audio' ? 'audio' : 'covers'}/${id}.${ext}`
	const absolute = join(env.uploadDir, relative)
	await mkdir(join(absolute, '..'), { recursive: true })
	const buffer = Buffer.from(await file.arrayBuffer())
	await writeFile(absolute, buffer)
	return relative
}

export function absoluteUploadPath(relative: string): string {
	return join(env.uploadDir, relative)
}
