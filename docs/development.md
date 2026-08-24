# Development

## Requirements

- Node 20+
- Docker (for Postgres)

## First run

```bash
cp .env.example .env
```

Set local passwords to match `docker-compose.dev.yml` defaults:

```
POSTGRES_USER=zenzei
POSTGRES_PASSWORD=zenzei
POSTGRES_DB=zenzei
DATABASE_URL=postgres://zenzei:zenzei@localhost:5432/zenzei
ZENZEI_UPLOAD_DIR=./data/uploads
ZENZEI_SEED=1
```

```bash
npm install
npm run db:up
npm run dev
```

Migrations and seed run on the first HTTP request via `hooks.server.ts`.

## Layout of `src/`

| Path | Role |
| --- | --- |
| `lib/components/ui` | Buttons, slider, stars, modal, fields |
| `lib/components` | SoundCard, MixBar, AddSoundModal, … |
| `lib/audio` | Mix engine + YouTube loader |
| `lib/server` | Env, Drizzle schema, uploads, seed |
| `routes/api/v1` | HTTP API |

## Tests

```bash
npm test          # vitest
npm run check     # svelte-check
```

Playwright (`npm run test:e2e`) expects `npm run build` and a running database because the homepage SSR-loads the catalog.

## Adding a primitive

1. New file under `src/lib/components/ui`
2. Svelte 5 `$props()`, glass CSS variables
3. Accessible name (`aria-label` or visible `<label>`)
4. Use it from a feature component — do not duplicate the control
