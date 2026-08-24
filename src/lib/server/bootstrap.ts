import { env } from './env'
import { migrate } from './migrate'
import { seed } from './seed'
import { ensureUploadDirs } from './uploads'

let ready: Promise<void> | null = null

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wait for Postgres, apply SQL migrations, seed the catalog, and ensure upload folders exist.
 * Retries because Compose `depends_on` can still race the first query.
 */
export function ensureReady(): Promise<void> {
	ready ??= (async () => {
		let lastError: unknown
		for (let attempt = 1; attempt <= 30; attempt += 1) {
			try {
				await migrate()
				await ensureUploadDirs()
				await seed()
				return
			} catch (error) {
				lastError = error
				console.warn(`[zenzei] database not ready (attempt ${attempt}/30)`, error)
				await sleep(1000)
			}
		}
		throw lastError
	})()
	return ready
}

export function isAdminRequest(request: Request): boolean {
	if (!env.adminApiKey) return false
	const header = request.headers.get('x-admin-key') ?? ''
	return header === env.adminApiKey
}
