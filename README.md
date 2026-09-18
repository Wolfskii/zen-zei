# Zen-Zei

<p>
  <a href="https://www.buymeacoffee.com/wolfskii">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=wolfskii&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" />
  </a>
</p>

Glassmorphism mixer for nature, ASMR, and background loops. Play several tiles at once, each with its own volume, looping play/stop, and a 1–5 star vote. Add more sounds by pasting a YouTube URL or uploading a file.

The library and ratings are shared (Postgres). Mix state (what you were playing, volumes) stays in this browser.

## Quick start (local)

```bash
cp .env.example .env
# For local Docker Postgres, set:
#   POSTGRES_PASSWORD=zenzei
#   DATABASE_URL=postgres://zenzei:zenzei@localhost:5432/zenzei

npm install
npm run db:up
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Catalog edits live at [http://localhost:5173/admin](http://localhost:5173/admin) (same value as `ZENZEI_ADMIN_API_KEY`).

## Production (Dokploy)

See [docs/deployment.md](docs/deployment.md). Compose publishes **38136 → 8080**. Create `dokploy-network` once, copy `.env.example` → `.env`, set a real `POSTGRES_PASSWORD` and optional `ZENZEI_ADMIN_API_KEY`.

```bash
docker network create dokploy-network
docker compose up --build -d
```

## Docs

- [Architecture](docs/architecture.md)
- [HTTP API](docs/api.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)
- [AGENTS.md](AGENTS.md) for coding agents

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite + SvelteKit on port 5173 |
| `npm run db:up` | Postgres 16 via `docker-compose.dev.yml` |
| `npm test` | Vitest (YouTube URL parser) |
| `npm run check` | `svelte-check` |
| `npm run build` / `npm start` | Adapter-node server |
