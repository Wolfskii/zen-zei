import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { Readable } from 'node:stream'
import { error } from '@sveltejs/kit'

const MIME: Record<string, string> = {
	'.mp3': 'audio/mpeg',
	'.wav': 'audio/wav',
	'.ogg': 'audio/ogg',
	'.webm': 'audio/webm',
	'.m4a': 'audio/mp4',
	'.flac': 'audio/flac',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif'
}

/**
 * Stream a local file, including `Range` so `<audio>` can seek 12 MB WAVs.
 */
export async function fileResponse(path: string, request: Request): Promise<Response> {
	let info
	try {
		info = await stat(path)
	} catch {
		throw error(404, 'File missing')
	}

	const mime = MIME[extname(path).toLowerCase()] ?? 'application/octet-stream'
	const range = request.headers.get('range')

	if (range) {
		const match = /bytes=(\d*)-(\d*)/.exec(range)
		if (!match) throw error(416, 'Invalid range')
		const start = match[1] ? Number(match[1]) : 0
		const end = match[2] ? Number(match[2]) : info.size - 1
		if (start >= info.size || end >= info.size) {
			return new Response(null, {
				status: 416,
				headers: { 'Content-Range': `bytes */${info.size}` }
			})
		}
		const stream = createReadStream(path, { start, end })
		return new Response(Readable.toWeb(stream) as ReadableStream, {
			status: 206,
			headers: {
				'Content-Type': mime,
				'Content-Length': String(end - start + 1),
				'Content-Range': `bytes ${start}-${end}/${info.size}`,
				'Accept-Ranges': 'bytes',
				'Cache-Control': 'public, max-age=86400'
			}
		})
	}

	const stream = createReadStream(path)
	return new Response(Readable.toWeb(stream) as ReadableStream, {
		headers: {
			'Content-Type': mime,
			'Content-Length': String(info.size),
			'Accept-Ranges': 'bytes',
			'Cache-Control': 'public, max-age=86400'
		}
	})
}
