/**
 * Client mix engine: many looping sources at once (YouTube IFrame players + HTMLAudioElement).
 *
 * YouTube volume is 0–100; HTMLAudio volume is 0–1. We store 0–1 everywhere and convert at the edge.
 * Players live in `#mix-stage` so filtering the grid does not tear down audio.
 */
import type { MixSnapshot, Sound } from '$lib/types'
import { loadYouTubeApi, mixStage } from './youtube'

const STORAGE_KEY = 'zenzei:mix'
const DEFAULT_VOLUME = 0.72

export type MixChannel = {
	playing: boolean
	volume: number
	name: string
	kind: Sound['kind']
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

	#runtimes = new Map<string, Runtime>()
	#desiredPlaying = new Set<string>()

	constructor() {
		if (typeof window === 'undefined') return
		const snap = readSnapshot()
		if (!snap) return
		this.masterVolume = clamp(snap.masterVolume ?? 1)
		for (const [id, channel] of Object.entries(snap.channels ?? {})) {
			this.channels[id] = {
				playing: false,
				volume: clamp(channel.volume ?? DEFAULT_VOLUME),
				name: '',
				kind: 'file'
			}
			if (channel.playing) this.#desiredPlaying.add(id)
		}
		this.pendingResume = this.#desiredPlaying.size > 0
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
		this.errors[sound.id] = ''
		this.#ensureChannel(sound)
		this.channels[sound.id] = { ...this.channels[sound.id], playing: true, name: sound.name, kind: sound.kind }
		this.#desiredPlaying.add(sound.id)

		try {
			if (sound.kind === 'youtube') await this.#playYouTube(sound)
			else await this.#playFile(sound)
			this.#applyVolume(sound.id)
			this.#persist()
		} catch (error) {
			this.channels[sound.id] = { ...this.channels[sound.id], playing: false }
			this.errors[sound.id] = error instanceof Error ? error.message : 'Could not play'
			this.#persist()
		}
	}

	pause(id: string): void {
		const runtime = this.#runtimes.get(id)
		runtime?.audio?.pause()
		runtime?.player?.pauseVideo()
		if (this.channels[id]) this.channels[id] = { ...this.channels[id], playing: false }
		this.#desiredPlaying.delete(id)
		this.#persist()
	}

	stopAll(): void {
		for (const id of Object.keys(this.channels)) this.pause(id)
		this.pendingResume = false
		this.#desiredPlaying.clear()
		this.#persist()
	}

	setVolume(id: string, volume: number): void {
		if (!this.channels[id]) {
			this.channels[id] = { playing: false, volume: clamp(volume), name: '', kind: 'file' }
		} else {
			this.channels[id] = { ...this.channels[id], volume: clamp(volume) }
		}
		this.#applyVolume(id)
		this.#persist()
	}

	setMasterVolume(volume: number): void {
		this.masterVolume = clamp(volume)
		for (const id of this.#runtimes.keys()) this.#applyVolume(id)
		this.#persist()
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
			this.channels[sound.id] = { ...this.channels[sound.id], name: sound.name, kind: sound.kind }
			return
		}
		this.channels[sound.id] = { playing: false, volume: DEFAULT_VOLUME, name: sound.name, kind: sound.kind }
	}

	#effective(id: string): number {
		return clamp((this.channels[id]?.volume ?? DEFAULT_VOLUME) * this.masterVolume)
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
						this.pause(sound.id)
						reject(new Error(this.errors[sound.id]))
					}
				}
			})
		})

		this.#runtimes.set(sound.id, { kind: 'youtube', player, mount })
	}

	#persist(): void {
		if (typeof window === 'undefined') return
		const snapshot: MixSnapshot = {
			masterVolume: this.masterVolume,
			channels: {}
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
