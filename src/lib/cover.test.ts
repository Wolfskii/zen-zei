import { describe, expect, it } from 'vitest'
import { VISUAL_ICON, isIconCover, publicCoverUrl, tileLookFromCoverUrl } from '$lib/cover'

describe('publicCoverUrl', () => {
	it('uses the uploaded cover route when a file is stored', () => {
		expect(publicCoverUrl('abc', 'covers/abc.jpg', 'NI0M03vCoXg')).toBe('/api/v1/sounds/abc/cover')
	})

	it('hides YouTube stills when the operator chose an icon', () => {
		expect(publicCoverUrl('abc', VISUAL_ICON, 'NI0M03vCoXg')).toBeNull()
		expect(isIconCover(VISUAL_ICON)).toBe(true)
		expect(tileLookFromCoverUrl(null)).toBe('icon')
	})

	it('falls back to a YouTube still when no cover is stored', () => {
		expect(publicCoverUrl('abc', null, 'NI0M03vCoXg')).toContain('maxresdefault.jpg')
	})
})
