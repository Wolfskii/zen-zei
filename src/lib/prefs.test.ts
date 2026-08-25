import { beforeEach, describe, expect, it } from 'vitest'
import { loadPrefs, PREFS_STORAGE_KEY, setKeepAwake, setLastScene, setSort, setStill } from '$lib/prefs'

describe('prefs', () => {
	beforeEach(() => {
		const store: Record<string, string> = {}
		Object.defineProperty(globalThis, 'localStorage', {
			configurable: true,
			value: {
				getItem: (key: string) => store[key] ?? null,
				setItem: (key: string, value: string) => {
					store[key] = String(value)
				},
				removeItem: (key: string) => {
					delete store[key]
				}
			}
		})
	})

	it('defaults to keeping the screen on and can be toggled', () => {
		expect(loadPrefs().keepAwake).toBe(true)
		expect(loadPrefs().still).toBe(false)
		setKeepAwake(false)
		expect(loadPrefs().keepAwake).toBe(false)
		expect(JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY) ?? '{}').keepAwake).toBe(false)
		setStill(true)
		expect(loadPrefs().still).toBe(true)
		expect(loadPrefs().sort).toBe('loved')
		setSort('name')
		expect(loadPrefs().sort).toBe('name')
		expect(loadPrefs().lastScene).toBeNull()
		setLastScene('storm')
		expect(loadPrefs().lastScene).toBe('storm')
	})
})
