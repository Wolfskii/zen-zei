import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { requireAdmin } from '$lib/server/http'

/** Confirms the `x-admin-key` header matches `ZENZEI_ADMIN_API_KEY`. */
export const GET: RequestHandler = async (event) => {
	const denied = requireAdmin(event)
	if (denied) return denied
	return json({ ok: true })
}
