/**
 * Encode a playing mix as `?mix=uuid:80,uuid:50&master=90` so a link can reopen the same layers.
 * Volumes are 0–100 integers in the URL and 0–1 in the mix engine.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type MixLayer = {
	id: string
	volume: number
}

export type SharedMix = {
	master: number
	layers: MixLayer[]
}

function clamp(value: number): number {
	return Math.min(1, Math.max(0, value))
}

function pct(volume: number): number {
	return Math.round(clamp(volume) * 100)
}

export function encodeMixSearch(mix: SharedMix): string {
	const layers = mix.layers.filter((layer) => UUID.test(layer.id))
	if (!layers.length) return ''
	const params = new URLSearchParams()
	params.set(
		'mix',
		layers.map((layer) => `${layer.id}:${pct(layer.volume)}`).join(',')
	)
	params.set('master', String(pct(mix.master)))
	return `?${params.toString()}`
}

export function parseMixSearch(search: string): SharedMix | null {
	const query = search.startsWith('?') ? search.slice(1) : search
	const params = new URLSearchParams(query)
	const raw = params.get('mix')
	if (!raw) return null

	const layers: MixLayer[] = []
	for (const part of raw.split(',')) {
		const trimmed = part.trim()
		if (!trimmed) continue
		const colon = trimmed.lastIndexOf(':')
		const id = colon === -1 ? trimmed : trimmed.slice(0, colon)
		const volRaw = colon === -1 ? '' : trimmed.slice(colon + 1)
		if (!UUID.test(id)) continue
		const parsed = volRaw === '' ? 100 : Number(volRaw)
		layers.push({ id, volume: Number.isFinite(parsed) ? clamp(parsed / 100) : 1 })
	}

	if (!layers.length) return null

	const masterRaw = Number(params.get('master') ?? '100')
	return {
		master: Number.isFinite(masterRaw) ? clamp(masterRaw / 100) : 1,
		layers
	}
}

/** Absolute URL for the mixer with this mix in the query string. */
export function mixPageUrl(href: string, mix: SharedMix): string | null {
	const search = encodeMixSearch(mix)
	if (!search) return null
	const url = new URL(href)
	url.search = search.slice(1)
	url.hash = ''
	return url.toString()
}

export function stripMixSearch(href: string): string {
	const url = new URL(href)
	url.searchParams.delete('mix')
	url.searchParams.delete('master')
	return `${url.pathname}${url.search}${url.hash}`
}

/** Chat-friendly mix: `Rain 100 · Thunder 72 · master 32`. */
export function mixLine(layers: { name: string; volume: number }[], master?: number): string {
	const parts = layers.map((layer) => `${layer.name.trim()} ${pct(layer.volume)}`).filter((part) => !part.startsWith(' '))
	if (!parts.length) return ''
	if (master != null && master < 0.995) return `${parts.join(' · ')} · master ${pct(master)}`
	return parts.join(' · ')
}
