import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { fileResponse } from '$lib/server/file-response'
import { proxyRemoteAudio } from '$lib/server/remote-audio'
import { getAudioSource } from '$lib/server/sounds'

export const GET: RequestHandler = async ({ params, request }) => {
	const source = await getAudioSource(params.id)
	if (!source) throw error(404, 'No audio for this sound')
	if (source.kind === 'remote') {
		try {
			return await proxyRemoteAudio(source.url, request)
		} catch {
			throw error(502, 'Could not fetch that audio link')
		}
	}
	return fileResponse(source.path, request)
}
