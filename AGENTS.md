# Zen-Zei Agent Guide

Zen-Zei is a shared ambient mixer. Visitors play several looping sounds at once (YouTube + uploaded files), rate them 1–5 stars, and add new tiles. Playback is browser-side. Catalog, covers, audio files, and votes live on the server.

## Architecture

```
Browser (Svelte 5)
  UI primitives (src/lib/components/ui)
  Mix engine (src/lib/audio/mix.svelte.ts)
    ├─ YouTube IFrame API (one loader, unique player mounts in #mix-stage)
    └─ HTMLAudioElement (loop, Range-capable /api/v1/sounds/:id/audio)
        │     uploads, bundled Rain, or proxied MP3/WAV links (`url:` in audio_path)
        │
        ▼
SvelteKit adapter-node
  hooks.server.ts → migrate + seed + voter cookie
  /api/v1 → Postgres (Drizzle) + upload volume
```

## Non-negotiable rules

1. Playback stays in the browser. The server never transcodes YouTube.
2. Shared catalog and votes go through `/api/v1`. Do not fake a global store with `localStorage`.
3. Load the YouTube IFrame API once. Never hardcode `id="player"`.
4. New visual controls belong in `src/lib/components/ui` first, then feature components compose them (`SearchField`, sleep/share/mute/save on `MixBar`, tile Picture/Icon look in `AddSoundModal`, `SceneStrip`, `ShortcutsHint`).
5. Glass tokens live in `src/lib/styles/global.css`. Do not introduce a third-party UI kit.
6. Do not commit `.env` or uploaded blobs.
7. Custom audio is stored on the uploads volume; bundled Rain is `bundled:sounds/rain.wav`. Remote MP3/WAV links are `url:https://…` and proxied through `/api/v1/sounds/:id/audio`.
8. One vote per sound per `zenzei_voter` cookie (upsert).
9. Catalog edits (edit/delete) happen on `/admin` with `ZENZEI_ADMIN_API_KEY` (`x-admin-key`).
10. Update `docs/api.md` when changing endpoints.

## How to add a UI primitive

Create `src/lib/components/ui/Name.svelte` with Svelte 5 `$props`, glass CSS variables, and an accessible label. Use it from feature components (`SoundCard`, `MixBar`, `AddSoundModal`). Do not copy button/slider markup.

## How to add a seeded sound

Edit `src/lib/server/seed.ts` with a stable UUID and `onConflictDoNothing`. File sounds use `audioPath: 'bundled:path/under/static'`. YouTube sounds store `youtubeVideoId`.

## Commands

```bash
cp .env.example .env
npm run db:up
npm install
npm run dev
npm test
npm run check
docker network create dokploy-network   # once, for production compose
docker compose up --build
```

## Things agents must NOT do

- Do not revive GitHub Pages / `svelte-adapter-github`.
- Do not add a second YouTube API loader.
- Do not put secrets in the client bundle.
- Do not replace Postgres with in-browser SQLite for shared votes.
