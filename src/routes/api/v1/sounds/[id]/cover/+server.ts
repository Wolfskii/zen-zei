import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { fileResponse } from '$lib/server/file-response'
import { getCoverPath } from '$lib/server/sounds'

export const GET: RequestHandler = async ({ params, request }) => {
	const path = await getCoverPath(params.id)
	if (!path) throw error(404, 'No cover for this sound')
	return fileResponse(path, request)
}
