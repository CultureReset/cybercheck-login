# GCR Consolidation Plan

The system is not broken because the code is wrong — the four repos are wired
correctly to the canonical database (see `CANONICAL_DATABASE.md`). It's broken
because there are **many duplicate databases, deployments, and tables**, and
different copies disagree. The fix is to collapse each layer down to ONE.

Status legend: ✅ done · ⏳ safe, in progress · 🔒 needs owner approval (destructive/outward-facing)

---

## Layer 1 — Databases → keep ONE
- ✅ Canonical: **cyber check** (`mkepugvdlktfsossumox`).
- 🔒 Retire (do not delete yet — keep as cold backup): **launch gcr**
  (`xbptmkpbiqzvxptjkfoi`), **gulf coast radar** (`adpnhipmdefutkzzltbs`).
  Action: confirm nothing points at them, then pause the projects.

## Layer 2 — Vercel deployments → keep ONE per tier
There are ~50 Vercel projects. Recommended canonical set (one per tier), everything
else to be repointed or retired:

| Tier | Keep (canonical) | Redundant copies to retire/repoint |
|---|---|---|
| API | `gcr-api-clean` | `gcr-api-clean-fresh`, `gcr-api`, `gcr-api-rk84`, `cybercheck-api-database` |
| Public site | `gcr-unified` | `gcr-unified-main`, `gcr-unified2`, `gcr-combo-app`, `gcr-public`, `gcr-public-2xqm`, `gcr-main-public`, `live-gcr`, `gar-front-end-data` |
| Admin | `cybercheck-login` | `gcr-admin`, `cyber-admin` |
| Menu editor | `restaurant-menu-editor-main` | `restaurant-menu-editor`, `qr-menu`, `qr-menu-p3da` |
| Trip Swipe | (pick one) | ~10 `trip-swipe*` / `gcr-trip-swipe*` variants |

🔒 **Before retiring any deployment**, for EACH kept project verify its Vercel env:
`GCR_SUPABASE_URL` must equal `https://mkepugvdlktfsossumox.supabase.co`. A deployment
silently pointed at `launch gcr` is the most likely cause of the "right now, wrong
an hour later" symptom (a stale-DB deployment answering on a shared domain).
Then: point the production domain at the one kept project and delete/pause the rest.

## Layer 3 — Tables → archive the dead ones
- 🔒 Move the dead/duplicate + confirmed-empty tables (see `CANONICAL_DATABASE.md`)
  into an `archive` schema (reversible — nothing deleted). Then, after a
  soak period, drop them. Requires owner approval; a per-table list will be
  produced and reviewed before any DDL.
- Note: the legacy `site_id` mini-site subsystem (`businesses`/`events`/`specials`/
  `reviews`) is still referenced by non-GCR routes (`dashboard.js`, `auth.js`,
  `public.js`, `site.js`, `update-link.js`, `webhooks.js`). Decide whether that
  product is still live before archiving those tables.

---

## Security — do first
- 🔴 **Rotate the leaked `service_role` key.** It was committed in plaintext in
  `gcr-api-clean/run_migration.js` (full admin access to the canonical DB, valid
  until 2094). Rotate in Supabase → Settings → API, then update `GCR_SUPABASE_SERVICE_KEY`
  in every kept Vercel deployment. The key has been removed from the file, but git
  history still contains it, so rotation is mandatory.

## Safe fixes already applied on branch `claude/database-repo-restructure-fyz0dx`
- ✅ `CANONICAL_DATABASE.md` — documented single source of truth.
- ✅ `gcr-api-clean/run_migration.js` — hardcoded service key replaced with an env read.
- ✅ `gcr-unified/insert-restaurants-from-backup.mjs` — removed the stale `launch gcr`
  image URL so running the seed script can't pollute the live DB.
