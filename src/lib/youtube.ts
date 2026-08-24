/**
 * Parse a YouTube watch / share / embed / Shorts URL into an 11-character video id.
 */
export function parseYouTubeVideoId(input: string): string | null {
	const trimmed = input.trim()
	if (!trimmed) return null

	if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

	let url: URL
	try {
		url = new URL(trimmed)
	} catch {
		return null
	}

	const host = url.hostname.replace(/^www\./, '')

	if (host === 'youtu.be') {
		const id = url.pathname.split('/').filter(Boolean)[0]
		return isVideoId(id) ? id : null
	}

	if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
		const v = url.searchParams.get('v')
		if (isVideoId(v)) return v

		const parts = url.pathname.split('/').filter(Boolean)
		if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'v') {
			const id = parts[1]
			return isVideoId(id) ? id : null
		}
	}

	return null
}

function isVideoId(value: string | null | undefined): value is string {
	return typeof value === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(value)
}

export function youtubeThumbnailUrl(videoId: string): string {
	return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function youtubeWatchUrl(videoId: string): string {
	return `https://www.youtube.com/watch?v=${videoId}`
}
