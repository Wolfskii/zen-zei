/** `m:ss` or `h:mm:ss` from a duration in milliseconds. */
export function formatElapsed(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000))
	const hours = Math.floor(total / 3600)
	const minutes = Math.floor((total % 3600) / 60)
	const seconds = total % 60
	if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
	return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatClock(date: Date, locale?: string): string {
	return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}

/** Short age for recents: just now, 5m ago, 3h ago, 2d ago. */
export function formatRelative(then: number, now = Date.now()): string {
	const sec = Math.max(0, Math.floor((now - then) / 1000))
	if (sec < 60) return 'just now'
	const min = Math.floor(sec / 60)
	if (min < 60) return `${min}m ago`
	const hours = Math.floor(min / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}