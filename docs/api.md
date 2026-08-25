# HTTP API

Base path: `/api/v1`. JSON errors: `{ "error": { "code", "message" } }`.

Anonymous visitors send cookies (`zenzei_voter`). Admin routes need header `x-admin-key: $ZENZEI_ADMIN_API_KEY`.

## Health

`GET /api/v1/health` → `{ "ok": true }` or `503`.

## Categories

`GET /api/v1/categories` → `{ "categories": Category[] }`

## Sounds

`GET /api/v1/sounds?category=nature` → `{ "sounds": Sound[] }`

`POST /api/v1/sounds` (JSON, YouTube):

```json
{
  "name": "Thunder",
  "description": "Distant rolling thunder",
  "categoryId": "uuid",
  "icon": "CloudLightning",
  "youtubeUrl": "https://www.youtube.com/watch?v=NI0M03vCoXg"
}
```

`POST /api/v1/sounds` (`multipart/form-data`, file):

| Field | Notes |
| --- | --- |
| `kind` | `file` (default), `youtube`, or `url` |
| `name` | required |
| `description` | optional |
| `categoryId` | required UUID |
| `icon` | Lucide name from the in-app picker |
| `coverMode` | `picture` (default) or `icon`. `icon` stores `visual:icon` so YouTube stills are not used |
| `youtubeUrl` | when `kind=youtube` |
| `audioUrl` | when `kind=url` — direct MP3/WAV/OGG/WebM link (server probes, then proxies playback) |
| `audio` | MP3/WAV/OGG/WebM upload, max `ZENZEI_MAX_AUDIO_BYTES` |
| `cover` | JPEG/PNG/WebP/GIF, max `ZENZEI_MAX_COVER_BYTES` (your picture for YouTube, file, or link sounds) |

`GET /api/v1/sounds/:id`

`PATCH /api/v1/sounds/:id` — admin. JSON metadata (`name`, `description`, `categoryId`, `icon`, `youtubeUrl`) or multipart with optional `cover` / `audio` / `audioUrl` / `coverMode` (`picture` \| `icon`).

`DELETE /api/v1/sounds/:id` — admin.

## Admin

`GET /api/v1/admin/session` — `{ "ok": true }` when `x-admin-key` matches. Used by `/admin`.

The operator UI is **`/admin`**: unlock with the env key, then add / edit / delete the shared catalog.

`GET /api/v1/sounds/:id/audio` — file uploads, bundled Rain, and remote MP3/WAV links (`kind=url`). Supports `Range`. Remote links are proxied so the browser is not blocked by CORS. Private/localhost hosts are rejected.

`GET /api/v1/sounds/:id/cover` — uploaded covers only. YouTube tiles without a custom picture use `i.ytimg.com`. Tiles with `coverMode=icon` show the Lucide icon instead.

`POST /api/v1/sounds/:id/vote` `{ "stars": 1-5 }` — upsert for this voter.

## YouTube preview

`GET /api/v1/youtube/preview?url=...` — server-side oEmbed. Returns `videoId`, `title`, `thumbnailUrl`, `watchUrl`.

`GET /api/v1/audio/preview?url=...` — HEAD/range probe of a direct audio file URL. Returns `url`, `contentType`, `suggestedName`.
