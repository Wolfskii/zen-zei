import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { jsonError } from '$lib/server/http'
import { env } from '$lib/server/env'
import { probeRemoteAudio } from '$lib/server/remote-audio'

/** Confirms a pasted MP3/WAV/OGG/WebM link is reachable and public. */
export const GET: RequestHandler = async ({ url }) => {
	const raw = url.searchParams.get('url') ?? ''
	try {
		const info = await probeRemoteAudio(raw, env.maxAudioBytes)
		return json(info)
	} catch (error) {
		return jsonError(error instanceof Error ? error.message : 'Could not read that audio link', 400, 'invalid_audio_url')
	}
}
