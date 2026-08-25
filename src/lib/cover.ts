/**
 * How a tile is drawn. `cover_path` is either an uploaded relative file,
 * `visual:icon` (show the Lucide icon, even for YouTube), or null
 * (YouTube still, or icon if there is no video).
 */
import { youtubeThumbnailUrl } from './youtube'

export const VISUAL_ICON = 'visual:icon'

export function isIconCover(coverPath: string | null | undefined): boolean {
	return !!coverPath && coverPath.startsWith('visual:')
}

export function isUploadedCoverPath(coverPath: string | null | undefined): boolean {
	return !!coverPath && !coverPath.startsWith('visual:') && !coverPath.startsWith('bundled:')
}

/** Public URL for the tile photo, or null when the tile should show an icon. */
export function publicCoverUrl(id: string, coverPath: string | null, youtubeVideoId: string | null): string | null {
	if (isIconCover(coverPath)) return null
	if (coverPath) return `/api/v1/sounds/${id}/cover`
	if (youtubeVideoId) return youtubeThumbnailUrl(youtubeVideoId)
	return null
}

export type TileLook = 'picture' | 'icon'

export function tileLookFromCoverUrl(coverUrl: string | null | undefined): TileLook {
	return coverUrl ? 'picture' : 'icon'
}
