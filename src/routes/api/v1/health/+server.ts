import { json } from '@sveltejs/kit'
import { sql } from 'drizzle-orm'
import { db } from '$lib/server/db'

/** Liveness + Postgres ping for Docker healthchecks. */
export async function GET() {
	try {
		await db.execute(sql`select 1 as ok`)
		return json({ ok: true })
	} catch (error) {
		return json({ ok: false, error: error instanceof Error ? error.message : 'database_unavailable' }, { status: 503 })
	}
}
