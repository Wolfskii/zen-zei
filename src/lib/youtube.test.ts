import { describe, expect, it } from 'vitest'
import { parseYouTubeVideoId } from '$lib/youtube'

describe('parseYouTubeVideoId', () => {
	it('accepts a bare id', () => {
		expect(parseYouTubeVideoId('NI0M03vCoXg')).toBe('NI0M03vCoXg')
	})

	it('parses watch, share, embed, and Shorts URLs', () => {
		expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=NI0M03vCoXg')).toBe('NI0M03vCoXg')
		expect(parseYouTubeVideoId('https://youtu.be/NI0M03vCoXg')).toBe('NI0M03vCoXg')
		expect(parseYouTubeVideoId('https://www.youtube.com/embed/NI0M03vCoXg')).toBe('NI0M03vCoXg')
		expect(parseYouTubeVideoId('https://www.youtube.com/shorts/NI0M03vCoXg')).toBe('NI0M03vCoXg')
	})

	it('rejects junk', () => {
		expect(parseYouTubeVideoId('https://example.com')).toBeNull()
		expect(parseYouTubeVideoId('')).toBeNull()
	})
})
