import { listCategories, listSounds } from '$lib/server/sounds'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	const [sounds, categories] = await Promise.all([listSounds({ voterId: locals.voterId }), listCategories()])
	return {
		sounds,
		categories,
		isAdmin: locals.isAdmin
	}
}
