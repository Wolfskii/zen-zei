import { describe, expect, it } from 'vitest'
import { daypart } from '$lib/daypart'

describe('daypart', () => {
	it('maps hours to a greeting and a scene hint', () => {
		expect(daypart(new Date('2026-08-25T08:00:00')).hello).toBe('Good morning')
		expect(daypart(new Date('2026-08-25T08:00:00')).line).toContain('thin')
		expect(daypart(new Date('2026-08-25T08:00:00')).suggest).toBe('focus')
		expect(daypart(new Date('2026-08-25T08:00:00')).tone).toBe('morning')
		expect(daypart(new Date('2026-08-25T15:00:00')).hello).toBe('Good afternoon')
		expect(daypart(new Date('2026-08-25T19:00:00')).suggest).toBe('cabin')
		expect(daypart(new Date('2026-08-25T19:00:00')).tone).toBe('evening')
		expect(daypart(new Date('2026-08-25T23:30:00'))).toEqual({
			hello: 'Good night',
			line: 'Let the low sounds sit closer than the rest.',
			suggest: 'sleep',
			tone: 'night'
		})
		expect(daypart(new Date('2026-08-25T02:00:00')).suggest).toBe('sleep')
	})
})
