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
- `lib/` — `prisma.ts`, `typesense.ts`, `normalizeText.ts`, `siteUrl.ts`, `bible.ts`, `search.ts`, `youtube.ts`.
- `prisma/` — `schema.prisma` and SQL migrations (apply in order).
- `scripts/` — `import-bible-json.ts`, `generate-verse-words.ts`, `sync-typesense.ts`.
- `data/import/` — Source JSON (`antiguo-testamento.json`, `nuevo-testamento.json`, `bookConfigs.json`, `chapters.json`) used **only** for import pipelines (not bundled as the runtime Bible source).

## Environment variables

Copy `.env.example` to `.env` and adjust (never commit real secrets):

- `DATABASE_URL` — PostgreSQL connection string (required for Prisma CLI and the app).
- `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY` — Typesense connection (required for `typesense:sync` and `/api/search`).
- `NEXT_PUBLIC_SITE_URL` — Public site URL **without a trailing slash** (used in search result links and the Typesense sync script).

On Windows, from `bible-front-end`:

```bat
copy .env.example .env
```

## Local setup (development)

Run steps **in this order**:

1. Install **Node.js 20+** and npm.
2. `cd La Biblia/bible-front-end`
3. Copy `.env.example` to `.env` and set variables (see above).
4. Start databases: `docker compose up -d` (or point `.env` at your own Postgres and Typesense).
5. `npm install`
6. **Apply all Prisma migrations** (creates tables and adds `Verse.chapterId`, etc.):

   ```bash
   npx prisma migrate deploy
   ```

   For **local schema iteration** (creates a *new* migration from `schema.prisma` changes), use:

   ```bash
   npm run db:migrate
   ```

   That command is **not** a substitute for `migrate deploy` on a fresh machine: `db:migrate` runs `prisma migrate dev`, which is interactive and dev-oriented.

7. `npm run import:bible` — loads JSON from `data/import/` into PostgreSQL (prints a JSON summary; exits with code `1` if book/chapter/verse counts do not match the source files).
8. `npm run verse-words` — rebuilds `VerseWord` from verse text (surface `word` + accent-insensitive `normalizedWord`).
9. `npm run typesense:sync` — (re)creates the `bible_verses` collection and imports every verse document.
10. `npm run dev` — Next.js at `http://localhost:3020`.

After step 7–9, **`/biblia/es`** lists books for the translation whose `language` is `es` (created by the import script).

## Docker Compose

From `bible-front-end`:

```bash
docker compose up -d
```

Services:

- **postgres** — port `5432`, user/db/password `bible` / `bible` (change for production).
- **typesense** — host port **`18108`** maps to `8108` inside the container (Windows often blocks `8108` on the host). API key `xyz` in the sample file (change for production). Set `TYPESENSE_PORT=18108` in `.env` when Next runs on the host.

Persistent volumes: `postgres_data`, `typesense_data`.

An optional `next-app` service is commented in `docker-compose.yml` if you prefer running Next inside Docker; otherwise run `npm run start` on the host or behind Nginx.

## Prisma migrations

- SQL migrations live under `prisma/migrations/`.
- **CI / production / new clone:** `npx prisma migrate deploy`
- **Changing the schema in development:** `npm run db:migrate` (equivalent to `prisma migrate dev`) to generate a new migration folder.
- `npm run db:push` — `prisma db push` only; skips migration history. Use sparingly for quick experiments, not as the main workflow.

## Bible JSON import

- Keep/update files under `data/import/`.
- `npm run import:bible` deletes existing Bible-related rows (`Translation`, `Book`, `Chapter`, `Verse`, `VerseWord`, `AudioLink` for that pipeline) and reloads from JSON. It links each **Verse** to the correct **Chapter** via `chapterId`.
- The script logs `expectedBooks`, `dbBooks`, chapter counts, verse counts, and `skippedEmptyVerses`.
- Copyright: verify you have rights to host and distribute the Jerusalem 1976 text in your deployment.

## Typesense sync

- Typesense must be running; env vars must match `docker-compose.yml` (especially `TYPESENSE_API_KEY`).
- `npm run typesense:sync` drops and recreates the **`bible_verses`** collection, then bulk-imports all verses with `action: "upsert"`.
- If import errors occur, the Typesense client throws (check API key, disk, and logs).

## Search architecture

- **UI (`/buscar`):** the browser issues **`GET /api/search?...`** (query string parameters only).
- **Snippet / ranking:** **Typesense** on `normalizedText` and `text` (queries are normalized for consistent Spanish matching).
- **Exact counts:**
  - **One token:** `COUNT` on `VerseWord.normalizedWord` (PostgreSQL via Prisma).
  - **Several tokens:** count distinct verses where the **ordered** `VerseWord.normalizedWord` sequence (aggregated with `array_agg(... ORDER BY id)`) contains the normalized phrase as a **space-delimited substring** (implemented in `lib/search.ts` with raw SQL). This uses **only** `VerseWord`, not `ILIKE` on `Verse.text`.

## Route structure (App Router)

| Route | Purpose |
|-------|---------|
| `/` | Home hub (“Seek of Truth” landing: hero, featured verses, feature grid). |
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
| `/api/search` | `GET` — Typesense hits + `exactCount`. |
| `/api/contact` | `POST` — stub response. |
| `/api/daily-reading` | `GET` — stub response. |

## Deployment notes (e.g. Contabo VPS)

1. Install Docker (for Postgres + Typesense) and Node, or use managed databases.
2. `npm ci && npx prisma migrate deploy && npm run build`
3. `npm run import:bible && npm run verse-words && npm run typesense:sync` (or run these as a separate release job).
4. Run Next: `npm run start` (often under `systemd`). Port comes from **`PORT` in `.env`** (default `3020` in `.env.example`).
5. Configure **Nginx** `proxy_pass` to `http://127.0.0.1:3020`, enable HTTPS (Let’s Encrypt), set `NEXT_PUBLIC_SITE_URL` to the public origin (no trailing slash).

## Development commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server. |
| `npm run build` | `prisma generate` + production Next build. |
| `npm run start` | Start production server. |
| `npm run lint` | ESLint. |
| `npm run db:migrate` | `prisma migrate dev` (dev; creates migrations). |
| `npm run db:push` | `prisma db push` (prototyping; skips migration files). |
| `npm run import:bible` | JSON → Postgres. |
| `npm run verse-words` | Populate `VerseWord`. |
| `npm run typesense:sync` | Postgres → Typesense. |

## UI: themes, layout shell, and icons

- **Themes:** Two appearance presets — **Tema azul claro** (airy blue / white) and **Tema cálido** (parchment / gold / navy) — are driven by CSS variables on `.theme-blue` and `.theme-warm` in `app/globals.css`. The root `ThemeProvider` wraps the app in a div with one of those classes, reads/writes the choice in **`localStorage`** under **`sot-theme`**, and defaults to **blue** on first visit.
- **`PageShell`:** `components/layout/PageShell.tsx` provides optional **`leftRail`** and **`rightRail`** slots plus a centered main column (default **`max-w-[1380px]`** when rails are omitted). On large screens, layout is `[LeftRail?] [Main] [RightRail?]`; below `lg`, rails are hidden so the main column stays a single polished column.
- **`lucide-react`:** Navigation, homepage cards, and footer use Lucide icons (e.g. `BookOpen`, `Search`, `CalendarDays`); add icons via named imports from `lucide-react`.
- **Homepage:** `components/home/HomeHero.tsx` uses the photograph **`public/images/bible-mountains-hero.png`** (Biblia abierta / montañas) on the right with theme-aware scrims (`--hero-scrim`, `--hero-image-wash` in `app/globals.css`). Featured verse cards and **`FeatureGrid`** live alongside it on `app/page.tsx`.

## Roadmap

- Authentication and protected `/admin`.
- Real daily liturgy ingestion (`DailyReading` + `/api/daily-reading`).
- CMS flows for `Article` / `Debate` and public listing pages.
- YouTube `AudioLink` management UI and `/audio` integration.
- Reading plans, bookmarks, and user notes.
- Hardening: rate limits on search/contact, structured logging, backups.

## License

Private project; Bible text rights remain with the respective copyright holders.
