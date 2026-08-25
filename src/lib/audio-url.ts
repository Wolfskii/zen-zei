/**
 * Direct http(s) links to audio files (not YouTube).
 * Server code still DNS-checks the host before fetching (SSRF).
 */
import { parseYouTubeVideoId } from './youtube'

const AUDIO_EXT = /\.(mp3|wav|wave|ogg|oga|webm|m4a|flac|aac)(\?|#|$)/i

export function hasAudioExtension(url: string): boolean {
	return AUDIO_EXT.test(url)
}

/** Syntactic check used in the form and again on the server before DNS. */
export function parseDirectAudioUrl(input: string): string | null {
	const trimmed = input.trim()
	if (!trimmed) return null
	if (parseYouTubeVideoId(trimmed)) return null

	let url: URL
	try {
		url = new URL(trimmed)
	} catch {
		return null
	}

	if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
	if (isBlockedHostname(url.hostname)) return null
	return url.href
}

export function suggestedNameFromAudioUrl(href: string): string {
	try {
		const url = new URL(href)
		const last = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() ?? '')
		const stem = last.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim()
		return stem || 'Audio link'
	} catch {
		return 'Audio link'
	}
}

export function isBlockedHostname(hostname: string): boolean {
	const host = hostname.replace(/^\[|\]$/g, '').toLowerCase()
	if (!host) return true
	if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true
	if (host === 'metadata.google.internal') return true
	return isPrivateIpLiteral(host)
}

export function isPrivateIpLiteral(ip: string): boolean {
	const value = ip.toLowerCase()
	if (value === '::1' || value === '::' || value === '0.0.0.0') return true
	if (value.startsWith('::ffff:')) return isPrivateIpLiteral(value.slice(7))
	if (value.includes(':')) {
		return value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb')
	}

	const parts = value.split('.').map((part) => Number(part))
	if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false
	const [a, b] = parts
	if (a === 0 || a === 10 || a === 127) return true
	if (a === 169 && b === 254) return true
	if (a === 172 && b >= 16 && b <= 31) return true
	if (a === 192 && b === 168) return true
	if (a === 100 && b >= 64 && b <= 127) return true
	return false
}
