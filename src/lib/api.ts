import type { Category, Sound } from '$lib/types'

export class ApiError extends Error {
	status: number
	constructor(message: string, status: number) {
		super(message)
		this.status = status
	}
}

function adminHeaders(): HeadersInit {
	if (typeof sessionStorage === 'undefined') return {}
	const key = sessionStorage.getItem('zenzei:admin')
	return key ? { 'x-admin-key': key } : {}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers)
	const extra = adminHeaders()
	for (const [key, value] of Object.entries(extra)) headers.set(key, value)
	if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
		headers.set('content-type', 'application/json')
	}

	const response = await fetch(path, { ...init, headers })
	const data = await response.json().catch(() => ({}))
	if (!response.ok) {
		throw new ApiError(data?.error?.message ?? 'Request failed', response.status)
	}
	return data as T
}

export const api = {
	previewYouTube: (url: string) =>
		request<{ videoId: string; title: string; thumbnailUrl: string; watchUrl: string }>(
			`/api/v1/youtube/preview?url=${encodeURIComponent(url)}`
		),
	previewAudio: (url: string) =>
		request<{ url: string; contentType: string; suggestedName: string }>(`/api/v1/audio/preview?url=${encodeURIComponent(url)}`),
	createYouTube: (body: { name: string; description: string; categoryId: string; icon: string | null; youtubeUrl: string }) =>
		request<{ sound: Sound }>('/api/v1/sounds', { method: 'POST', body: JSON.stringify(body) }),
	create: (form: FormData) => request<{ sound: Sound }>('/api/v1/sounds', { method: 'POST', body: form }),
	createFile: (form: FormData) => request<{ sound: Sound }>('/api/v1/sounds', { method: 'POST', body: form }),
	vote: (id: string, stars: number) => request<{ sound: Sound }>(`/api/v1/sounds/${id}/vote`, { method: 'POST', body: JSON.stringify({ stars }) }),
	update: (id: string, body: Record<string, unknown>) => request<{ sound: Sound }>(`/api/v1/sounds/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
	updateForm: (id: string, form: FormData) => request<{ sound: Sound }>(`/api/v1/sounds/${id}`, { method: 'PATCH', body: form }),
	remove: (id: string) => request<{ ok: boolean }>(`/api/v1/sounds/${id}`, { method: 'DELETE' }),
	categories: () => request<{ categories: Category[] }>('/api/v1/categories'),
	adminSession: () => request<{ ok: boolean }>('/api/v1/admin/session')
}

export function setAdminKey(key: string): void {
	if (key) sessionStorage.setItem('zenzei:admin', key)
	else sessionStorage.removeItem('zenzei:admin')
}

export function hasAdminKey(): boolean {
	return typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('zenzei:admin')
}
