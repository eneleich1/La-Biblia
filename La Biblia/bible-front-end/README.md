# Jerusalem Bible Platform (`bible-front-end`)

Christian Bible platform: reading, search, audio links, daily readings, apologetics, sermons, studies, debates, and a future admin area. This codebase is a **Next.js App Router** application (TypeScript + Tailwind) backed by **PostgreSQL (Prisma)** and **Typesense** for fast verse search.

## Architecture (text diagram)

```
User -> Nginx -> Next.js App -> PostgreSQL
                      |
                      +------> Typesense
```

- **Nginx** terminates TLS and reverse-proxies to the Node process (recommended on a VPS such as Contabo). It can run **outside** Docker while Postgres and Typesense run **inside** Docker Compose.
- **Next.js** serves UI (React Server Components where useful), Bible routes, and Route Handlers under `app/api/*`.
- **PostgreSQL** stores canonical Bible text, translations, books/chapters/verses, `VerseWord` rows for exact word counts, articles, debates, daily readings, and future admin data.
- **Typesense** indexes verses for phrase/word search with filters (language, translation, testament, book, chapter).

## Technologies

| Tech | Role |
|------|------|
| **Next.js (App Router)** | UI, server rendering, API routes (`app/api/...`). |
| **TypeScript** | Typed app and scripts. |
| **Tailwind CSS** | Layout and styling (simple study-platform look). |
| **PostgreSQL** | Primary relational store. |
| **Prisma** | Schema, migrations, typed queries. |
| **Typesense** | Full-text search over verses. |
| **Docker Compose** | Local/production-like stack for Postgres + Typesense (+ optional Next container). |
| **Nginx** | TLS, HTTP/2, caching headers, reverse proxy to Next.js. |

## Repository layout

- `app/` — App Router pages and API route handlers.
- `components/` — Shared UI (`layout/`, `search/`, future `bible/`, `audio/`, `content/`).
- `lib/` — `prisma.ts`, `typesense.ts`, `normalizeText.ts`, `bible.ts`, `search.ts`, `youtube.ts`.
- `prisma/` — `schema.prisma` and SQL migrations.
- `scripts/` — `import-bible-json.ts`, `generate-verse-words.ts`, `sync-typesense.ts`.
- `data/import/` — Source JSON (`antiguo-testamento.json`, `nuevo-testamento.json`, `bookConfigs.json`, `chapters.json`) used **only** for import pipelines (not bundled as the runtime Bible source).

## Environment variables

Copy `.env.example` to `.env` and adjust (never commit real secrets):

- `DATABASE_URL` — PostgreSQL connection string.
- `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY` — Typesense connection.
- `NEXT_PUBLIC_SITE_URL` — Public site URL (used in search result links).

## Local setup (development)

1. Install Node 20+ and npm.
2. `cd La Biblia/bible-front-end`
3. `cp .env.example .env` and set variables.
4. Start databases (see Docker Compose below) or use your own Postgres/Typesense hosts.
5. `npm install`
6. Ensure `DATABASE_URL` is set (Prisma CLI commands read it from `.env`).
7. `npx prisma migrate deploy` (or `npm run db:migrate` for interactive dev migrations).
8. `npm run import:bible` — loads JSON from `data/import/` into PostgreSQL.
9. `npm run verse-words` — builds `VerseWord` rows from normalized verse text.
10. `npm run typesense:sync` — creates the `bible_verses` collection and indexes verses.
11. `npm run dev` — Next.js at `http://localhost:3000`.

## Docker Compose

From `bible-front-end`:

```bash
docker compose up -d
```

Services:

- **postgres** — port `5432`, user/db/password `bible` / `bible` (change for production).
- **typesense** — port `8108`, API key `xyz` in the sample file (change for production).

Persistent volumes: `postgres_data`, `typesense_data`.

An optional `next-app` service is commented in `docker-compose.yml` if you prefer running Next inside Docker; otherwise run `npm run start` on the host or behind Nginx.

## Prisma migrations

- SQL migrations live in `prisma/migrations/`.
- Apply: `npx prisma migrate deploy` (CI/production) or `npm run db:migrate` during development.
- After schema changes: `npx prisma migrate dev --name <description>`.

## Bible JSON import

- Place/update files under `data/import/` (same structure as the legacy CRA JSON).
- Run `npm run import:bible` — wipes previous Bible rows for the import path (translations, books, chapters, verses, related words/audio links) and reloads from JSON.
- Copyright: verify you have rights to host and distribute the Jerusalem 1976 text in your deployment.

## Typesense sync

- Ensure Typesense is running and env vars match `docker-compose.yml`.
- Run `npm run typesense:sync` after imports or when verse text changes.
- Collection name: `bible_verses` (see `lib/typesense.ts`).

## Search architecture

- **UI:** `/buscar` posts a client request to `GET /api/search` with query parameters.
- **Full text:** Typesense query over `text` and `normalizedText` with filters.
- **Exact counts:** PostgreSQL `VerseWord` for single-token counts; multi-word phrases use a normalized substring match on `Verse.normalizedText` (MVP; can be refined later).

## Route structure (App Router)

| Route | Purpose |
|-------|---------|
| `/` | Home hub (links to major sections). |
| `/biblia` | Available languages/translations. |
| `/biblia/[language]` | Book index by testament and category. |
| `/biblia/[language]/[bookSlug]` | Chapters for a book. |
| `/biblia/[language]/[bookSlug]/[chapter]` | Chapter reader with `#V{n}` verse anchors. |
| `/buscar` | Search UI. |
| `/audio`, `/audio/[language]/[bookSlug]/[chapter]` | Audio placeholders. |
| `/lecturas-del-dia` | Daily readings placeholder. |
| `/estudios`, `/estudios/[slug]` | Studies placeholders. |
| `/apologetica`, `/apologetica/[slug]` | Apologetics placeholders. |
| `/predicaciones`, `/predicaciones/[slug]` | Sermons placeholders. |
| `/debates`, `/debates/[slug]` | Debates placeholders. |
| `/admin` | Admin placeholder (no auth yet). |
| `/api/search`, `/api/contact`, `/api/daily-reading` | APIs (contact and daily reading are stubs). |

## Deployment notes (e.g. Contabo VPS)

1. Install Docker (for Postgres + Typesense) and Node, or run DBs on managed services.
2. Build: `npm ci && npx prisma migrate deploy && npm run build`.
3. Run Next: `npm run start` (often under `systemd`) on port 3000.
4. Configure **Nginx** `proxy_pass` to `http://127.0.0.1:3000`, enable HTTPS (Let’s Encrypt), set `NEXT_PUBLIC_SITE_URL` to the public URL.
5. Run import + Typesense sync on the server (or from a secure admin job) after migrations.

## Development commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server. |
| `npm run build` | `prisma generate` + production Next build. |
| `npm run start` | Start production server. |
| `npm run lint` | ESLint. |
| `npm run db:migrate` | Prisma migrate (dev). |
| `npm run db:push` | Push schema without migration files (prototyping only). |
| `npm run import:bible` | JSON → Postgres. |
| `npm run verse-words` | Populate `VerseWord`. |
| `npm run typesense:sync` | Postgres → Typesense. |

## Roadmap

- Authentication and protected `/admin`.
- Real daily liturgy ingestion (`DailyReading` + `/api/daily-reading`).
- CMS flows for `Article` / `Debate` and public listing pages.
- YouTube `AudioLink` management UI and `/audio` integration.
- Reading plans, bookmarks, and user notes.
- Hardening: rate limits on search/contact, structured logging, backups.

## License

Private project; Bible text rights remain with the respective copyright holders.
