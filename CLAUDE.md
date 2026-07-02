# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **static HTML/JS admin dashboard** — no build step, no framework, no package.json. Open files directly in a browser via Live Server or any static file server. All pages are plain `.html` files with inline `<script>` tags and external JS loaded from `/js/`.

## How to Run

```bash
# Any static server works — e.g. VS Code Live Server, or:
npx serve .
python3 -m http.server 8080
```

Always go through `login.html` first — the auth guard on `admin.html` redirects to login if no valid token is found in `localStorage`.

## The Main File: `admin.html`

**This is the primary interface for everything GCR-related.** It is a single-page app (~1.1MB) with a sidebar nav and hidden `<div id="page-*">` panels that swap in/out via `showPage()`. All GCR business management lives inside this one file.

### GCR Panels in `admin.html`

| Panel ID | Purpose |
|---|---|
| `gcr-businesses` | List all GCR entities, search/filter, click to open editor |
| `gcr-entity-editor` | Full entity editor (tabbed — see tabs below) |
| `gcr-site-editor` | Section/category tile editing for GCR pages |
| `gcr-claims` | Approve/reject business claim requests |
| `gcr-events` | Global events list — add/edit/delete across all entities |
| `gcr-specials` | Global specials list — add/edit/delete across all entities |
| `gcr-ads` | Ad slot management |
| `gcr-coupons` | Coupon management (nav exists, partially implemented) |
| `gcr-seo` | SEO fields |
| `bulk-upload` | CSV import → `POST /api/admin/gcr/import-csv` |
| `bulk-events` | CSV bulk event import per entity |
| `ai-chat` | AI concierge chat test |
| `ai-organize` | AI-powered entity data organizer |
| `rag-index` | RAG reindex trigger per entity |
| `tripswipe-*` | Trip Swipe tourist platform management |

### Entity Editor Tabs (`gcr-entity-editor` panel)

The entity editor is the core of GCR management. Tabs:

- **Info** — name, slug, subtitle, description, subtype, icon, phone, rating, hero image URL, website, directions, booking/reservation/order/menu URLs, social links (Instagram/Facebook/TikTok), price range, Google Places ID, address, city
- **Hours** — per-day open/close times → `PATCH /api/admin/gcr/entities/:id`
- **Photos** — add by URL / delete → `PATCH /api/admin/gcr/entities/:id` with `{photos:{add:[],delete:[]}}`  ⚠️ no file upload UI yet — URL only
- **Tags** — amenity tags (tag_category = 'amenity')
- **Features** — perfect-for tags, feature flags
- **Content** — menu items, drink items, happy hour items, specials, events per entity
- **Sections** — `entity_sections` CRUD with full section content editing (rich text, bullets, groups, items, cards, section photos, location, hours)
- **Pages** — assign entity to GCR pages (restaurants, activities, etc.)
- **Wavegent** — AI-generated page content

## Auth Flow

1. `login.html` → `POST https://gcr-api-clean.vercel.app/api/admin/login` → receives JWT → stored as `localStorage.cc_admin_token`
2. `admin.html` checks `localStorage` on load, then confirms the token against `GET /api/admin/gcr/claims` before rendering anything (a decoded-but-unverified JWT payload can be spoofed client-side, so the page is hidden until the server round-trip confirms the token is real and role `admin`) — redirects to `login.html` if the token is missing, the decoded role isn't `admin`, or the server check fails
3. All API calls (both `admin.html`'s own inline calls and `login.html`) use `https://gcr-api-clean.vercel.app` — `admin.html` reads this via `var API_BASE = window.GCR_ADMIN_API || 'https://gcr-api-clean.vercel.app'` (`admin.html:6182`)
4. Token sent as `Authorization: Bearer <token>` header

`admin.html` does not load `js/cc.js` — its GCR panels are all inline `<script>` using their own local `API_BASE`/`GCR_ADMIN_API` variables. `js/cc.js` is only loaded by non-admin pages (`login.html`, `ai-chat.html`, `app-dashboard.html`, `app-store.html`), and it also points at `gcr-api-clean.vercel.app`.

To point at a local API instead, set `window.GCR_ADMIN_API = 'http://localhost:3000'` in the browser console before `admin.html` loads.

## JS File Structure (`/js/`)

Each JS file is a standalone module loaded via `<script src="js/foo.js">` in the relevant HTML page. They are **not bundled** — order of `<script>` tags matters.

Key files:
- `js/cc.js` — large shared utilities, used across multiple pages
- `js/api-client.js` — legacy `APIClient` class (defaults to `localhost:3000`, used by older pages only, not GCR)
- `js/admin-businesses.js` — ⚠️ stub file, not connected to API yet
- `js/admin-dashboard.js` — ⚠️ uses `Math.random()` mock data, not connected to API yet
- `js/csv-import-manager.js` — ⚠️ not loaded by any `.html` page, dead code. The actual reachable CSV/bulk-upload flows are inline `<script>` in `admin.html` (`handleCSVFileSelect`/`startCSVImport`, `handleBulkEventsFile`/`processBulkEvents`, `processBulkCSV`), all using the shared `parseCSVLine()` quoted-field parser.
- `js/events.js` — event extraction via AI photo scan
- `js/bookings.js` — booking management, Stripe refunds

## API Connection

All GCR editing calls go to `https://gcr-api-clean.vercel.app` (the `gcr-api-clean` repo — this dashboard, the `gcr-unified` consumer app, and `gcr-api-clean` itself all agree on this host; `cybercheck-api-database.vercel.app` and `gcr-api-clean-fresh.vercel.app` appear elsewhere in `gcr-api-clean`'s own code/docs as legacy hostnames and should not be assumed current without verifying against the live Vercel deployment). The relevant API prefixes used from this dashboard:

- `GET/PUT /api/admin/gcr/entities/:id` — entity CRUD
- `PATCH /api/admin/gcr/entities/:id` — partial update (photos, hours, happy hour)
- `POST/PUT/DELETE /api/admin/gcr/events/:id` — events
- `POST/PUT/DELETE /api/admin/gcr/specials/:id` — specials
- `GET/POST/PUT/DELETE /api/admin/gcr/sections/:id/*` — section content (rich text, bullets, groups, items, cards, photos, location, hours)
- `POST /api/admin/gcr/upload-image` — file upload → GCR Supabase `entity-media` bucket
- `POST /api/admin/gcr/import-csv` — bulk CSV import

## Other Standalone Pages

Outside of `admin.html`, these standalone pages exist for specific workflows:
- `menu-editor.html` / `menu-editor-dark.html` — standalone menu editor
- `restaurant-editor.html` — standalone restaurant entity editor
- `profile-editor.html` — business profile editor (non-GCR)
- `beachside-circle-boats-dashboard.html` — custom dashboard for that specific client
- `dashboard.html` / `app-dashboard.html` — business owner dashboards

## CSS

Shared styles in `css/dashboard.css`. CSS custom properties (`--bg`, `--card-border`, `--text`, `--text-muted`, `--primary`) handle dark/light theming. Do not add inline styles for colors — use the existing variables.
