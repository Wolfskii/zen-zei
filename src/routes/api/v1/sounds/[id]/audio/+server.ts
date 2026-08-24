import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { fileResponse } from '$lib/server/file-response'
import { getAudioPath } from '$lib/server/sounds'

export const GET: RequestHandler = async ({ params, request }) => {
	const path = await getAudioPath(params.id)
	if (!path) throw error(404, 'No audio for this sound')
	return fileResponse(path, request)
}
