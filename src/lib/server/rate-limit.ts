const buckets = new Map<string, { count: number; resetAt: number }>()

/**
 * Tiny per-process limiter. Enough for a single Dokploy replica.
 * Key is usually the client IP.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
	const now = Date.now()
	const bucket = buckets.get(key)
	if (!bucket || now >= bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs })
		return true
	}
	if (bucket.count >= max) return false
	bucket.count += 1
	return true
}

export function clientKey(event: { getClientAddress: () => string }): string {
	return event.getClientAddress()
}
