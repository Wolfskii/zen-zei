/**
 * Loads the YouTube IFrame API once per page.
 * The global callback `onYouTubeIframeAPIReady` can only be assigned usefully once,
 * so every tile must share this promise instead of injecting its own script.
 */
let loading: Promise<void> | null = null

export function loadYouTubeApi(): Promise<void> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('YouTube API is browser-only'))
	}
	if (window.YT?.Player) return Promise.resolve()
	if (loading) return loading

	loading = new Promise((resolve, reject) => {
		const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]')
		if (!existing) {
			const tag = document.createElement('script')
			tag.src = 'https://www.youtube.com/iframe_api'
			tag.async = true
			tag.onerror = () => reject(new Error('Failed to load YouTube IFrame API'))
			document.head.appendChild(tag)
		}

		const previous = window.onYouTubeIframeAPIReady
		window.onYouTubeIframeAPIReady = () => {
			previous?.()
			resolve()
		}

		if (window.YT?.Player) resolve()
	})

	return loading
}

/** Off-screen mount for IFrame players so cards can unmount without killing audio. */
export function mixStage(): HTMLElement {
	let stage = document.getElementById('mix-stage')
	if (!stage) {
		stage = document.createElement('div')
		stage.id = 'mix-stage'
		stage.setAttribute('aria-hidden', 'true')
		document.body.appendChild(stage)
	}
	return stage
}
