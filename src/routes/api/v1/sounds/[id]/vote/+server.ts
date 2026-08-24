import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { jsonError } from '$lib/server/http'
import { clientKey, rateLimit } from '$lib/server/rate-limit'
import { upsertVote } from '$lib/server/sounds'

export const POST: RequestHandler = async (event) => {
	if (!rateLimit(`vote:${clientKey(event)}`, 60, 60 * 1000)) {
		return jsonError('Too many votes', 429, 'rate_limited')
	}

	const body = (await event.request.json().catch(() => null)) as { stars?: unknown } | null
	const stars = Number(body?.stars)
	try {
		const sound = await upsertVote(event.params.id, event.locals.voterId, stars)
		if (!sound) return jsonError('Sound not found', 404, 'not_found')
		return json({ sound })
	} catch (error) {
		return jsonError(error instanceof Error ? error.message : 'Vote failed', 400)
	}
}
