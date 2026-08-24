import type { Handle } from '@sveltejs/kit'
import { ensureReady, isAdminRequest } from '$lib/server/bootstrap'
import { VOTER_COOKIE } from '$lib/server/cookies'

export const handle: Handle = async ({ event, resolve }) => {
	await ensureReady()

	let voterId = event.cookies.get(VOTER_COOKIE)
	if (!voterId) {
		voterId = crypto.randomUUID()
		event.cookies.set(VOTER_COOKIE, voterId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: event.url.protocol === 'https:',
			maxAge: 60 * 60 * 24 * 365
		})
	}

	event.locals.voterId = voterId
	event.locals.isAdmin = isAdminRequest(event.request)

	return resolve(event)
}
