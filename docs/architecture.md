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
                                      (upload, bundled Rain, or proxied MP3/WAV URL)
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
- Snapshot in `localStorage` (`zenzei:mix:v2`). Autoplay is not restored; MixBar offers Resume. Sleep timer is stored as `sleepUntil`. Keep-screen-on lives in `zenzei:prefs:v1` and requests a Screen Wake Lock while mixing. Media Session exposes play/pause/stop to the OS. The page title follows the playing layers.
- Shareable mix: `?mix=uuid:80,uuid:50&master=90` (volumes 0–100). Landing shows Play mix (no autoplay). Copy from the mix bar (`C`; Shift+C copies names and volumes). Space pauses/continues; Esc stops; R shuffles; Shift+R replays the last named scene; 1–4 start scenes; `[` `]` nudge master; `{` `}` nudge the last touched layer (or scroll a mix-bar chip); E evens playing volumes; A adds a companion layer; N shows only playing tiles; L toggles listen mode (library hidden, scenes stay so you can start a mix). Scene chips match catalog names (Storm, Sleep, Cabin, Focus); Again replays the last one. Per-device favourites, lists, named mixes, and recent stacks live in `localStorage` (`zenzei:shelf:v1`; older `zenzei:saved:v1` mixes are migrated). Keep a recent into Yours. Download / restore that JSON from the footer (restore replaces this device’s shelf). Missing catalog ids are ignored. Shared votes still use the `zenzei_voter` cookie. Layers fade in/out. Headphones on a mix chip solos that layer. Playing tiles pin to the top of the grid (even through search or source filters) and dim the rest. A list’s count browses that list; the name still plays it. Still-background lives in `zenzei:prefs:v1` next to keep-screen-on (pauses the rain video), library sort, and last scene. Master Hush / Room / Full sit on the mix bar.

YouTube IFrame API is loaded once (`src/lib/audio/youtube.ts`). Each player gets `yt-{soundId}`.

## Data

- `categories` — nature, asmr, background, ambient
- `sounds` — `kind` `youtube` | `file` | `url`
- `votes` — primary key `(sound_id, voter_id)`, stars 1–5

Bundled Rain is not copied into the volume. `audio_path` is `bundled:sounds/rain.wav` and the audio route reads `static/sounds/rain.wav`.

## Admin

`/admin` is a separate catalog operator UI. Unlock with `ZENZEI_ADMIN_API_KEY` (stored in `sessionStorage` as `zenzei:admin`, sent as `x-admin-key`). Edit/delete/add live there. The mixer stays public.

## UI

Primitives in `src/lib/components/ui`. Feature tiles compose them. Tokens in `src/lib/styles/global.css` (glass fill, blur, sage accent, Fraunces + Outfit).
