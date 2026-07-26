# CyberCheck / GCR — System Audit

**Verified 2026-07-26.** Every number here comes from `count(*)` against the live
Supabase project `mkepugvdlktfsossumox`, or from grepping the actual source. Nothing
is from memory or from tooling that reports estimates.

---

## ⚠️ Read this first: the row counts you've seen before are wrong

Three separate sources under-report this database, some by 100×:

| Table | `list_tables` says | `pg_stat` says | **Real `count(*)`** |
|---|---|---|---|
| `menu_items` | 132 | 132 | **11,147** |
| `entity_photos` | 3,243 | 3,243 | **52,191** |
| `entity_hours` | 1,043 | 1,043 | **15,116** |
| `entity_events` | 52 | 52 | **1,222** |
| `drink_items` | 71 | 71 | **1,112** |
| `entity_theme` | 0 | 0 | **4,034** |
| `artists` | 0 | 0 | **396** |
| `entity_reviews` | 312 | 312 | **10,988** |

There is a comment stored on the `menu_items` table itself claiming a "DATA ANOMALY —
only 6 rows." **That comment is false.** It has 11,147 rows. Anything reading that
comment (human or AI) will reach the wrong conclusion.

**Always use `select count(*)`.** Never trust `list_tables`, `pg_stat_user_tables`, or
the stored table comments for row counts.

---

## 1. What you actually have

### 1.1 The content layer — this is the asset

| What | Rows |
|---|---|
| Businesses (`entity`) | 4,067 |
| Photos | 52,191 |
| Opening hours | 15,116 |
| Menu items | 11,147 across 1,940 sections |
| Catalog items (newer model) | 12,216 across 2,164 sections |
| Drink items | 1,112 |
| Happy hour items | 154 |
| Events | 1,222 |
| Specials | 58 |
| Reviews (own) | 10,988 |
| Reviews (Google, imported) | 10,591 |
| Offers / prices (normalized) | 18,138 / 18,467 |
| Bookable resources | 1,055 |
| Artists / artist profiles | 396 / 390 |
| Per-entity theme | 4,034 |
| Search index | 35,182 |
| Industry fact tables | 31 tables, ~3,000 rows |

This is a genuinely large, structured, populated local-business dataset. It is the
hardest thing in the system to rebuild and it already exists.

### 1.2 API — 54 routes mounted, ~38,500 lines

Working and backed by real data:

- **Discovery** — `gcr.js` (2,670 lines): search, browse, entity detail, home feed,
  fuzzy match, AI concierge tools
- **Universal booking engine** — `platform.js` (2,186 lines): slots/range/day modes,
  capacity, cutoffs, add-ons, price tiers, promos, waivers, manage/cancel/reschedule
- **Email parser** — `email-parser.js` (1,464 lines): 26 platform extractors, dedupe,
  iCal import, writes availability + calendar
- **Daily update link** — `update-link.js` (1,376 lines): token URL by SMS, no login,
  specials/menu/drinks/happy-hour/events/**catch-of-the-day**, camera upload
- **Menu editor** — `menu-editor.js` (1,039 lines)
- **Trip Swipe** — `tourist.js` (2,251 lines): swipe, saves, groups, itineraries,
  8 real AI tools, preference learning
- **QR** — `qr.js` (675 lines): scan logging, event tracking, **lead scoring**,
  phone capture, referral partners
- **Stripe** — Connect onboarding, payments, refunds, **platform fee via
  `application_fee_amount`** (`PLATFORM_FEE_PERCENT`, default 1%)
- Artists, song requests, co-op funds, goals, rentals, services, transportation,
  reviews, team, gallery, FAQs, blog, analytics, AR hunts

### 1.3 Frontend surfaces that exist and are wired

| Surface | Where | Data source | State |
|---|---|---|---|
| GCR consumer app | `gcr-unified` React, 48 routes | `/api/gcr/*` | Live |
| **Standalone menu page** | `/menu/:slug` → `RestaurantMenu.jsx` | `GET /api/public/menu?slug=` | **Works** |
| **Links page** | `/links/:slug` → `LinksPage.jsx` | `GET /api/gcr/entity/:slug` | Works |
| Business detail | `/business/:slug` → `BusinessDetail.jsx` (2,446 lines) | `/api/gcr/entity` | Live |
| Hosted booking page | `public/book.html` | `/api/platform/page/` + Stripe | Built |
| Public business page | `public/biz.html` | `/api/platform/page/` | Built |
| Manage booking | `public/manage.html` | `/api/platform/manage/` | Built |
| Waiver signing | `public/waiver.html` | `/api/platform/waiver-*` | Built |
| Verified review | `public/verified-review.html` | `/api/platform/review-token/` | Built |
| QR scan landing | `public/q.html` | `/api/qr/scan/:code` | Built |
| Owner dashboard | `modular-dashboard.html` + 66 app manifests | `/api/platform/*` | Built |
| Setup wizard | `bookpro-start.html` (7 steps) | `/api/auth/signup` → `/api/platform/state` | Built |
| Admin dashboard | `admin.html` (~1.1 MB) | `/api/admin/*` | Live |
| Sales site | `index.html` + `industries/*.html` (10) | `/api/gcr/sales-lead` | **New** |

---

## 2. What is broken or missing

### 2.1 Nobody can be an owner

`entity_owners` = **0 rows**. This single table is what every owner-facing endpoint
resolves against. Until a row exists, no business can log in and see anything.

- `users` = 1 (you) · `businesses` = 625 (imported, not signed up)
- `entity_modules` = 37,847 rows, but **0** carry a platform install manifest, so
  `loadInstalled()` skips all of them and the dashboard renders no apps
- `apps` / `site_apps` = 0 — only affects the retired `onboarding.html` path

The signup path itself works (`bookpro-start.html` → `/api/auth/signup` →
`/api/platform/state`, which creates the entity **and** the `entity_owners` row).
It has simply never been run.

### 2.2 Five database functions the code calls do not exist

Verified against `pg_proc`. These are **not** defined in the database:

| Missing function | Called from |
|---|---|
| `create_booking_hold` | `public.js:836`, `public.js:1680` |
| `create_booking_if_available` | `public.js:967`, `public.js:1730`, `dashboard.js:1272` |
| `increment_customer_bookings` | `public.js:941` |
| `increment_deal_clicks` | `deals.js:291` |
| `exec_sql` | `tourist.js:316` |

**The public booking path calls a lock function that doesn't exist, then a
create-if-available function that doesn't exist.** This is consistent with
`bookings` = 0 and `booking_calendar` = 0 — no booking has ever been created.

These exist and are fine: `find_existing_entity`, `fuzzy_entity_search`,
`resource_is_available`, `resource_blocked_dates`, `upsert_preference_score`.

### 2.3 36 of 88 populated tables have zero code touching them

Verified by extracting every `.from('table')` call in `gcr-api-clean` (253 distinct
tables) and diffing against tables that hold rows. These have data and no reader
anywhere in any repo:

**Large and significant:**
- `search_index` — 35,182 rows
- `catalog_items` / `catalog_sections` / `catalog_section_days` — 12,216 / 2,164 / 13,782
- `entity_offer_price` / `entity_offer_section` / `entity_offer_inclusion` — 18,467 / 2,664 / 400
- `entity_google_reviews` — 10,591
- `entity_theme` — 4,034
- `rental_units` (156) · `vessels` (37) · `menu_item_tags` (380) · `entity_relations` (20)
- `booking_platform` (24) · `entity_external_listing` (5)
- `personal_care_services` (171) · `trade_home_services` (60) ·
  `professional_services` (24) · `health_medical_services` (30)

`catalog_items` (12,216) and `menu_items` (11,147) are **two parallel menu models,
both populated, only one read.** Same for `entity_offer*` (18k rows, read by one
narrow AI tool) versus `offerings` (954, read by the entity page) versus
`bookable_resources` (1,055). Nothing in the codebase decides which is canonical.

### 2.4 Zero-row tables that block specific features

| Feature | Blocked by |
|---|---|
| Any booking | `bookings`, `booking_calendar` = 0 + missing RPCs |
| Loyalty | `loyalty_programs`, `loyalty_members`, `customers` = 0 |
| Table QR → review circle | `table_sessions`, `table_orders`, `item_reviews`, `review_invites` = 0, **and zero code** |
| Unified CRM | `customer_profiles`, `customer_identities`, `customer_consents`, `customer_transactions` = 0, **and zero code** |
| Email parser | `email_parser_log`, `business_availability` = 0 — never received an email |
| Attribution / commission | `tourist_click_events` = 5, **written but never read** |
| SMS anything | `sms_log` = 0 — A2P 10DLC not approved |
| Ads / sponsored | `ads`, `page_rails`, `tripswipe_sponsored` = 0 |
| Staff roles | `business_staff` = 0; `permission_catalog`, `module_permissions`, `entity_module_grants`, `action_audit_log` = 0 and zero code |

### 2.5 Routes unmounted because their tables don't exist

`boat-rental`, `charter`, `google-business`, `messaging`, `modules`, `photographer`,
`rides`, `whatsapp` — 8 files commented out in `server.js`.

Note: `public/rides.html` still calls `/api/rides/request`, which is unmounted. That
page is dead.

### 2.6 Security

- **70 tables have RLS disabled**, readable *and writable* by anyone holding the anon
  key — which ships in the `gcr-unified` client bundle. Includes
  `personal_care_services`, `health_medical_services`, `trade_home_services`,
  `recovery_import_log`, `ai_photo_index_full`, and all `*_backup` tables.
- `POST /api/email-parser/inbound` accepts unsigned POSTs — anyone who finds the URL
  can inject fake bookings. (`sms.js` verifies Twilio signatures; this doesn't.)
- Two API repos have drifted: `gcr-api-clean` (live, 54 routes) and
  `cybercheck-api-database` (~36,500 lines, different mount set).

---

## 3. The full circle — what's built vs. what's missing

Target: scan QR → know who scanned → loyalty opt-in → tie to their order → next-day
SMS → item-level review → one verified review per visit.

| Step | Status |
|---|---|
| Scan the QR | ✅ `POST /api/qr/scan/:code` — logs scan, counts, texts owner instantly |
| Track engagement | ✅ `POST /api/qr/track` — events, time on page, **lead score + tier** |
| Capture phone/name | ✅ `POST /api/qr/capture/:code` — attaches to the scan |
| Render the menu | ✅ `/menu/:slug` → `/api/public/menu?slug=` — sections, items, variations, options, drinks, happy hour, specials, photos, hours, events, artist |
| Loyalty opt-in on the menu | ❌ not on the page; `loyalty_*` empty |
| Which table they sat at | ❌ `table_sessions` — 0 rows, 0 code |
| What they ordered | ❌ `table_orders` — 0 rows, 0 code, and no POS link |
| Next-day SMS | ❌ blocked by A2P 10DLC |
| Item-level review | ❌ `item_reviews`, `review_invites` — 0 rows, 0 code |
| Merge multi-guest → 1 review | ❌ not designed |

**The menu page and the scan tracking both already exist. The gap is the middle:
session → order → review.**

Three competing customer stores must be merged first: `qr/capture` writes `customers`,
loyalty would write `loyalty_members`, bookings write `booking_opt_ins`. Same person,
three tables, no link.

---

## 4. Build order

### P0 — makes the system usable at all
1. **Create the 5 missing DB functions**, especially `create_booking_if_available` and
   `create_booking_hold`. Without these no booking can be taken, and the lock is what
   prevents double-booking.
2. **Onboard one real business end to end** through `bookpro-start.html` and fix what
   breaks. `entity_owners` = 0 means this path has never executed.
3. **RLS policies** on the 70 exposed tables.
4. **Start A2P 10DLC registration** — weeks of calendar time, gates every SMS feature.

### P1 — the table QR circle
5. Add loyalty opt-in to `/menu/:slug` (name + phone + email + consent).
6. `table_sessions` — one QR per table, session starts on scan, links scan → table → guests.
7. Guest self-select of items (works with no POS; it's what your own mockup shows).
8. `review_invites` + `item_reviews` + multi-guest merge into one verified review.
9. Merge `customers` / `loyalty_members` / `booking_opt_ins` into `customer_profiles`.

### P2 — the money
10. Stripe **subscriptions** (only Connect + per-transaction fee exist today).
11. **Attribution**: read `tourist_click_events` back, match `gcr_ref` in confirmation
    emails, write a conversion, compute commission.
12. Referrer payout leg (second Stripe transfer — `referral_partners` = 0).

### P3 — resolve the duplication
13. Pick one menu model: `catalog_items` (12,216) or `menu_items` (11,147).
14. Pick one catalog model: `offerings` / `entity_offer` / `bookable_resources`.
15. Wire or drop `search_index` (35,182 rows, unread).
16. Surface `entity_google_reviews` (10,591 rows, unread).
17. Archive `cybercheck-api-database`.

### P4 — new surfaces
18. Links page as a **rendering mode over installed modules**, not hand-entered links.
19. Gmail OAuth / unified inbox (the "CyberCheck Connect" product — 0% built).
20. Voice AI number, white-label, marketplace.

---

## 5. Open decisions

1. **Table QR: ordering or browse-only?** Cart + `+` buttons in the mockups imply
   ordering. `orders` / `order_lines` exist with 0 rows and 0 code. Very different scope.
2. **Ads on the table menu** — business toggle? revenue share? Never a competing
   restaurant?
3. **"What they ordered"** — guest self-select (works today) or POS/receipt parsing?
4. **One QR per table or per restaurant?** Per-table is required for session + review
   specificity, and means printing a code per table.
5. **Which menu model is canonical** — `catalog_items` or `menu_items`?
