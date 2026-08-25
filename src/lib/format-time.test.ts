import { describe, expect, it } from 'vitest'
import { formatClock, formatElapsed, formatRelative } from '$lib/format-time'

describe('formatElapsed', () => {
	it('formats minutes and hours', () => {
		expect(formatElapsed(0)).toBe('0:00')
		expect(formatElapsed(5_000)).toBe('0:05')
		expect(formatElapsed(75_000)).toBe('1:15')
		expect(formatElapsed(3_661_000)).toBe('1:01:01')
	})
})

describe('formatClock', () => {
	it('shows hours and minutes in the given locale', () => {
		expect(formatClock(new Date('2026-08-25T14:05:00'), 'en-GB')).toBe('14:05')
	})
})

describe('formatRelative', () => {
	it('names short ages', () => {
		const now = 1_000_000
		expect(formatRelative(now, now)).toBe('just now')
		expect(formatRelative(now - 45_000, now)).toBe('just now')
		expect(formatRelative(now - 120_000, now)).toBe('2m ago')
		expect(formatRelative(now - 3 * 3_600_000, now)).toBe('3h ago')
		expect(formatRelative(now - 2 * 86_400_000, now)).toBe('2d ago')
	})
})
