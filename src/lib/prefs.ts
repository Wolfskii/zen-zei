export const PREFS_STORAGE_KEY = 'zenzei:prefs:v1'
export const PREFS_EVENT = 'zenzei:prefs'

export type ScenePref = 'storm' | 'sleep' | 'cabin' | 'focus'

export type Prefs = {
	/** Request a screen wake lock while a mix is playing (phones, overnight). */
	keepAwake: boolean
	/** Pause the background video; keep fog and mix tints. */
	still: boolean
	/** Library order. */
	sort: 'loved' | 'name' | 'new'
	/** Last named scene started on this device. */
	lastScene: ScenePref | null
}

export function defaultPrefs(): Prefs {
	return { keepAwake: true, still: prefersStill(), sort: 'loved', lastScene: null }
}

export function loadPrefs(): Prefs {
	if (typeof localStorage === 'undefined') return defaultPrefs()
	try {
		const raw = localStorage.getItem(PREFS_STORAGE_KEY)
		if (!raw) return defaultPrefs()
		const parsed = JSON.parse(raw) as Partial<Prefs>
		return {
			keepAwake: parsed.keepAwake !== false,
			still: typeof parsed.still === 'boolean' ? parsed.still : prefersStill(),
			sort: parsed.sort === 'name' || parsed.sort === 'new' ? parsed.sort : 'loved',
			lastScene: parseScene(parsed.lastScene)
		}
	} catch {
		return defaultPrefs()
	}
}

export function persistPrefs(prefs: Prefs): Prefs {
	if (typeof localStorage === 'undefined') return prefs
	localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs))
	if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: prefs }))
	return prefs
}

export function setKeepAwake(keepAwake: boolean, prefs = loadPrefs()): Prefs {
	return persistPrefs({ ...prefs, keepAwake })
}

export function setStill(still: boolean, prefs = loadPrefs()): Prefs {
	return persistPrefs({ ...prefs, still })
}

export function setSort(sort: Prefs['sort'], prefs = loadPrefs()): Prefs {
	return persistPrefs({ ...prefs, sort })
}

export function setLastScene(lastScene: ScenePref, prefs = loadPrefs()): Prefs {
	return persistPrefs({ ...prefs, lastScene })
}

function parseScene(value: unknown): ScenePref | null {
	if (value === 'storm' || value === 'sleep' || value === 'cabin' || value === 'focus') return value
	return null
}

function prefersStill(): boolean {
	if (typeof matchMedia === 'undefined') return false
	try {
		return matchMedia('(prefers-reduced-motion: reduce)').matches
	} catch {
		return false
	}
}
