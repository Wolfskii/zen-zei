import { json, type RequestEvent } from '@sveltejs/kit'

export function jsonError(message: string, status: number, code: string | number = status) {
	return json({ error: { code, message } }, { status })
}

export function requireAdmin(event: RequestEvent): Response | null {
	if (event.locals.isAdmin) return null
	return jsonError('Admin key required', 403, 'admin_required')
}
