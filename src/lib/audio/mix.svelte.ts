/**
 * Client mix engine: many looping sources at once (YouTube IFrame players + HTMLAudioElement).
 *
 * YouTube volume is 0–100; HTMLAudio volume is 0–1. We store 0–1 everywhere and convert at the edge.
 * Players live in `#mix-stage` so filtering the grid does not tear down audio.
 */
import type { MixSnapshot, Sound } from '$lib/types'
import { evenLevel } from '$lib/library'
import { MIX_CAPTURE_EVENT } from '$lib/mix-capture'
import { loadYouTubeApi, mixStage } from './youtube'

const STORAGE_KEY = 'zenzei:mix:v2'
/** Full level so mixing is done by turning layers down, not up from ~75%. */
const DEFAULT_VOLUME = 1
const FADE_IN_MS = 700
const FADE_OUT_MS = 420

export type MixChannel = {
	playing: boolean
	volume: number
	name: string
	kind: Sound['kind']
	category: string
}

type Runtime = {
	kind: Sound['kind']
	audio?: HTMLAudioElement
	player?: YT.Player
	mount?: HTMLElement
}

function clamp(value: number): number {
	return Math.min(1, Math.max(0, value))
}

function readSnapshot(): MixSnapshot | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw) as MixSnapshot
	} catch {
		return null
	}
}

class MixEngine {
	masterVolume = $state(1)
	channels = $state<Record<string, MixChannel>>({})
	errors = $state<Record<string, string>>({})
	pendingResume = $state(false)
	/** True after Space paused every layer; Continue / Space restores them. */
	held = $state(false)
	/** Layer currently soloed; others are ducked out until solo is cleared. */
	soloId = $state<string | null>(null)
	sleepUntil = $state<number | null>(null)
	/** When the current listening session started; cleared when the mix is fully stopped. */
	sessionStartedAt = $state<number | null>(null)
	/** Layer last played or volume-nudged; `{` `}` and the chip wheel target this. */
	lastLayerId = $state<string | null>(null)

	#runtimes = new Map<string, Runtime>()
	#desiredPlaying = new Set<string>()
	#heldIds: string[] = []
	#soloReturn: string[] = []
	#pausing = new Set<string>()
	#gains = new Map<string, number>()
	#ramps = new Map<string, { token: number; timer: ReturnType<typeof setTimeout> | null }>()
	#rampSeq = 0
	#lastMaster = 1
	#sleepTimer: ReturnType<typeof setTimeout> | null = null
	#fadeTimer: ReturnType<typeof setTimeout> | null = null
	#masterBeforeFade: number | null = null

	constructor() {
		if (typeof window === 'undefined') return
		const snap = readSnapshot()
		if (!snap) return
		this.masterVolume = clamp(snap.masterVolume ?? 1)
		if (this.masterVolume > 0) this.#lastMaster = this.masterVolume
		for (const [id, channel] of Object.entries(snap.channels ?? {})) {
			this.channels[id] = {
				playing: false,
				volume: clamp(channel.volume ?? DEFAULT_VOLUME),
				name: '',
				kind: 'file',
				category: ''
			}
			if (channel.playing) this.#desiredPlaying.add(id)
		}
		this.pendingResume = this.#desiredPlaying.size > 0
		if (snap.sleepUntil && snap.sleepUntil > Date.now()) {
			this.sleepUntil = snap.sleepUntil
			this.#armSleep()
		}
	}

	get playingIds(): string[] {
		return Object.entries(this.channels)
			.filter(([, channel]) => channel.playing)
			.map(([id]) => id)
	}

	isPlaying(id: string): boolean {
		return this.channels[id]?.playing === true
	}

	volumeOf(id: string): number {
		return this.channels[id]?.volume ?? DEFAULT_VOLUME
	}

	async toggle(sound: Sound): Promise<void> {
		if (this.isPlaying(sound.id)) this.pause(sound.id)
		else await this.play(sound)
	}

	async play(sound: Sound): Promise<void> {
		this.held = false
		this.#heldIds = []
		this.#pausing.delete(sound.id)
		this.soloId = null
		this.#soloReturn = []
		this.errors[sound.id] = ''
		this.#ensureChannel(sound)
		this.channels[sound.id] = {
			...this.channels[sound.id],
			playing: true,
			name: sound.name,
			kind: sound.kind,
			category: sound.category.slug
		}
		this.#desiredPlaying.add(sound.id)
		if (!this.sessionStartedAt) this.sessionStartedAt = Date.now()
		this.#gains.set(sound.id, 0)
		this.#cancelRamp(sound.id)

		try {
			if (sound.kind === 'youtube') await this.#playYouTube(sound)
			else await this.#playFile(sound)
			this.#applyVolume(sound.id)
			this.lastLayerId = sound.id
			this.#persist()
			void this.#ramp(sound.id, 1, FADE_IN_MS)
		} catch (error) {
			this.channels[sound.id] = { ...this.channels[sound.id], playing: false }
			this.errors[sound.id] = error instanceof Error ? error.message : 'Could not play'
			if (!this.held && this.playingIds.length === 0) this.sessionStartedAt = null
			this.#persist()
		}
	}

	pause(id: string, immediate = false): void {
		this.#desiredPlaying.delete(id)
		if (this.soloId === id) {
			this.soloId = null
			this.#soloReturn = []
		}
		if (immediate || prefersReducedMotion()) {
			this.#hardPause(id)
			return
		}
		if (this.#pausing.has(id) || !this.channels[id]?.playing) {
			this.#hardPause(id)
			return
		}
		this.#pausing.add(id)
		void this.#ramp(id, 0, FADE_OUT_MS).then(() => {
			this.#pausing.delete(id)
			if (this.#desiredPlaying.has(id)) return
			this.#hardPause(id)
		})
	}

	stopAll(): void {
		this.#capture()
		this.clearSleep()
		this.held = false
		this.#heldIds = []
		this.soloId = null
		this.#soloReturn = []
		for (const id of Object.keys(this.channels)) this.pause(id, true)
		this.pendingResume = false
		this.#desiredPlaying.clear()
		this.sessionStartedAt = null
		this.lastLayerId = null
		this.#persist()
	}

	toggleSolo(id: string, sounds: Sound[]): void {
		if (this.soloId === id) {
			const restore = this.#soloReturn
			this.soloId = null
			this.#soloReturn = []
			for (const other of restore) {
				if (other === id || this.isPlaying(other)) continue
				const sound = sounds.find((item) => item.id === other)
				if (sound) void this.play(sound)
			}
			return
		}
		if (!this.isPlaying(id)) return
		const ids = this.playingIds
		this.#soloReturn = ids
		this.soloId = id
		for (const other of ids) {
			if (other !== id) this.pause(other, true)
		}
	}

	/** Pause every playing layer without wiping volumes or the sleep timer. */
	pausePlaying(): void {
		const ids = this.playingIds
		if (!ids.length) return
		this.#heldIds = ids
		this.held = true
		for (const id of ids) this.pause(id)
	}

	async resumeHeld(sounds: Sound[]): Promise<void> {
		const ids = this.#heldIds
		this.#heldIds = []
		this.held = false
		for (const id of ids) {
			const sound = sounds.find((item) => item.id === id)
			if (sound) await this.play(sound)
		}
	}

	async toggleHeld(sounds: Sound[]): Promise<void> {
		if (this.playingIds.length) this.pausePlaying()
		else if (this.held) await this.resumeHeld(sounds)
	}

	async applyMix(layers: { sound: Sound; volume: number }[], master?: number): Promise<void> {
		this.pendingResume = false
		this.held = false
		this.#heldIds = []
		for (const id of this.playingIds) this.pause(id, true)
		this.#desiredPlaying.clear()
		if (master != null) this.setMasterVolume(master)
		for (const layer of layers) {
			this.setVolume(layer.sound.id, layer.volume)
			await this.play(layer.sound)
		}
		this.#capture()
	}

	toggleMute(): void {
		if (this.masterVolume > 0.001) {
			this.#lastMaster = this.masterVolume
			this.setMasterVolume(0)
			return
		}
		this.setMasterVolume(this.#lastMaster > 0.001 ? this.#lastMaster : 1)
	}

	/** Minutes from now, or null to cancel. Fades out over the last 20 seconds. */
	setSleepMinutes(minutes: number | null): void {
		this.clearSleep()
		if (!minutes || minutes <= 0) {
			this.#persist()
			return
		}
		this.sleepUntil = Date.now() + minutes * 60 * 1000
		this.#armSleep()
		this.#persist()
	}

	clearSleep(): void {
		this.#clearSleepTimers()
		if (this.#masterBeforeFade != null) {
			this.masterVolume = this.#masterBeforeFade
			this.#applyAllVolumes()
			this.#masterBeforeFade = null
		}
		this.sleepUntil = null
	}

	setVolume(id: string, volume: number): void {
		if (!this.channels[id]) {
			this.channels[id] = { playing: false, volume: clamp(volume), name: '', kind: 'file', category: '' }
		} else {
			this.channels[id] = { ...this.channels[id], volume: clamp(volume) }
		}
		this.#applyVolume(id)
		this.#persist()
	}

	setMasterVolume(volume: number): void {
		this.masterVolume = clamp(volume)
		if (this.masterVolume > 0) this.#lastMaster = this.masterVolume
		for (const id of this.#runtimes.keys()) this.#applyVolume(id)
		this.#persist()
	}

	/** Step master volume; `[` / `]` on the mixer. */
	nudgeMaster(delta: number): void {
		this.setMasterVolume(this.masterVolume + delta)
	}

	/** Step one playing layer; `{` `}` or the mix-bar chip wheel. */
	nudgeLayer(id: string | null, delta: number): void {
		const ids = this.playingIds
		if (!ids.length) return
		const target =
			(id && ids.includes(id) ? id : null) ?? (this.lastLayerId && ids.includes(this.lastLayerId) ? this.lastLayerId : null) ?? ids[ids.length - 1]
		if (!target) return
		this.setVolume(target, this.volumeOf(target) + delta)
		this.lastLayerId = target
	}

	/** Set every playing layer to the average of their current volumes. */
	evenVolumes(): void {
		const ids = this.playingIds
		if (ids.length < 2) return
		const level = evenLevel(ids.map((id) => this.volumeOf(id)))
		for (const id of ids) this.setVolume(id, level)
	}

	async resumeMix(sounds: Sound[]): Promise<void> {
		this.pendingResume = false
		const ids = [...this.#desiredPlaying]
		for (const id of ids) {
			const sound = sounds.find((item) => item.id === id)
			if (sound) await this.play(sound)
		}
	}

	dismissResume(): void {
		this.pendingResume = false
		this.#desiredPlaying.clear()
		this.#persist()
	}

	#ensureChannel(sound: Sound): void {
		if (this.channels[sound.id]) {
			this.channels[sound.id] = {
				...this.channels[sound.id],
				name: sound.name,
				kind: sound.kind,
				category: sound.category.slug
			}
			return
		}
		this.channels[sound.id] = {
			playing: false,
			volume: DEFAULT_VOLUME,
			name: sound.name,
			kind: sound.kind,
			category: sound.category.slug
		}
	}

	#effective(id: string): number {
		const fade = this.#gains.get(id) ?? 1
		return clamp((this.channels[id]?.volume ?? DEFAULT_VOLUME) * this.masterVolume * fade)
	}

	#hardPause(id: string): void {
		this.#cancelRamp(id)
		this.#pausing.delete(id)
		this.#gains.set(id, 1)
		const runtime = this.#runtimes.get(id)
		runtime?.audio?.pause()
		runtime?.player?.pauseVideo()
		if (this.channels[id]) this.channels[id] = { ...this.channels[id], playing: false }
		this.#applyVolume(id)
		if (!this.held && this.playingIds.length === 0) this.sessionStartedAt = null
		this.#persist()
	}

	#cancelRamp(id: string): void {
		const ramp = this.#ramps.get(id)
		if (ramp?.timer) clearTimeout(ramp.timer)
		this.#ramps.delete(id)
	}

	#ramp(id: string, to: number, ms: number): Promise<void> {
		this.#cancelRamp(id)
		const duration = prefersReducedMotion() ? 0 : ms
		const from = this.#gains.get(id) ?? 1
		if (duration <= 0 || Math.abs(from - to) < 0.02) {
			this.#gains.set(id, to)
			this.#applyVolume(id)
			return Promise.resolve()
		}
		const token = ++this.#rampSeq
		this.#ramps.set(id, { token, timer: null })
		const started = Date.now()
		return new Promise((resolve) => {
			const tick = () => {
				const ramp = this.#ramps.get(id)
				if (!ramp || ramp.token !== token) {
					resolve()
					return
				}
				const t = Math.min(1, (Date.now() - started) / duration)
				const eased = t * t * (3 - 2 * t)
				this.#gains.set(id, from + (to - from) * eased)
				this.#applyVolume(id)
				if (t >= 1) {
					this.#ramps.delete(id)
					resolve()
					return
				}
				ramp.timer = setTimeout(tick, 32)
			}
			tick()
		})
	}

	#applyVolume(id: string): void {
		const runtime = this.#runtimes.get(id)
		const volume = this.#effective(id)
		if (runtime?.audio) runtime.audio.volume = volume
		try {
			runtime?.player?.setVolume(Math.round(volume * 100))
		} catch {
			// Player may not be ready yet; onReady applies volume again.
		}
	}

	#applyAllVolumes(): void {
		for (const id of this.#runtimes.keys()) this.#applyVolume(id)
	}

	#armSleep(): void {
		if (!this.sleepUntil) return
		const ms = this.sleepUntil - Date.now()
		const fadeMs = 20_000
		if (ms <= 0) {
			this.#finishSleep()
			return
		}
		if (ms > fadeMs) {
			this.#sleepTimer = setTimeout(() => this.#startSleepFade(), ms - fadeMs)
		} else {
			this.#startSleepFade()
		}
	}

	#startSleepFade(): void {
		this.#masterBeforeFade = this.masterVolume
		const from = this.masterVolume
		const started = Date.now()
		const tick = () => {
			const t = Math.min(1, (Date.now() - started) / 20_000)
			this.masterVolume = from * (1 - t)
			this.#applyAllVolumes()
			if (t >= 1) {
				this.#finishSleep()
				return
			}
			this.#fadeTimer = setTimeout(tick, 200)
		}
		tick()
	}

	#finishSleep(): void {
		this.#clearSleepTimers()
		const restore = this.#masterBeforeFade
		this.#masterBeforeFade = null
		this.sleepUntil = null
		for (const id of Object.keys(this.channels)) this.pause(id, true)
		this.pendingResume = false
		this.#desiredPlaying.clear()
		this.sessionStartedAt = null
		if (restore != null) {
			this.masterVolume = restore
			this.#applyAllVolumes()
		}
		this.#persist()
	}

	#clearSleepTimers(): void {
		if (this.#sleepTimer) clearTimeout(this.#sleepTimer)
		if (this.#fadeTimer) clearTimeout(this.#fadeTimer)
		this.#sleepTimer = null
		this.#fadeTimer = null
	}

	async #playFile(sound: Sound): Promise<void> {
		if (!sound.audioUrl) throw new Error('This sound has no audio file')
		let runtime = this.#runtimes.get(sound.id)
		if (!runtime?.audio) {
			const audio = new Audio(sound.audioUrl)
			audio.loop = true
			audio.preload = 'auto'
			runtime = { kind: 'file', audio }
			this.#runtimes.set(sound.id, runtime)
		}
		this.#applyVolume(sound.id)
		await runtime.audio!.play()
	}

	async #playYouTube(sound: Sound): Promise<void> {
		if (!sound.youtubeVideoId) throw new Error('This sound has no YouTube video')
		await loadYouTubeApi()

		const existing = this.#runtimes.get(sound.id)
		if (existing?.player) {
			this.#applyVolume(sound.id)
			existing.player.playVideo()
			return
		}

		const mount = document.createElement('div')
		mount.id = `yt-${sound.id}`
		mixStage().appendChild(mount)

		const player = await new Promise<YT.Player>((resolve, reject) => {
			const instance = new window.YT!.Player(mount.id, {
				width: 1,
				height: 1,
				videoId: sound.youtubeVideoId!,
				host: 'https://www.youtube-nocookie.com',
				playerVars: {
					autoplay: 1,
					controls: 0,
					disablekb: 1,
					fs: 0,
					iv_load_policy: 3,
					// playlist + loop is required; loop alone does not restart a single video.
					loop: 1,
					playlist: sound.youtubeVideoId!,
					modestbranding: 1,
					playsinline: 1,
					rel: 0,
					origin: window.location.origin
				},
				events: {
					onReady: (event) => {
						event.target.setVolume(Math.round(this.#effective(sound.id) * 100))
						event.target.playVideo()
						resolve(instance)
					},
					onStateChange: (event) => {
						if (event.data === window.YT?.PlayerState.ENDED) {
							event.target.playVideo()
						}
					},
					onError: () => {
						this.errors[sound.id] = 'YouTube could not play this video (embedding may be disabled)'
						this.pause(sound.id, true)
						reject(new Error(this.errors[sound.id]))
					}
				}
			})
		})

		this.#runtimes.set(sound.id, { kind: 'youtube', player, mount })
	}

	#capture(): void {
		if (typeof window === 'undefined') return
		const layers = this.playingIds.map((id) => ({
			id,
			volume: this.volumeOf(id),
			name: this.channels[id]?.name ?? ''
		}))
		if (layers.length < 2) return
		window.dispatchEvent(new CustomEvent(MIX_CAPTURE_EVENT, { detail: { master: this.masterVolume, layers } }))
	}

	#persist(): void {
		if (typeof window === 'undefined') return
		const snapshot: MixSnapshot = {
			masterVolume: this.masterVolume,
			channels: {},
			sleepUntil: this.sleepUntil
		}
		for (const [id, channel] of Object.entries(this.channels)) {
			snapshot.channels[id] = {
				playing: channel.playing || this.#desiredPlaying.has(id),
				volume: channel.volume
			}
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
	}
}

export const mix = new MixEngine()

function prefersReducedMotion(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
