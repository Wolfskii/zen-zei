/**
 * Process environment with Yggdrasil-style defaults.
 * Secrets stay empty unless the operator sets them.
 */

function read(name: string, fallback = ''): string {
	return process.env[name] ?? fallback
}

function readInt(name: string, fallback: number): number {
	const raw = process.env[name]
	if (!raw) return fallback
	const value = Number.parseInt(raw, 10)
	return Number.isFinite(value) ? value : fallback
}

function readFlag(name: string, fallback: boolean): boolean {
	const raw = process.env[name]
	if (raw === undefined || raw === '') return fallback
	return raw === '1' || raw.toLowerCase() === 'true'
}

export const env = {
	databaseUrl: read('DATABASE_URL', 'postgres://zenzei:zenzei@localhost:5432/zenzei'),
	host: read('HOST', read('ZENZEI_HOST', '0.0.0.0')),
	port: readInt('PORT', readInt('ZENZEI_PORT', 8080)),
	adminApiKey: read('ZENZEI_ADMIN_API_KEY'),
	uploadDir: read('ZENZEI_UPLOAD_DIR', './data/uploads'),
	seed: readFlag('ZENZEI_SEED', true),
	maxAudioBytes: readInt('ZENZEI_MAX_AUDIO_BYTES', 20 * 1024 * 1024),
	maxCoverBytes: readInt('ZENZEI_MAX_COVER_BYTES', 2 * 1024 * 1024)
}
