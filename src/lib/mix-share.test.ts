import { describe, expect, it } from 'vitest'
import { encodeMixSearch, mixLine, mixPageUrl, parseMixSearch, stripMixSearch } from '$lib/mix-share'

const rain = '00000000-0000-4000-8000-000000000011'
const thunder = '00000000-0000-4000-8000-000000000012'

describe('mix share URLs', () => {
	it('round-trips layers and master volume', () => {
		const search = encodeMixSearch({
			master: 0.9,
			layers: [
				{ id: rain, volume: 1 },
				{ id: thunder, volume: 0.72 }
			]
		})
		expect(search).toContain(rain)
		const parsed = parseMixSearch(search)
		expect(parsed?.master).toBe(0.9)
		expect(parsed?.layers).toEqual([
			{ id: rain, volume: 1 },
			{ id: thunder, volume: 0.72 }
		])
	})

	it('ignores junk ids and empty mix', () => {
		expect(parseMixSearch('?mix=not-a-uuid:80')).toBeNull()
		expect(parseMixSearch('')).toBeNull()
		expect(encodeMixSearch({ master: 1, layers: [{ id: 'nope', volume: 1 }] })).toBe('')
	})

	it('defaults missing volume to full and missing master to 1', () => {
		expect(parseMixSearch(`?mix=${rain}`)).toEqual({
			master: 1,
			layers: [{ id: rain, volume: 1 }]
		})
	})

	it('builds and strips a mixer href', () => {
		const href = mixPageUrl('https://zen.example/mixer?x=1#z', {
			master: 1,
			layers: [{ id: rain, volume: 0.5 }]
		})
		expect(href).toBe(`https://zen.example/mixer?mix=${rain}%3A50&master=100`)
		expect(stripMixSearch(href!)).toBe('/mixer')
	})
})

describe('mixLine', () => {
	it('joins names, percents, and a quiet master', () => {
		expect(mixLine([])).toBe('')
		expect(
			mixLine(
				[
					{ name: 'Rain', volume: 1 },
					{ name: 'Thunder', volume: 0.72 }
				],
				1
			)
		).toBe('Rain 100 · Thunder 72')
		expect(mixLine([{ name: 'Rain', volume: 0.86 }], 0.32)).toBe('Rain 86 · master 32')
	})
})
