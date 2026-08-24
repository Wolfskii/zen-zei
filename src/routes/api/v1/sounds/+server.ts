import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$lib/server/env'
import { jsonError } from '$lib/server/http'
import { clientKey, rateLimit } from '$lib/server/rate-limit'
import { createSound, getCategory, listSounds } from '$lib/server/sounds'
import { isAudioType, isCoverType, saveUpload } from '$lib/server/uploads'
import { parseYouTubeVideoId, youtubeWatchUrl } from '$lib/youtube'

export const GET: RequestHandler = async ({ url, locals }) => {
	const categorySlug = url.searchParams.get('category')
	const sounds = await listSounds({ categorySlug, voterId: locals.voterId })
	return json({ sounds })
}

export const POST: RequestHandler = async (event) => {
	if (!rateLimit(`sound-create:${clientKey(event)}`, 20, 10 * 60 * 1000)) {
		return jsonError('Too many new sounds. Try again in a few minutes.', 429, 'rate_limited')
	}

	const contentType = event.request.headers.get('content-type') ?? ''

	try {
		if (contentType.includes('multipart/form-data')) {
			return json({ sound: await createFromForm(event.request, event.locals.voterId) }, { status: 201 })
		}
		return json({ sound: await createFromJson(await event.request.json(), event.locals.voterId) }, { status: 201 })
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not create sound'
		const status = message.includes('required') || message.includes('valid') || message.includes('too large') || message.includes('type') ? 400 : 500
		return jsonError(message, status)
	}
}

async function createFromJson(body: unknown, voterId: string) {
	if (!body || typeof body !== 'object') throw new Error('JSON body required')
	const data = body as Record<string, unknown>
	const name = String(data.name ?? '').trim()
	const description = String(data.description ?? '').trim()
	const categoryId = String(data.categoryId ?? '')
	const icon = data.icon ? String(data.icon) : null
	const youtubeUrl = String(data.youtubeUrl ?? '')
	const videoId = parseYouTubeVideoId(youtubeUrl)
	if (!name) throw new Error('Name is required')
	if (!(await getCategory(categoryId))) throw new Error('A valid category is required')
	if (!videoId) throw new Error('A valid YouTube URL is required')

	return createSound(
		{
			kind: 'youtube',
			name,
			description,
			categoryId,
			icon,
			youtubeUrl: youtubeWatchUrl(videoId),
			youtubeVideoId: videoId
		},
		voterId
	)
}

async function createFromForm(request: Request, voterId: string) {
	const form = await request.formData()
	const kind = String(form.get('kind') ?? 'file')
	const name = String(form.get('name') ?? '').trim()
	const description = String(form.get('description') ?? '').trim()
	const categoryId = String(form.get('categoryId') ?? '')
	const icon = String(form.get('icon') ?? '') || null

	if (!name) throw new Error('Name is required')
	if (!(await getCategory(categoryId))) throw new Error('A valid category is required')

	const cover = form.get('cover')
	let coverPath: string | null = null
	const id = crypto.randomUUID()

	if (cover instanceof File && cover.size > 0) {
		if (cover.size > env.maxCoverBytes) throw new Error('Cover image is too large')
		if (!isCoverType(cover.type)) throw new Error('Cover must be JPEG, PNG, WebP, or GIF')
		coverPath = await saveUpload('cover', id, cover)
	}

	if (kind === 'youtube') {
		const youtubeUrl = String(form.get('youtubeUrl') ?? '')
		const videoId = parseYouTubeVideoId(youtubeUrl)
		if (!videoId) throw new Error('A valid YouTube URL is required')
		return createSound(
			{
				kind: 'youtube',
				name,
				description,
				categoryId,
				icon,
				youtubeUrl: youtubeWatchUrl(videoId),
				youtubeVideoId: videoId,
				coverPath
			},
			voterId
		)
	}

	const audio = form.get('audio')
	if (!(audio instanceof File) || audio.size === 0) throw new Error('An audio file is required')
	if (audio.size > env.maxAudioBytes) throw new Error('Audio file is too large')
	if (audio.type && !isAudioType(audio.type)) throw new Error('Audio must be MP3, WAV, OGG, or WebM')

	const audioPath = await saveUpload('audio', id, audio)
	return createSound(
		{
			kind: 'file',
			name,
			description,
			categoryId,
			icon,
			audioPath,
			coverPath
		},
		voterId
	)
}
