# cybercheck-login

> Status: archive-candidate — make the repo private first (see Known gaps) — superseded by `Dashboards-users-` (owner dashboard) and `Admin-dashboard-main` (operator console) — last verified against code 2026-11-02 (commit 8b3d6df)

## What it is

The old static-HTML CyberCheck/GCR dashboard: no build step, no `package.json`, about 60+ top-level `.html` pages (62 counted), shared `js/` and `css/`, a Vercel config (`vercel.json`, rewrites such as `/p/:slug` -> `biz.html`, `/book/:slug/:app` -> `book.html`, `/wavegent/:slug` -> `api/wavegent/[slug].js`), and a few serverless functions in `api/` (`wavegent`, `whatsapp`). 437 commits, 2026-03-04 to 2026-08-02. `admin.html` (about 1 MB) is the big single-page admin; `CLAUDE.md` describes its panels. Unique content that does not exist in the successors:

- `apps/`: 69 JSON app manifests (plus `_categories.json`, `_presets.json`) for the app-store idea.
- 62 static pages (menu editors, card builder, waiver, song request, automation builder, etc.).
- `migrations/`, `integrations/`, `tools/`, and notes (`GCR_DATA_FLOW.md`, `MENU_SYSTEMS_COMPARISON.md`, `ADMIN_EDIT_CAPABILITIES.md`).

## Where it fits

- Calls `gcr-api-clean` (pages in about 43 files reference it; `GCR_DATA_FLOW.md` says the admin dashboard points at `https://gcr-api-clean.vercel.app`, unverified).
- **It also breaks the one-database rule.** `js/supabase-client.js`, `gcr-entity-manager.html` and `onboarding-links.html` embed the Supabase URL and an anon-role key for the `cyber check` project (`mkepugvdlktfsossumox`), and about 31 `.from(...)` calls in `*.html` and `js/*.js` query tables from the browser. Per the platform notes, anon write grants on `cyber check` are revoked, so this is limited, but it is not the "UI only talks to gcr-api-clean" design.
- Replaced by `Dashboards-users-` and `Admin-dashboard-main`, which call only `gcr-api-clean`.

## Run / test

Static; per `CLAUDE.md` any static server works (not executed in this pass, unverified):

```bash
npx serve .            # or: python3 -m http.server 8080
```

Start at `login.html`; `admin.html` redirects there when no token is in `localStorage`. No tests.

## Known gaps

- **The repo is public and contains Supabase anon keys in the tree (`cyber check`, 3 files) and references to other Supabase projects in history** (refs of the old "gulf coast radar" and "launch gcr" projects and of a third project, `mhafixflyffflwjhcgfn`, each appear in earlier commits; whether each commit also held a key for it was not checked). Anon keys are not secret by design, but the other two projects reportedly have anon write grants open (182 and 204 tables per the platform notes), so those keys and refs are an exposure. Make the repo private before anything else; history rewrite is a separate decision.
- The previous version of this README contained a demo login (email and password) for a real-looking account. It has been removed from the file but remains in git history; treat that credential as exposed, change it if it is still valid, and do not reuse it.
- Superseded; not maintained since 2026-08-02. Deployed/production status unverified.
- Uses Supabase directly from the browser (see above).
- Before archiving, copy out `apps/*.json` and the unique pages if they are still wanted.

## Related repos

- `Dashboards-users-`, `Admin-dashboard-main`: current UIs.
- `gcr-api-clean`: the API and the only service that should touch the database.
- `cybercheck-dashboard`: another old dashboard/API lineage.
