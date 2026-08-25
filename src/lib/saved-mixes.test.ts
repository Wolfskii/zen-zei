import { describe, expect, it } from 'vitest'
import { mixNameFromLayers } from '$lib/saved-mixes'

describe('mixNameFromLayers', () => {
	it('joins two names and summarizes longer stacks', () => {
		expect(mixNameFromLayers([])).toBe('Untitled mix')
		expect(mixNameFromLayers(['Rain'])).toBe('Rain')
		expect(mixNameFromLayers(['Rain', 'Thunder'])).toBe('Rain + Thunder')
		expect(mixNameFromLayers(['Rain', 'Thunder', 'Fireplace'])).toBe('Rain + 2 more')
	})
})
