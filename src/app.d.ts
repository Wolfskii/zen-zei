// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	interface Window {
		// eslint-disable-next-line no-undef
		YT: typeof YT
		onYouTubeIframeAPIReady: () => void
	}
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {}
