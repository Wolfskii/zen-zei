/**
 * Fetch a public audio URL after blocking private hosts (SSRF).
 * Playback still happens in the browser; this only probes and proxies bytes.
 */
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { hasAudioExtension, isPrivateIpLiteral, parseDirectAudioUrl, suggestedNameFromAudioUrl } from '$lib/audio-url'

const UA = 'ZenZei/1.0 (ambient mixer)'

export type RemoteAudioInfo = {
	url: string
	contentType: string
	suggestedName: string
}

export function toStoredAudioUrl(href: string): string {
	return `url:${href}`
}

export function fromStoredAudioUrl(audioPath: string | null): string | null {
	if (!audioPath?.startsWith('url:')) return null
	return audioPath.slice('url:'.length)
}

export async function probeRemoteAudio(raw: string, maxBytes: number): Promise<RemoteAudioInfo> {
	const href = parseDirectAudioUrl(raw)
	if (!href) throw new Error('Paste a direct http(s) link to an MP3, WAV, OGG, or WebM file — not a YouTube page')

	const head = await fetchPublic(href, { method: 'HEAD' })
	let contentType = head.headers.get('content-type') ?? ''
	const length = contentLength(head)
	if (length != null && length > maxBytes) throw new Error('That audio file is too large')

	if (head.status >= 400 || !looksLikeAudioHeader(contentType, href)) {
		const sample = await fetchPublic(href, { method: 'GET', headers: { Range: 'bytes=0-2047' } })
		if (sample.status >= 400 && sample.status !== 206) throw new Error('That link did not return audio')
		contentType = sample.headers.get('content-type') ?? contentType
		const bytes = new Uint8Array(await sample.arrayBuffer())
		if (!looksLikeAudioBytes(bytes, contentType, href)) throw new Error('That link does not look like an MP3, WAV, OGG, or WebM file')
	}

	return {
		url: href,
		contentType: contentType.split(';')[0]?.trim() || 'audio/mpeg',
		suggestedName: suggestedNameFromAudioUrl(href)
	}
}

export async function proxyRemoteAudio(remoteUrl: string, request: Request): Promise<Response> {
	const href = parseDirectAudioUrl(remoteUrl)
	if (!href) throw new Error('Invalid audio URL')

	const headers: Record<string, string> = { 'User-Agent': UA }
	const range = request.headers.get('range')
	if (range) headers.Range = range

	const upstream = await fetchPublic(href, { method: 'GET', headers })
	if (upstream.status >= 400 && upstream.status !== 206) {
		return new Response('Audio host refused the request', { status: 502 })
	}

	const out = new Headers()
	const type = upstream.headers.get('content-type')
	if (type) out.set('Content-Type', type)
	else out.set('Content-Type', 'audio/mpeg')
	const length = upstream.headers.get('content-length')
	if (length) out.set('Content-Length', length)
	const contentRange = upstream.headers.get('content-range')
	if (contentRange) out.set('Content-Range', contentRange)
	out.set('Accept-Ranges', upstream.headers.get('accept-ranges') ?? 'bytes')
	out.set('Cache-Control', 'public, max-age=3600')

	return new Response(upstream.body, { status: upstream.status, headers: out })
}

async function fetchPublic(start: string, init: RequestInit, hops = 4): Promise<Response> {
	let current = start
	for (let hop = 0; hop < hops; hop += 1) {
		await assertPublicUrl(current)
		const response = await fetch(current, {
			...init,
			redirect: 'manual',
			signal: AbortSignal.timeout(10_000),
			headers: { 'User-Agent': UA, ...(init.headers as Record<string, string> | undefined) }
		})
		if (![301, 302, 303, 307, 308].includes(response.status)) return response
		const location = response.headers.get('location')
		if (!location) throw new Error('Audio host redirected nowhere')
		current = new URL(location, current).href
	}
	throw new Error('Too many redirects from that audio host')
}

async function assertPublicUrl(raw: string): Promise<void> {
	const href = parseDirectAudioUrl(raw)
	if (!href) throw new Error('That audio link is not allowed')
	const url = new URL(href)
	const host = url.hostname.replace(/^\[|\]$/g, '')
	if (isIP(host)) {
		if (isPrivateIpLiteral(host)) throw new Error('That audio link is not allowed')
		return
	}
	const records = await lookup(host, { all: true })
	if (records.length === 0) throw new Error('Could not resolve that audio host')
	if (records.some((record) => isPrivateIpLiteral(record.address))) {
		throw new Error('That audio link is not allowed')
	}
}

function contentLength(response: Response): number | null {
	const raw = response.headers.get('content-length')
	if (!raw) return null
	const value = Number.parseInt(raw, 10)
	return Number.isFinite(value) ? value : null
}

function looksLikeAudioHeader(contentType: string, href: string): boolean {
	const type = contentType.split(';')[0]?.trim().toLowerCase() ?? ''
	if (type.startsWith('audio/') || type === 'application/ogg') return true
	if (type === 'application/octet-stream' && hasAudioExtension(href)) return true
	if (!type && hasAudioExtension(href)) return true
	return false
}

function looksLikeAudioBytes(bytes: Uint8Array, contentType: string, href: string): boolean {
	if (looksLikeAudioHeader(contentType, href)) return true
	if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true
	if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return true
	if (bytes.length >= 4 && bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return true
	if (bytes.length >= 4 && bytes[0] === 0x66 && bytes[1] === 0x4c && bytes[2] === 0x61 && bytes[3] === 0x43) return true
	if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return true
	return false
}
