# Dokploy deployment

Matches the Yggdrasil compose pattern: external `dokploy-network`, container port **8080**, published host port **38136**.

## One-time host setup

```bash
docker network create dokploy-network
```

## Compose app

1. Create a Dokploy Compose application pointing at this repo, compose file `./docker-compose.yml` (forward slashes).
2. Copy `.env.example` into the Dokploy env panel (or a `.env` next to compose).
3. Set `POSTGRES_PASSWORD` to a long random value.
4. Set `DATABASE_URL=postgres://zenzei:<same-password>@zenzei-db:5432/zenzei`
5. Optional: `ZENZEI_ADMIN_API_KEY`, `ORIGIN=https://your-domain`
6. Domain **Container Port** = `8080` (not 38136). Traefik routes to the container; `ZENZEI_HOST_PORT` is only for LAN access.

## Environment

| Variable | Purpose |
| --- | --- |
| `ZENZEI_HOST_PORT` | Host publish, default `38136` |
| `POSTGRES_PASSWORD` | Database password |
| `DATABASE_URL` | App → `zenzei-db` |
| `ZENZEI_ADMIN_API_KEY` | Delete/edit header |
| `ZENZEI_UPLOAD_DIR` | Always `/data/uploads` in compose |
| `ZENZEI_SEED` | `1` seeds Rain/Thunder/… |
| `BODY_SIZE_LIMIT` | Adapter-node multipart cap (`25M`) |
| `ORIGIN` | Public origin for SvelteKit CSRF / absolute URLs |

## Volumes

- `zenzei_db_data` — Postgres
- `zenzei_uploads` — user audio + covers

Rain WAV stays in the image under `static/sounds`.

## Health

`GET /api/v1/health` must return 200 after Postgres is up. Compose `start_period` is 40s so migrations can finish.

## GitHub Pages

The old Pages deploy is removed. Host this build on Dokploy; a static export cannot share votes or uploads.
