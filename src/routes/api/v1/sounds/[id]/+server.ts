import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { VISUAL_ICON } from '$lib/cover'
import { jsonError, requireAdmin } from '$lib/server/http'
import { env } from '$lib/server/env'
import { isAudioType, isCoverType, saveUpload } from '$lib/server/uploads'
import { probeRemoteAudio, toStoredAudioUrl } from '$lib/server/remote-audio'
import { deleteSound, getSound, updateSound } from '$lib/server/sounds'
import { parseYouTubeVideoId, youtubeWatchUrl } from '$lib/youtube'

export const GET: RequestHandler = async ({ params, locals }) => {
	const sound = await getSound(params.id, locals.voterId)
	if (!sound) return jsonError('Sound not found', 404, 'not_found')
	return json({ sound })
}

export const PATCH: RequestHandler = async (event) => {
	const denied = requireAdmin(event)
	if (denied) return denied

	const existing = await getSound(event.params.id, event.locals.voterId)
	if (!existing) return jsonError('Sound not found', 404, 'not_found')

	const contentType = event.request.headers.get('content-type') ?? ''
	try {
		if (contentType.includes('multipart/form-data')) {
			const form = await event.request.formData()
			const cover = form.get('cover')
			const audio = form.get('audio')
			const coverMode = optionalString(form.get('coverMode'))
			let coverPath: string | null | undefined
			let audioPath: string | undefined

			if (cover instanceof File && cover.size > 0) {
				if (cover.size > env.maxCoverBytes) throw new Error('Cover image is too large')
				if (!isCoverType(cover.type)) throw new Error('Cover must be JPEG, PNG, WebP, or GIF')
				coverPath = await saveUpload('cover', event.params.id, cover)
			} else if (coverMode === 'icon') {
				coverPath = VISUAL_ICON
			} else if (coverMode === 'picture') {
				coverPath = null
			}
			if (audio instanceof File && audio.size > 0) {
				if (audio.size > env.maxAudioBytes) throw new Error('Audio file is too large')
				if (audio.type && !isAudioType(audio.type)) throw new Error('Audio must be MP3, WAV, OGG, or WebM')
				audioPath = await saveUpload('audio', event.params.id, audio)
			} else {
				const remote = optionalString(form.get('audioUrl'))
				if (remote) {
					const info = await probeRemoteAudio(remote, env.maxAudioBytes)
					audioPath = toStoredAudioUrl(info.url)
				}
			}

			const youtube = youtubePatch(optionalString(form.get('youtubeUrl')))
			const sound = await updateSound(
				event.params.id,
				{
					name: optionalString(form.get('name')),
					description: optionalString(form.get('description')),
					categoryId: optionalString(form.get('categoryId')),
					icon: optionalString(form.get('icon')),
					coverPath,
					audioPath,
					...youtube
				},
				event.locals.voterId
			)
			return json({ sound })
		}

		const body = (await event.request.json()) as Record<string, unknown>
		const youtube = youtubePatch(typeof body.youtubeUrl === 'string' ? body.youtubeUrl : undefined)
		const sound = await updateSound(
			event.params.id,
			{
				name: typeof body.name === 'string' ? body.name : undefined,
				description: typeof body.description === 'string' ? body.description : undefined,
				categoryId: typeof body.categoryId === 'string' ? body.categoryId : undefined,
				icon: typeof body.icon === 'string' ? body.icon : undefined,
				...youtube
			},
			event.locals.voterId
		)
		return json({ sound })
	} catch (error) {
		return jsonError(error instanceof Error ? error.message : 'Update failed', 400)
	}
}

export const DELETE: RequestHandler = async (event) => {
	const denied = requireAdmin(event)
	if (denied) return denied
	const ok = await deleteSound(event.params.id)
	if (!ok) return jsonError('Sound not found', 404, 'not_found')
	return json({ ok: true })
}

function youtubePatch(raw: string | undefined): { youtubeUrl?: string; youtubeVideoId?: string } {
	if (raw === undefined) return {}
	const videoId = parseYouTubeVideoId(raw)
	if (!videoId) throw new Error('A valid YouTube URL is required')
	return { youtubeUrl: youtubeWatchUrl(videoId), youtubeVideoId: videoId }
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
	if (typeof value !== 'string' || value === '') return undefined
	return value
}
