// See https://svelte.dev/docs/kit/types#app.d.ts

export {}

declare global {
	namespace App {
		interface Locals {
			/** Anonymous voter cookie — one vote per sound per browser. */
			voterId: string
			/** True when the request carries a valid admin API key. */
			isAdmin: boolean
		}
	}

	interface Window {
		YT?: YT.Namespace
		onYouTubeIframeAPIReady?: () => void
	}

	namespace YT {
		interface Namespace {
			Player: typeof Player
			PlayerState: {
				UNSTARTED: number
				ENDED: number
				PLAYING: number
				PAUSED: number
				BUFFERING: number
				CUED: number
			}
		}

		class Player {
			constructor(elementId: string | HTMLElement, options: PlayerOptions)
			playVideo(): void
			pauseVideo(): void
			stopVideo(): void
			setVolume(volume: number): void
			getVolume(): number
			destroy(): void
		}

		interface PlayerOptions {
			height?: string | number
			width?: string | number
			videoId?: string
			host?: string
			playerVars?: Record<string, string | number>
			events?: {
				onReady?: (event: { target: Player }) => void
				onStateChange?: (event: { data: number; target: Player }) => void
				onError?: (event: { data: number; target: Player }) => void
			}
		}
	}
}
