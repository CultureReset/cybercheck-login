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

1. `login.html` → `POST /api/admin/login` → receives JWT → stored as `localStorage.cc_admin_token`
2. `admin.html` checks `localStorage` on load — redirects to `login.html` if missing or role !== `admin`
3. All API calls use: `var API_BASE = window.CC_API_BASE || 'https://cybercheck-api-database.vercel.app'`
4. Token sent as `Authorization: Bearer <token>` header

`window.CC_API_BASE` is not set in `admin.html` itself — it falls back to the hardcoded Vercel URL. To point at a local API, set `window.CC_API_BASE = 'http://localhost:3000'` in the browser console or add it to `login.html`.

## JS File Structure (`/js/`)

Each JS file is a standalone module loaded via `<script src="js/foo.js">` in the relevant HTML page. They are **not bundled** — order of `<script>` tags matters.

Key files:
- `js/cc.js` — large shared utilities, used across multiple pages
- `js/api-client.js` — legacy `APIClient` class (defaults to `localhost:3000`, used by older pages only, not GCR)
- `js/admin-businesses.js` — ⚠️ stub file, not connected to API yet
- `js/admin-dashboard.js` — ⚠️ uses `Math.random()` mock data, not connected to API yet
- `js/csv-import-manager.js` — CSV import → `/api/admin/gcr/import-csv`
- `js/events.js` — event extraction via AI photo scan
- `js/bookings.js` — booking management, Stripe refunds

## API Connection

All GCR editing calls go to `https://cybercheck-api-database.vercel.app` (the `cybercheck-api-database` repo). The relevant API prefixes used from this dashboard:

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
