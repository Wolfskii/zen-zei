# Architecture

Zen-Zei splits **catalog** (shared) from **playback** (per browser).

```
Visitor
  ├─ rates / adds sounds ──► SvelteKit /api/v1 ──► Postgres
  │                              │
  │                              └── custom audio/covers ──► /data/uploads
  └─ play / volume / mix ──► mix engine
                                ├─ YouTube IFrame players (#mix-stage)
                                └─ HTMLAudioElement ──► GET /api/v1/sounds/:id/audio
```

## Processes

On boot, `hooks.server.ts` calls `ensureReady()`:

1. Retry Postgres for ~30s
2. Apply `drizzle/*.sql` (tracked in `_migrations`)
3. Create upload folders
4. Seed categories + built-in sounds when `ZENZEI_SEED=1`
5. Issue an HttpOnly `zenzei_voter` cookie if missing

The Node adapter listens on container port **8080**. Dokploy must point the domain at that port.

## Mix engine

`src/lib/audio/mix.svelte.ts` owns runtimes in a `Map` (not in `$state`, because IFrame players are not serializable). `$state` holds `{ playing, volume, name }` per sound plus master volume.

- File: `HTMLAudioElement.loop = true`, volume `0–1`
- YouTube: `loop=1` **and** `playlist=videoId` (YouTube ignores loop on a single video otherwise). Volume `0–100` via `setVolume`
- Master volume multiplies channel volume at the edge
- Snapshot in `localStorage` (`zenzei:mix`). Autoplay is not restored; MixBar offers Resume

YouTube IFrame API is loaded once (`src/lib/audio/youtube.ts`). Each player gets `yt-{soundId}`.

## Data

- `categories` — nature, asmr, background, ambient
- `sounds` — `kind` `youtube` | `file`
- `votes` — primary key `(sound_id, voter_id)`, stars 1–5

Bundled Rain is not copied into the volume. `audio_path` is `bundled:sounds/rain.wav` and the audio route reads `static/sounds/rain.wav`.

## UI

Primitives in `src/lib/components/ui`. Feature tiles compose them. Tokens in `src/lib/styles/global.css` (glass fill, blur, sage accent, Fraunces + Outfit).
