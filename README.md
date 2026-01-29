# AI Lead Qualifier

Provide a lightweight lead intake, scoring, and admin layer for qualifying incoming sales leads.

| Build Status                  | License | StackShare              |
| ----------------------------- | ------- | ----------------------- |
| `local` / `deployed (Render)` | MIT     | Node · Express · SQLite |

The AI Lead Qualifier started as a simple experiment: accept incoming leads from a small web form, run a rule-based “AI-like” scoring routine, and persist results so sales can act on them. Over time it became a minimal, production-ready system with a small admin UI for viewing leads and a simple API that can later be swapped to a real AI scoring service.

---

## Stack

* Node.js v22 (a `.nvmrc` is recommended for nvm users)
* npm for dependency management
* Express as the web framework
* sqlite3 for local/persistent storage (switchable to Postgres/Supabase later)
* Plain HTML/JS frontend (served by Express)
* Render for deployment (example configuration included)

---

## Project structure

```
backend/
  index.js            # Express server: routes, DB initialization, static serving
  db.js (optional)    # DB helper (if present)
  package.json        # start & dependency scripts
  leads.db            # local SQLite database (ignored in git)
  frontend/
    index.html        # Lead intake UI
    admin.html        # Admin dashboard (lists leads)
docs/
  ai-scoring.md       # Scoring rules & decisions
README.md
```

**Notable folders/files**

* `backend/index.js` — Server, routes: `/health`, `/leads` (POST), `/api/leads` (GET). Serves `frontend/` statically.
* `backend/frontend/index.html` — Public lead form; posts to `/leads`.
* `backend/frontend/admin.html` — Admin dashboard that GETs `/api/leads`.
* `backend/package.json` — `start` script should be `node index.js`.

---

## Local environment (quickstart)

> These steps assume you are at the repository root.

1. Enter the backend:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) Use nvm to match Node version:

```bash
nvm use
```

*Add a `.nvmrc` with `22` if you want to pin Node locally.*

4. Run the server:

```bash
npm start
```

Server defaults to `PORT=4000`. Open:

* App / lead form → `http://localhost:4000/index.html`
* Admin → `http://localhost:4000/admin.html`
* Health → `http://localhost:4000/health`

5. Submit a lead via the form and verify it appears in the admin dashboard.

---

## Database & persistence

* Locally, SQLite file is created at `backend/leads.db`.
* When deploying to Render, mount a disk at `/data` and set the DB path to `/data/leads.db`. The server code auto-detects Render and uses the persistent path when `process.env.RENDER` is truthy.

**Do not commit** the SQLite file — add `backend/leads.db` to `.gitignore`.

To inspect locally:

```bash
cd backend
sqlite3 leads.db
# in sqlite> prompt:
.headers on
.mode column
SELECT id, name, email, score, intent, created_at FROM leads;
.exit
```

---

## Scoring (current)

The service uses a small rule-based scorer (keeps logic deterministic and auditable). Example signals:

* `pricing` / `price` → +30
* `demo` → +30
* `this month` / `urgent` → +20
* `budget` → +20

Score ranges map to intents: `hot` (>=70), `warm` (40–69), `cold` (<40). The scoring lives server-side and is intentionally designed to be replaced by an AI model later.

See `docs/ai-scoring.md` for the scoring rationale and change log.

---

## Deployment (Render example)

1. Push your repo to GitHub (main branch).
2. Create a new Web Service on Render:

   * Root Directory: `backend`
   * Build Command: `npm install`
   * Start Command: `npm start`
   * Add Disk → Mount Path: `/data` (1 GB)
3. Ensure `backend/package.json` has:

```json
"scripts": {
  "start": "node index.js"
}
```

4. Deploy. After the service is live, open:

* `https://<your-render-host>/index.html`
* `https://<your-render-host>/admin.html`
* `https://<your-render-host>/health`

**Note:** after deployment, change DB path usage so the app writes to `/data/leads.db` on Render (the provided server already handles this if `process.env.RENDER` is set).

---

## Caveats & known issues

* Admin page is currently unprotected. Add authentication before sharing confidential/demo data.
* Scoring is rule-based, not ML — good for predictable behaviour but limited nuance.
* SQLite is fine for small volumes and demo apps. For production scale, migrate to Postgres/Supabase.
* Free Render instances may sleep; persistence requires correctly mounting `/data`.

---

## Contributing

We welcome contributions! If you want to help:

* Fork the repo and open a PR
* Add tests for any changes in scoring logic
* Run and update `docs/ai-scoring.md` when you change rules

See `CONTRIBUTING.md` (create one in the repo) for guidelines.

---

## Want to help?

If you’d like to help grow this project, here are useful starter tasks:

* Add basic auth for `/admin.html`
* Add filtering/sorting/pagination to admin UI
* Add OpenAI scoring toggle (use rule-based fallback when no key)
* Add CSV export of leads

Thanks for looking — and congrats on shipping a real, persistent, deployed product.
