import { describe, expect, it } from 'vitest'
import { parseDirectAudioUrl, suggestedNameFromAudioUrl } from '$lib/audio-url'

describe('parseDirectAudioUrl', () => {
	it('accepts https mp3 and wav links', () => {
		expect(parseDirectAudioUrl('https://cdn.example.com/rain.mp3')).toBe('https://cdn.example.com/rain.mp3')
		expect(parseDirectAudioUrl('https://cdn.example.com/loop.wav?token=1')).toBe('https://cdn.example.com/loop.wav?token=1')
	})

	it('rejects YouTube, localhost, and private hosts', () => {
		expect(parseDirectAudioUrl('https://www.youtube.com/watch?v=NI0M03vCoXg')).toBeNull()
		expect(parseDirectAudioUrl('http://localhost/rain.mp3')).toBeNull()
		expect(parseDirectAudioUrl('http://127.0.0.1/rain.wav')).toBeNull()
		expect(parseDirectAudioUrl('http://192.168.1.9/a.mp3')).toBeNull()
		expect(parseDirectAudioUrl('not a url')).toBeNull()
	})

	it('names a tile from the file path', () => {
		expect(suggestedNameFromAudioUrl('https://cdn.example.com/soft-rain.mp3')).toBe('soft rain')
	})
})
