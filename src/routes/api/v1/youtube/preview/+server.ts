import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { jsonError } from '$lib/server/http'
import { parseYouTubeVideoId, youtubeThumbnailUrl, youtubeWatchUrl } from '$lib/youtube'

type OEmbed = { title?: string; thumbnail_url?: string; author_name?: string }

/** Server-side oEmbed so the add-sound form can fill name + thumbnail without browser CORS. */
export const GET: RequestHandler = async ({ url }) => {
	const raw = url.searchParams.get('url') ?? ''
	const videoId = parseYouTubeVideoId(raw)
	if (!videoId) return jsonError('Paste a valid YouTube URL', 400, 'invalid_youtube_url')

	const watch = youtubeWatchUrl(videoId)
	try {
		const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`)
		if (!response.ok) {
			return json({
				videoId,
				title: '',
				thumbnailUrl: youtubeThumbnailUrl(videoId),
				watchUrl: watch
			})
		}
		const data = (await response.json()) as OEmbed
		return json({
			videoId,
			title: data.title ?? '',
			thumbnailUrl: youtubeThumbnailUrl(videoId),
			watchUrl: watch
		})
	} catch {
		return json({
			videoId,
			title: '',
			thumbnailUrl: youtubeThumbnailUrl(videoId),
			watchUrl: watch
		})
	}
}
