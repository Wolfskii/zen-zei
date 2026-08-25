/**
 * Process environment with Yggdrasil-style defaults.
 * Reads `$env/dynamic/private` so `.env` and Dokploy/runtime vars both work.
 * Secrets stay empty unless the operator sets them.
 */
import { env as privateEnv } from '$env/dynamic/private'

function read(name: string, fallback = ''): string {
	return privateEnv[name] ?? fallback
}

function readInt(name: string, fallback: number): number {
	const raw = privateEnv[name]
	if (!raw) return fallback
	const value = Number.parseInt(raw, 10)
	return Number.isFinite(value) ? value : fallback
}

function readFlag(name: string, fallback: boolean): boolean {
	const raw = privateEnv[name]
	if (raw === undefined || raw === '') return fallback
	return raw === '1' || raw.toLowerCase() === 'true'
}

export const env = {
	get databaseUrl() {
		return read('DATABASE_URL', 'postgres://zenzei:zenzei@localhost:5432/zenzei')
	},
	get host() {
		return read('HOST', read('ZENZEI_HOST', '0.0.0.0'))
	},
	get port() {
		return readInt('PORT', readInt('ZENZEI_PORT', 8080))
	},
	get adminApiKey() {
		return read('ZENZEI_ADMIN_API_KEY')
	},
	get uploadDir() {
		return read('ZENZEI_UPLOAD_DIR', './data/uploads')
	},
	get seed() {
		return readFlag('ZENZEI_SEED', true)
	},
	get maxAudioBytes() {
		return readInt('ZENZEI_MAX_AUDIO_BYTES', 20 * 1024 * 1024)
	},
	get maxCoverBytes() {
		return readInt('ZENZEI_MAX_COVER_BYTES', 2 * 1024 * 1024)
	}
}
