import { json } from '@sveltejs/kit'
import { listCategories } from '$lib/server/sounds'

export async function GET() {
	return json({ categories: await listCategories() })
}
