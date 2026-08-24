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
| `kind` | `file` (default) or `youtube` |
| `name` | required |
| `description` | optional |
| `categoryId` | required UUID |
| `icon` | Lucide name from the in-app picker |
| `youtubeUrl` | when `kind=youtube` |
| `audio` | MP3/WAV/OGG/WebM, max `ZENZEI_MAX_AUDIO_BYTES` |
| `cover` | JPEG/PNG/WebP/GIF, max `ZENZEI_MAX_COVER_BYTES` |

`GET /api/v1/sounds/:id`

`PATCH /api/v1/sounds/:id` — admin. JSON metadata or multipart with optional `cover`.

`DELETE /api/v1/sounds/:id` — admin.

`GET /api/v1/sounds/:id/audio` — file sounds. Supports `Range`.

`GET /api/v1/sounds/:id/cover` — uploaded covers only (YouTube tiles use `img.youtube.com` URLs).

`POST /api/v1/sounds/:id/vote` `{ "stars": 1-5 }` — upsert for this voter.

## YouTube preview

`GET /api/v1/youtube/preview?url=...` — server-side oEmbed. Returns `videoId`, `title`, `thumbnailUrl`, `watchUrl`.
