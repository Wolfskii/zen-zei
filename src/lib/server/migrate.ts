import { join } from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { sqlClient } from './db'

/**
 * Applies ordered `*.sql` files once, tracked in `_migrations`.
 * Docker boot uses this instead of drizzle-kit so the runtime image stays small.
 */
export async function migrate(): Promise<void> {
	await sqlClient.unsafe(`
		CREATE TABLE IF NOT EXISTS _migrations (
			id text PRIMARY KEY,
			applied_at timestamptz NOT NULL DEFAULT now()
		)
	`)

	const dir = join(process.cwd(), 'drizzle')
	const files = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort()

	for (const file of files) {
		const already = await sqlClient<{ id: string }[]>`
			SELECT id FROM _migrations WHERE id = ${file}
		`
		if (already.length > 0) continue

		const sql = await readFile(join(dir, file), 'utf8')
		await sqlClient.begin(async (tx) => {
			await tx.unsafe(sql)
			await tx`INSERT INTO _migrations (id) VALUES (${file})`
		})
	}
}
