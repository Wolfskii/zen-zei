import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { jsonError, requireAdmin } from '$lib/server/http'
import { deleteSound, getSound, updateSound } from '$lib/server/sounds'
import { env } from '$lib/server/env'
import { isCoverType, saveUpload } from '$lib/server/uploads'

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
			let coverPath: string | undefined
			if (cover instanceof File && cover.size > 0) {
				if (cover.size > env.maxCoverBytes) throw new Error('Cover image is too large')
				if (!isCoverType(cover.type)) throw new Error('Cover must be JPEG, PNG, WebP, or GIF')
				coverPath = await saveUpload('cover', event.params.id, cover)
			}
			const sound = await updateSound(
				event.params.id,
				{
					name: optionalString(form.get('name')),
					description: optionalString(form.get('description')),
					categoryId: optionalString(form.get('categoryId')),
					icon: optionalString(form.get('icon')),
					coverPath
				},
				event.locals.voterId
			)
			return json({ sound })
		}

		const body = (await event.request.json()) as Record<string, unknown>
		const sound = await updateSound(
			event.params.id,
			{
				name: typeof body.name === 'string' ? body.name : undefined,
				description: typeof body.description === 'string' ? body.description : undefined,
				categoryId: typeof body.categoryId === 'string' ? body.categoryId : undefined,
				icon: typeof body.icon === 'string' ? body.icon : undefined
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

function optionalString(value: FormDataEntryValue | null): string | undefined {
	if (typeof value !== 'string') return undefined
	return value
}
