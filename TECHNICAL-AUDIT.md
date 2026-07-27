# cybercheck-login — Technical Audit

Full line-by-line read of every JS module and HTML page in this repo (via a snapshot in `dashboard.zip`, cross-verified as 87/96 identical filenames to the live `js/` dir, plus a direct read of the 9 files only in the live repo, plus a direct read of all 62 root HTML pages). Purpose: permanent reference so nobody has to re-read the whole repo to remember what's real, dead, or broken.

Last full audit: 2026-07-27. See also `PLATFORM-OFFERINGS.md` / `PLATFORM-OFFERINGS-PART2.md` for the sales/marketing-facing product catalog (what was pitched), and `gcr-api-clean/TECHNICAL-AUDIT.md` + `gcr-unified/TECHNICAL-AUDIT.md` for the backend and the tourist-app frontend.

## 0. THE CRITICAL STRUCTURAL FINDING — two dashboards, two signup paths, they never meet

- **Main signup path**: `login.html:329` → `app-dashboard.html`. Real, live, auth-guarded, loads ~45 fixed `<script>` tags. Talks to `CC.dashboard.*` → `/api/dashboard/*` → the `businesses` table (main CyberCheck account model). **Not modular** — no install/uninstall, fixed feature set baked into the script list.
- **Second signup path**: `bookpro-start.html` (a separate "BookPro" wizard) → `modular-dashboard.html` (lines 264, 315, 597). This IS the real modular App Store — code comment: "APP CATALOG — every app is its own standalone file in /apps/... The dashboard is a shell." Dynamically renders installed apps from `apps/*.json` (69 manifests), supports an open registry (any business can publish new apps via `POST /api/platform/registry`). Talks to `js/bookpro-cb.js` → `/api/platform/*` on the `entity`/GCR-linked data model (see `gcr-api-clean/TECHNICAL-AUDIT.md` §1 for the `businesses` vs `entity` distinction).
- **These are not connected.** A user through the main site gets the old fixed-module dashboard. A user through BookPro gets the real App Store dashboard, on a different data model. `modular-dashboard.html` is not linked from `login.html` or `app-dashboard.html` anywhere — confirmed via repo-wide grep, only referenced by `bookpro-start.html` and this repo's own docs.
- **To make "the user dashboard is modular with an App Store" true for everyone**: either (a) point `login.html:329`'s redirect at `modular-dashboard.html` instead of `app-dashboard.html` — cheapest, but most of `app-dashboard.html`'s 45 real working features have no `apps/*.json` manifest yet, so existing `businesses`-table users would see a nearly-empty app store on day one — or (b) write manifests for `app-dashboard.html`'s real features so they become installable modules, then switch the redirect. Also see the `platform.js` `ownedSlug()` limitation in `gcr-api-clean`'s audit — the `/api/platform` model currently supports **one owned entity per account**, a constraint that doesn't exist on the `businesses` model.

## 1. Auth flow (as designed, per this repo's own CLAUDE.md, confirmed against code)

1. `login.html` → `POST gcr-api-clean/api/admin/login` (tried first) or `CC.login`/`CC.signup` → `/api/auth/*` → JWT stored as `localStorage.cc_admin_token` or `cc_token`
2. `admin.html` re-confirms the token server-side (`GET /api/admin/gcr/claims`) before rendering — redirects to `login.html` if missing/wrong-role/failed check
3. `admin.html` does NOT load `js/cc.js` — its GCR panels are inline `<script>` with their own local `API_BASE`
4. Non-admin pages (`login.html`, `ai-chat.html`, `app-dashboard.html`, `app-store.html`) load `js/cc.js`, which also points at `gcr-api-clean.vercel.app`

## 2. admin.html — the real, single, working ops console

22,977 lines, 57 `id="page-*"` panels, backed entirely by `gcr-api-clean/routes/admin.js` (3906 lines, no stubs found on the backend side — see that repo's audit). Panels: `gcr-businesses`, `gcr-entity-editor` (tabbed: Info/Hours/Photos/Tags/Features/Content/Sections/Pages/Wavegent), `gcr-site-editor`, `gcr-claims`, `gcr-events`, `gcr-specials`, `gcr-ads`, `gcr-coupons`, `gcr-seo`, `bulk-upload`, `bulk-events`, `ai-chat`, `ai-organize`, `rag-index`, `tripswipe-*`, plus platform ops/content/AI/comms/system panels. API key input fields (Stripe/OpenAI/Anthropic/Grok/GA4/FB-Ads/Square) are real `type="password"` fields POSTing to `/api/admin/save-api-key`/`/api/admin/ai-settings` — the correct, secure pattern (contrast with `admin-dashboard.html` below).

There is a **second, legacy admin tool**: `admin-dashboard.html` — its own `<title>` literally says "⚠️ LEGACY (not connected)." Despite the label it does have some real `fetch()` calls (`gcr-api-clean.vercel.app/api/gcr/*`, `/api/admin/*`), but: Overview/Users tabs show fabricated stats (1,247 users / $42,350 revenue, fake named rows); GCR Businesses tab points at dead `http://localhost:3002/api`; API-key fields (Stripe secret, webhook secret) save to `localStorage` only with a literal comment "in production, save to backend" — if a real live secret were ever entered here it sits in plaintext browser storage; exposes internal infra (Supabase project ID, `localhost:3000`/`3002`, developer's local `file:///Users/owner/...` paths). Not linked from anywhere in the main nav; reachable only from `gcr-entity-manager.html`.

**`gcr-entity-manager.html`** — a third, independent GCR entity editor. WORKING but architecturally distinct: it hits the **GCR Supabase REST API directly** (`${SUPABASE_URL}/rest/v1/entity...`) rather than going through `gcr-api-clean`'s `/api/admin/gcr/*` routes that `admin.html` uses. A parallel, bypass write-path to the same tables. Not linked from anywhere — orphaned, bookmark-only tool.

## 3. The two user/business dashboards

### app-dashboard.html — the real, live-routed one
Auth-guarded (real Supabase session check), loads ~45 real `js/*.js` modules (see §4), Stripe publishable test key hardcoded in the page (`pk_test_51SmhDo0...`, standard practice for publishable keys but flagged since it's a static file). This is the file that pulls in the 3 dead JS files (`payment-processor.js`, `portfolio.js`, `services.js` — see §4) — those three fail silently since they call relative/nonexistent endpoints instead of the real API host.

### modular-dashboard.html — the real, NOT-live-routed App Store shell
1585 lines. Key lines: `276-285` (server sync via `/api/platform`), `300-330` (APP CATALOG comment, open-registry logic, `customApps = loadRegistry()`, `publishToServer`/`unpublishFromServer` → `POST/DELETE /api/platform/registry/:id`). Renders whatever's installed from the 69 `apps/*.json` manifests (see §5). Only reachable via `bookpro-start.html`'s post-signup redirect.

## 4. JS modules (`js/*.js`) — full inventory, 92 authored files (excludes vendored `tabler.min.js`)

Legend: WORKING = real API calls / real logic. STUB = `console.log`/`setTimeout`/hardcoded fake data instead of real persistence. DEAD = orphaned, unreferenced, or a superseded duplicate.

### Core infrastructure
- **`cc.js`** — WORKING. Central client, `CC.dashboard.*` (60+ methods), mostly Supabase-direct with an Express fallback for login. 2-min auto-cache on `get*`, auto-invalidated by writes. The real backbone almost everything else depends on. Touches: `businesses`, `site_content`, `bookings`, `customers`, `reviews`, `coupons`, `specials`, `media`, `faqs`, `staff`, `menu_items`, `events`, `fleet_types/items`, `rental_time_slots/pricing/addons`, `orders`, `waivers`, `connections`, `site_pages`, `notifications`, `sms_log`, `activity_log`, `availability`, `blackout_dates`, `messaging_settings`, `waitlist(_settings)`, `locations`, `site_apps`, `apps`, `seo_meta_tags`, `sitemap_config`, `robots_config`, `social_media_accounts/posts/analytics`, `onboarding_progress`, `page_views`, `conversions`, `booking_funnel`, `review_questions`; also `/api/auth/login`, `/api/auth/signup`, `/api/sms/send`.
- **`supabase-client.js`** — WORKING. Direct browser Supabase init. **Hardcoded real credentials at lines 4-5**: project URL `mhafixflyffflwjhcgfn.supabase.co` + full anon JWT (anon key, not service-role — expected to be public per Supabase's design, not a secret leak, but flagging for completeness).
- **`api-client.js`** — WORKING (legacy). Separate `APIClient` class hitting `http://localhost:3000/api`. A second, older, competing backend-integration pattern used by `dashboard.js`, `voice-calls.js`, `tasks.js`, `leads.js` via `shared/api.js`.
- **`auth.js`** — WORKING. Wraps `CC.signup`/`CC.login`/Supabase auth.
- **`router.js`** — WORKING. Pure client routing, sidebar nav, toast, no API.
- **`module-registry.js`** — WORKING but the referenced module files (`restaurant-menu.js`, `bakery-menu.js`, `charter-booking.js`, `salon-booking.js`, `service-booking.js`, `basic-crm.js`, `sms-notifications.js`, `review-requests.js`, `social-feed.js`, `loyalty.js`, `qr-menu.js`) **don't exist in this directory** except `rental-booking.js` — this "app store" concept (a third, separate one from `modular-dashboard.html`/`apps/*.json`) is aspirational, mostly unbuilt.
- **`module-loader.js`** — WORKING (partial). `initBusinessTypeModules()` reads `site_apps` via Supabase to pick nav items; hardcoded fallback maps per business type.
- **`business-loader.js`** — WORKING. `GET /api/gcr/businesses` — separate GCR directory product, unrelated to the tenant dashboard.
- **`main.js`** — DEAD/marketing. Public marketing site (cybercheck.com) scroll/mobile-menu/ROI-calculator, not the dashboard.
- **`marketing.js`** — STUB. Marketing-site FAQ/contact form; `initializeContactForm()` fakes submission with `setTimeout`, real fetch commented out.
- **`theme.js`** — WORKING. `CC.dashboard.getTheme/updateTheme`.
- **`data-sync.js`** — WORKING (legacy static site). Fetches `../site-data.json`, used by a static template, not the dashboard.

### Booking/scheduling
- **`modules/rental-booking.js`** — WORKING. Full rental module: fleet, time slots, pricing grid, add-ons, waiver, bookings. `/api/site/fleet`, `/time-slots`, `/pricing`, `/addons`, `/waivers/template`, `/waivers/signed`, `/api/stripe/status`. The real "install this app" engine behind `module-registry.js`'s references.
- **`bookings.js`** — WORKING. Full lifecycle: confirm/complete/cancel+Stripe refund, resend confirmation, waiver link, live 30s polling, WhatsApp/owner notification. `POST /api/stripe/refund`, `GET /api/dashboard/declined-bookings`, `POST /api/public/resend-confirmation`, `/api/public/waivers/send-link`.
- **`availability.js`** — WORKING. `CC.dashboard.getAvailability/setAvailability`.
- **`blackout-dates.js`** — WORKING. `CC.dashboard.getBlackoutDates/addBlackoutDate/deleteBlackoutDate`.
- **`calendar-api.js`** — WORKING. Real week/list appointments UI, `shared/api.js` (Express backend), separate `contact_id`-linked model.
- **`calendar-view.js`** — WORKING. Visual calendar layer over `bookings.js`'s data, no direct API calls.
- **`calendar.js`** — **DEAD/STUB**. Near-identical UI to `calendar-api.js` but zero real API calls — `loadAppointments()` just logs, `saveAppointment()` only `console.log`s with "In production: API call." Superseded by `calendar-api.js`; **both are loaded in the file list, real risk of colliding on the same DOM ids if both ever attach.**
- **`waitlist.js`** — WORKING. `CC.dashboard.getWaitlist/updateWaitlistSettings/updateWaitlistEntry/deleteWaitlistEntry`.
- **`inventory.js`** — WORKING. `CC.dashboard.getFleetTypes/createFleetType/updateFleetType/deleteFleetType` + Supabase photo upload.
- **`profile-booking.js`** — **STUB/FAKE**. Full reservation UI for "The Sandbar Restaurant," `submitBooking()` only `setTimeout` + `localStorage`, no fetch at all. Disconnected demo, not the real booking system.

### CRM/customer/lead
- **`contacts-api.js`** — WORKING. Real CRM contact list/detail/create/update/delete via `shared/api.js`.
- **`contacts.js`** — **DEAD**. Earlier version, zero fetch calls, hardcoded `demoData` (John Smith, Sarah Johnson, `i.pravatar.cc` avatars), `saveContact()` only logs. Superseded by `contacts-api.js`.
- **`customers.js`** — WORKING. `CC.dashboard.getCustomers/createCustomer/updateCustomer`, business-card OCR scan `POST /api/dashboard/contacts/scan-card`, falls back to building customer list from bookings if API returns nothing.
- **`leads.js`** — WORKING. Real drag-and-drop sales pipeline (new/contacted/qualified/proposal/negotiation/won/lost). `/leads...`, `/leads/stats`, `/leads/pipeline`. **Note: `gcr-api-clean`'s `dashboard.js` has NO backing routes for a leads pipeline** — this file must be hitting a different/legacy backend (`shared/api.js`'s Express host) that may not exist in the current `gcr-api-clean` deployment. Verify before relying on it.
- **`tasks.js`** — WORKING (client-side). List+board views, drag-and-drop. `/tasks...`, `/tasks/stats`, `/tasks/board`. **Note: confirmed via grep across `gcr-api-clean` that there is NO tasks table/route anywhere in that repo** — same caveat as leads.js.
- **`voice-notes.js`** — WORKING with demo fallback. `POST /api/voice-notes/upload`, polls status. **Falls back to hardcoded `sampleNotes` (John Smith/ABC Construction, Sarah VIP patio) if the API throws** (lines 23-79, 1197-1204) — a real feature with a silent demo-data safety net that could mask a real outage.
- **`custom-fields-manager.js`** — WORKING. Dynamic CRM field config extracted from voice notes.
- **`loyalty-rewards.js`** — WORKING. `/loyalty/program`, `/loyalty/stats`, `/loyalty/members`.

### Content (menu/gallery/events/specials/profile/site)
- **`menu.js`** — WORKING. Category+item CRUD, AI menu-photo extraction. `CC.dashboard.getMenu/...`, `POST /api/dashboard/menu/extract`.
- **`menu-crud.js`** — WORKING, more complete. Different backend (`/api/menu/categories`, `/api/menu/items`), overrides `window.saveCategory`/`saveItem` from `menu-manager.js` at runtime.
- **`menu-manager.js`** — **STUB**, superseded. Base "Content Manager" UI, every save only `console.log`s with "In production: API call" — monkey-patched/overridden by `menu-crud.js`.
- **`menu-ai-training.js`** — WORKING. Real MediaRecorder voice/text AI-sales-training upload per item, async polling.
- **`events.js`** — WORKING. CRUD + AI flyer extraction.
- **`specials.js`** — WORKING. Same pattern, shared extraction endpoint (`extract_type:'specials'`).
- **`media.js`** — WORKING. Media grid, drag/drop upload.
- **`media-accessories.js`** — WORKING (separate backend). Docks/features/steps editor, hits `MA_API = 'https://cybercheck-api-database.vercel.app'` — the OLD/legacy hostname, not the current `gcr-api-clean` host. `GET /api/data`, `POST /upload`, `POST /save`.
- **`upload.js`** — WORKING. Supabase Storage upload helper, per-folder resize config, HEIC blocking.
- **`faq.js`** — WORKING. Real drag-reorder via `sort_order`.
- **`pages.js`** — WORKING. `site_pages` CRUD.
- **`site-editor.js`** — WORKING (blob backend). Raw HTML/CSS section editor + live preview + `{{token}}` templating. `GET /api/site-data`, no save endpoint in this file — relies on `page-builder.js`/`-enhanced.js` to persist.
- **`page-builder.js`** — STUB-ish. Simplified 5-section visual builder, lighter/parallel version of `page-builder-enhanced.js`.
- **`page-builder-enhanced.js`** — WORKING, larger overlap with `website-content.js`. `https://cybercheck-api-database.vercel.app/api/site-data` (legacy host), `POST /api/upload-image?context=...`.
- **`website-content.js`** — WORKING, 1823 lines, **the largest and most complete site-content CMS**: 20 sections (business, hero, about, products, group_rate, docks, whats_included, addons, booking_settings, steps, features, locations, links_page, gallery, reviews, qna, promotions, cta, contact, footer). `GET/POST /api/site-data`, `PUT /api/dashboard/website-content/:section`, `GET .../website-content`, `PUT /api/dashboard/profile`, `PUT .../hero_cta_text|url`, `PUT/GET /api/dashboard/addons`, `PUT .../addons/sync`, `GET/PUT /api/dashboard/fleet[/:id]`. Real gallery dedup via SHA-256, drag-reorder incl. touch, gallery-tabs (max 5), shared "pick from gallery" modal. **The canonical editor** — `page-builder.js`/`page-builder-enhanced.js`/`media-accessories.js` read as earlier iterations still shipping alongside it.
- **`profile.js`** — WORKING. Business profile form, also tries `GET /api/site-data` as secondary source, stores happy-hour schedule into `businesses.metadata.hh_schedule`.
- **`profile-editor.html`'s backing** — see §6 (page is a stub, `saveProfile()` `// TODO: Send to backend API`).
- **`profile-editor.js`** (a different "profiles" concept — multiple profiles per account) — WORKING but with a gap: `apiGet/apiPost/apiPut('/profiles...')`, TODO comment confirms hours/links/social from profile JSON fields aren't actually populated on load.
- **`profile-menu.js`** — **STUB/FAKE**. Public order-cart page for "The Sandbar Restaurant," cart in `localStorage`, `checkout()` only `console.log`s "In production: redirect to checkout page." Demo, disconnected from the real menu system.
- **`profile-templates.js`** — WORKING. Links/card/full-profile analytics + QR (via external `api.qrserver.com`).
- **`profile-links.js`** — WORKING. Public Linktree-style bio renderer.
- **`business-card.js`** — WORKING/STUB mix. Public digital card, real vCard download, but `sendContactInfo()` lead-capture form is entirely `setTimeout`-simulated ("TODO: Implement contact/lead creation endpoint").
- **`staff.js`** — WORKING. `CC.dashboard.getStaff/...` + photo upload.
- **`account-dashboard.js`** — **DEAD**. "Multi-profile" account overview, every action is `console.log`+fake toast, hardcoded "Managing 3 active profiles."
- **`qr-codes.js`** — WORKING. Real per-business QR manager, `GET/POST /api/qr`, `PATCH /api/qr/:id`, `GET /api/qr/:id/scans`, tracks phone-number leads.
- **`wavegent-tab.js`** — WORKING (thin). `GET /api/gcr/entity/:slug` for the separate GCR product.

### Marketing/comms (SMS, social, email, reviews)
- **`sms-automations.js`** — WORKING. Campaigns+automations tabs, shared-vs-dedicated Twilio number display.
- **`coupons.js`** — WORKING. CRUD + SMS marketing campaign composer + embed generator.
- **`messaging.js`** — WORKING. Notification config, booking SMS templates w/ live preview, photo-to-gallery via MMS, Voice AI toggle, WhatsApp booking alerts (`POST /api/whatsapp/send`), explicit TCPA SMS-consent checkbox+timestamp.
- **`social.js`** — WORKING (mixed). Post composer/scheduler/analytics is real; **`connectSocial()` (platform OAuth) is entirely simulated** — `setTimeout` fake "connected!" toast, "TODO: Implement full OAuth flow with backend."
- **`social-media-feed.js`** — WORKING. Public FB/IG widget, ES module.
- **`social-media-settings.js`** — WORKING. **Real Facebook OAuth popup flow** — `GET /api/social-media/connect/facebook`, popup+poll, `/connections/:id/sync`.
- **`oauth.js`** — WORKING (mostly). Stripe Connect/manual-key, Square, Google Business, WhatsApp Business (real FB SDK OAuth) are real. **But `toggleSocialConnection()` for facebook/instagram/tiktok/twitter/youtube in THIS file is simulated via `confirm()` dialog** ("Click OK to simulate a successful connection") — **duplicates/conflicts with the real Facebook OAuth in `social-media-settings.js`.** `paypal`/`google_analytics`/`google_maps` marked "Coming soon."
- **`reviews.js`** — WORKING with demo fallback. Full moderation (approve text/photos separately, publish, owner SMS reply, duplicate-booking-guarded review requests, custom questions, Google Business sync). **Falls back to hardcoded `_demoReviews` (Emily Chen, James Wilson) if the API is unavailable or returns empty** (lines 44-104, 123-137).
- **`review.js`** — **STUB/FAKE**. Public receipt-verified review flow for "The Sandbar Restaurant." `simulateOCR()` (91-117) returns a hardcoded fake item list regardless of the uploaded image; `submitReview()` (368-398) is a `setTimeout` fake with the real fetch commented out. Entirely non-functional demo.
- **`voice-calls.js`** — WORKING. Call history/transcript/action-plan viewer, ES module via `shared/api.js`.
- **`ai-assistant.js`** — WORKING. Sophisticated floating AI chat: text+voice (SpeechRecognition/Synthesis), image attach, markdown, conversation persistence, tool-call hooks into `loadMenu()`/`loadSpecials()`/`loadEvents()` for `add_menu_items`/`add_specials`/`add_events`/`update_hh_schedule`/`save_memory`.
- **`sales-page.js`** — WORKING (separate admin tool). Edits `cybercheck-links` marketing pages. `https://cybercheck-api-database.vercel.app/api/gcr/sales-page/:pageId` (legacy host).
- **`csv-import-manager.js`/`csv-import-system.js`** — WORKING (client-side parse+sync). 9 record types for the GCR directory (BUSINESS/HOURS/SERVICE_WINDOW/MENU_SECTION/MENU_ITEM/OPTION_GROUP/OPTION/EVENT/POLICY), `csv-import-manager.js` syncs via `POST /api/admin/gcr/import-csv`. Feeds the GCR directory, not the tenant's own site. **Per this repo's own CLAUDE.md, `csv-import-manager.js` isn't loaded by any `.html` page — the actually-reachable CSV/bulk-upload flow is inline `<script>` in `admin.html`.**

### Admin/platform
- **`admin-businesses.js`** — **STUB**. Search/filter/suspend/export superadmin UI, `filterAndDisplayBusinesses()` never actually filters ("would filter actual data" comment), `suspendBusiness()` only mutates DOM after `setTimeout`, `generateCSV()` returns a hardcoded fake CSV. Zero real API calls.
- **`admin-dashboard.js`** — **STUB**. Canvas revenue chart from `Math.random()`, hardcoded `console.log('Total businesses: 247')`. Zero API calls.
- **`admin-plans.js`** — **STUB**. Plan/feature-flag editor, `savePlan()`/`saveAllPlans()` only `console.log`+fake-success toast.
- **`billing.js`** — **STUB/mixed**. Plan display real-looking, `changePlan()` (176-186) **only writes to `localStorage`**, no real subscription-change call, despite a real Stripe Elements `createPaymentMethod()` call for saving a card. Inconsistent with the working `billing-settings.js`.
- **`billing-settings.js`** — WORKING. Real Stripe Checkout/Customer Portal: `/billing/subscription`, `/plans`, `POST /billing/checkout` (redirects to Stripe), `/portal`, `/usage`, `/invoices`. **This is the functioning billing flow — `billing.js` is the broken parallel one.**
- **`domain.js`** — mixed, partially fake. Subdomain rename is real. **"Buy a Domain" (`searchDomains()`, `buyDomain()`) is entirely simulated** — `setTimeout` + `Math.random()>0.3` fake availability, fake purchase, fake SSL countdown, no real registrar API anywhere (~lines 304-379). DNS verification (`verifyDns()`) likewise simulated.
- **`seo.js`** — WORKING. Meta tags, sitemap, robots.txt, GA4/Pixel IDs, schema.org preview. `generateSitemap()` calls a Postgres RPC (`generate_sitemap`) via `cc.js`.
- **`analytics.js`** — WORKING. `CC.dashboard.getAnalytics` — real funnel/traffic-source/device analytics computed server-side.
- **`onboarding.js`** — **STUB**. 4-step wizard, `checkUsernameAvailability()` checks against a hardcoded taken-list, `completeOnboarding()` has a commented-out real fetch — the AI "chat setup" is scripted client-side with canned responses. **Note: `onboarding.html` (the standalone page, different from this JS module) IS real and working — don't confuse the two.**
- **`ar-hunt-manager.js`** — **DEAD**. 752-line "Pokémon-GO-style" AR treasure hunt for the GCR product, 100% localStorage, zero API calls, references undefined `window.rewardsManager`. Appears entirely unshipped/orphaned — no visible UI entry point found. (Note: a real, working, server-backed AR hunt system DOES exist — `gcr-api-clean/routes/ar-hunts.js` + `gcr-unified/src/pages/ArHunts.jsx` — this file is unrelated dead weight, not the real feature.)
- **`waivers.js`** — WORKING (mixed). Signed-waiver log is real (`waivers` table); waiver templates persist to `localStorage` only, not the DB; third-party e-signature "connect" buttons (DocuSign/HelloSign/PandaDoc) are simulated.
- **`dashboard.js`** — **legacy/likely dead**. Full alternate dashboard built against `api-client.js`/`localhost:3000`. Bug: `window.viewVoiceNote` is exported but the function is never defined (only `viewVoiceNoteDetails` exists). Predates the Supabase-direct rewrite.

### The 9 files that exist in the live repo but weren't in the older dashboard.zip snapshot
- **`app-registry.js`** — WORKING. `fetch('apps/index.json')` + per-manifest fetch + `_categories.json`/`_presets.json`. Drives `modular-dashboard.html`. Fault-isolated (bad manifest → skipped+logged, never crashes).
- **`bookpro-cb.js`** — WORKING. Defines `window.CB`, real fetches to `/api/auth/{signup,login}`, `/api/platform/{state,records/*,upload}`. Heavily used by `bookpro-start.html` (20+ call sites). The real BookPro engine.
- **`calendar-sync.js`** — WORKING. `CC.dashboard.{getIcalFeedUrl,regenerateIcalFeed,getExternalCalendars,addExternalCalendar,deleteExternalCalendar,syncExternalCalendarNow}` → real `/api/dashboard/ical/*`. **Caveat: `gcr-api-clean/server.js` mounts `/api/dashboard` despite a `// TODO: has missing module dependencies` comment — this endpoint family's production reliability is unverified.**
- **`payment-processor.js`** — **DEAD**. `PaymentProcessor`/`StripeProcessor`/`SquareProcessor`/`PayPalProcessor`, posts to relative `/api/payment/charge`/`/refund` — no such route exists anywhere (not in this static site, not in `gcr-api-clean`, not in `vercel.json`). Loaded by `app-dashboard.html` but never actually called by anything else.
- **`policies.js`** — WORKING. `CC.dashboard.{getPolicies,updatePolicies,uploadDocument,deleteDocument}` → real `/api/dashboard/policies`, `/documents/*`.
- **`portfolio.js`** — **DEAD**. `fetch('/api/portfolio?site_id=...')` — relative, no matching endpoint anywhere. `openPortfolioModal()`/`editPortfolioItem()` explicit TODO stubs. Fails silently (caught error, shows nothing).
- **`rooms.js`** — WORKING. `CC.dashboard.{getUnits,createUnit,updateUnit,deleteUnit,getUnitAvailability,...}` → real `/api/dashboard/units*`.
- **`services.js`** — **DEAD**. `fetch('/api/services?site_id=...')` — relative path, 404s (note: `gcr-api-clean` DOES mount `/api/services`, but this file never calls that host). `openServiceModal()`/`editService()` explicit TODO stubs.
- **`transportation.js`** — WORKING. `CC.dashboard.{getTransportSettings,updateTransportSettings,getTransportProviders,addTransportProvider,updateTransportProvider,deleteTransportProvider,getTransportRequests}` → confirmed-live `/api/transportation/*`.

**Summary: 6/9 working, 3 dead** (`payment-processor.js`, `portfolio.js`, `services.js`).

## 5. apps/*.json — the real 69-app catalog (backs `modular-dashboard.html`)

| Category | Apps |
|---|---|
| **booking** (18) | availability, book-boat, book-charter, book-class, book-dolphin, book-hairstylist, book-lodging, book-photographer, booking, fleet, gift-cards, memberships, ordering, properties, reserve-table, rides, services, waitlist, waivers |
| **commerce** (2) | addons, inventory |
| **connect** (8) | ai-concierge, email-parser, gcr-listing, oauth-google, oauth-instagram, oauth-square, payments, qr-codes |
| **content** (18) | about, checklist, client-galleries, contact, cta, events, faq, features, footer, gallery, hero, highlight, hours, links, locations, menu, richtext, specials, steps |
| **engage** (10) | checkout, crowdfund, forms, guest-videos, loyalty, reminders, reviews, reward-offers, shoutouts, song-request, tipjar |
| **grow** (1) | seo |
| **operate** (6) | analytics, coupons, customers, messaging, qr-redirect, staff |

**`ordering.json` currently leads nowhere** — its backend (`orders` table) doesn't exist in production (confirmed in `gcr-api-clean`'s audit, §4). No manifests exist yet for the real-but-unmounted backend features (WhatsApp, Google Business OAuth) — building those out would need both the `gcr-api-clean` remount AND a new manifest here.

## 6. Root HTML pages (62 files) — full inventory

Systemic issue affecting **23 files**: they `<script src="../../packages/ui-kit/components/universal-nav.html">` and/or `hamburger-nav.html`, and/or `<link href="../../packages/css/core.css">` — **none of these paths exist anywhere in this repo** (no `packages/` directory). These silently 404; the "universal nav" never renders on any of them. Affected: `admin-dashboard.html`, `admin-pricing.html`, `ai-chat.html`, `audit.html`, `automation-builder.html`, `automation-setup.html`, `automation-templates.html`, `card-builder.html`, `connection-manager.html`, `connection-manager-dynamic.html`, `create-workflow-ai.html`, `customer-dashboard.html`, `dashboard-charter.html`, `dashboard-restaurant.html`, `demo.html`, `index.html`, `industries.html`, `installed-apps.html`, `navigation-demo.html`, `platform.html`, `profile-editor.html`, `settings.html`, `tool-selection.html`, `workflow-logs.html`.

Second systemic issue affecting **4 marketing landing pages** (`automations.html`, `booking.html`, `menu-updates.html`, `reviews.html`): `<link href="/css/sales.css">` + `<script src="/js/sales-config.js">` — **neither exists in this repo** (they live only in the sibling `cybercheck-links-` repo). These render unstyled and their `initSalesPage()`/`SalesConfig.load()` calls throw/no-op.

| File | Status | Notes |
|---|---|---|
| `admin.html` | **WORKING** — real, primary ops console | See §2 |
| `admin-dashboard.html` | **LEGACY, mixed** | See §2 |
| `admin-pricing.html` | **DEAD/STUB** | `localStorage` only, "in production, this would be an API call" |
| `ai-chat.html` | **WORKING** with graceful fallback | Real `CC.getSession()` admin guard, `POST /api/dashboard/ai-chat` |
| `app-dashboard.html` | **WORKING** | See §3 |
| `app-store.html` | **WORKING** | `GET /api/apps`, `POST /install`, `DELETE /uninstall/:id` |
| `audit.html` | **DEAD/STUB** | Hardcoded fake log, auto-refreshes same fake data |
| `automation-builder.html` | **DEAD/STUB** | Hardcoded automations, `saveAutomation()` is `alert()` |
| `automation-setup.html` | **DEAD/STUB** | `processAIInput()` is fake keyword parsing, `alert('Demo mode')` |
| `automation-templates.html` | **DEAD/STUB** | `activateTemplate()` is `alert('Demo mode')` |
| `automations.html` | **BROKEN** (missing assets) | Marketing page, see systemic issue #2 |
| `beachside-circle-boats-dashboard.html` | **WORKING** | Real, full custom dashboard for one live client, loads ~35 real `js/*.js` modules. Reached via `login.html`'s hardcoded `CIRCLE_BOATS_SITE_ID` redirect |
| `biz.html` | **WORKING** | `/p/:slug` live route, `GET /api/platform/page/:slug` |
| `book.html` | **WORKING** | `/book/:slug/:app` live route, Stripe checkout |
| `booking.html` | **BROKEN** (missing assets) | Marketing page |
| `bookpro-start.html` | **WORKING** | Real BookPro wizard, see §0 |
| `bookpro.html` | **WORKING** (static marketing) | Links to `bookpro-start.html` |
| `card-builder.html` | **DEAD/STUB** | `saveCard()`/`uploadMedia()` are `alert()`s |
| `card.html` | **WORKING** | NFC/vCard page for one real person, `POST /api/gcr/lead-notify` |
| `claim-business.html` | **WORKING** | `GET /api/auth/invite/:token`, `POST /accept-invite` |
| `connection-manager.html` | **DEAD/STUB** | `connectTool()` is `setTimeout` fake OAuth |
| `connection-manager-dynamic.html` | **DEAD** | Hardcoded `localhost:3000` |
| `create-workflow-ai.html` | **WORKING with fallback** | Real AI calls, graceful degrade to keyword-parsed draft |
| `customer-dashboard.html` | **DEAD/STUB** | All hardcoded demo data |
| `dashboard-charter.html` | **DEAD/STUB (demo)** | 100% hardcoded, seeded by `demo.html` |
| `dashboard-restaurant.html` | **DEAD — hard crash** | Calls undefined global `CyberCheckAPI` (real client exports `api`/`APIClient`, not `CyberCheckAPI`) — `ReferenceError` on line 472, halts ALL script execution on the page. Also loads a nonexistent `packages/ui-kit/...` script |
| `demo.html` | **DEAD/STUB (by design)** | Seeds `localStorage` demo data, routes to charter/restaurant demo dashboards |
| `enter-stripe-key.html` | **WORKING** | Real token-link Stripe key submission, format-validated client-side |
| `gcr-entity-manager.html` | **WORKING, architecturally distinct** | See §2 — bypasses `gcr-api-clean`, hits GCR Supabase REST directly |
| `index.html` | **WORKING (static)**, dead links | Links to `demos/` — directory doesn't exist |
| `industries.html` | **WORKING (static)**, dead links | Links to `demos/`, `integrations.html` — neither exists |
| `installed-apps.html` | **DEAD** | Declares `localhost:3000` API_BASE but never uses it — hardcoded array instead |
| `login.html` | **WORKING — the real production login/signup page** | See §1, §0 |
| `manage.html` | **WORKING** | `/manage/:id?t=` live route |
| `menu-editor-dark.html` | **WORKING** | Dark variant, missing "Today's Picks" vs the light one |
| `menu-editor-popup.html` | **WORKING** | Iframe/popup variant loaded from within `admin.html` |
| `menu-editor.html` | **WORKING** | Main standalone PIN-gated editor |
| `menu-setup.html` | **WORKING but server-templated** | Renders unescaped `${esc(name)}` placeholders as literal text if opened directly — expects a server-side templating pass first |
| `menu-update.html` | **WORKING** | `/daily/:slug` live route |
| `menu-updates.html` | **BROKEN** (missing assets) for its own chrome | The "Try It" link to the real `menu-editor.html` works |
| `modular-dashboard.html` | **WORKING, orphaned from main signup** | See §0, §3 |
| `navigation-demo.html` | **DEAD/STUB (by design)** | UI showcase for the (broken) hamburger-nav |
| `onboarding-links.html` | **DEAD/ORPHANED** | Uses a DIFFERENT hardcoded Supabase project (`mkepugvdlktfsossumox.supabase.co`) and schema (`profiles`, `installed_modules`); redirects to `dashboard.html`, which doesn't exist as a file |
| `onboarding.html` | **WORKING** | Real production onboarding wizard, `GET /api/apps`, `PUT /api/site/content`, `POST /api/apps/install` |
| `page.html` | **WORKING** | Universal GCR mini-site renderer |
| `platform.html` | **WORKING (static)**, dead links | Marketing comparison page |
| `preview.html` | **DEAD** | `localhost:3000`-only backend |
| `profile-editor.html` | **DEAD/STUB** | `saveProfile()` explicit "TODO: Send to backend API," shows "Backend API not connected yet" |
| `public.html` | **DEAD/STUB (demo)** | Static "Joe's Pizza" linktree, all `href="#"` |
| `q.html` | **WORKING** | `/q/:code` live QR-tracking route |
| `restaurant-editor.html` | **WORKING** | Reached via `gcr-api-clean`'s `/api/update/:token` redirect |
| `reviews.html` | **BROKEN** (missing assets) | Marketing page |
| `sales.html` | **WORKING (static, self-contained)** | Minor dead links to nonexistent `privacy.html`/`terms.html` |
| `settings.html` | **DEAD — hard crash** | Same `CyberCheckAPI` undefined bug as `dashboard-restaurant.html` |
| `signup.html` | **BROKEN** | Calls undefined `CyberCheckAPI.auth.oauthSignup`/`.signup` in submit handlers — page loads fine, actual signup action fails at click-time. **This is the page `index.html`'s "Start Free" links to.** |
| `song-request.html` | **WORKING** | Real production URL for musicians, Venmo/CashApp payment-note flow |
| `sql-setup.html` | **DEAD (dev tool)** | References a `.sql` file that doesn't exist in the repo |
| `tool-selection.html` | **DEAD/STUB** | Hardcoded tools array, writes to `sessionStorage` only |
| `waiver.html` | **WORKING** | `/waiver/:slug` live route |
| `widget.html` | **WORKING** | `/widget/:slug` embeddable calendar widget for 3rd-party iframes |
| `workflow-logs.html` | **DEAD** | `localhost:3000`-only backend |

**Also from an earlier ~30-page pass on a `dashboard.zip` snapshot** (may or may not still be present in the live repo — worth a `ls` check before relying on this list): a large set of Ghost-Marketplace-branded pages (`home.html`, `pricing.html`, `billing.html`, `analytics.html`, `dashboard.html`, `sandbox-*.html`, `integrations.html`, `templates.html`, `changelog.html`, `status.html`, `help-center.html`, `contact.html`, `about.html`, `privacy.html`, `terms.html`, `developer-dashboard.html`) — an entirely separate, unrelated fictional SaaS brand ("The Power Company of AI") with zero fetch/localStorage wiring, coexisting in the same directory. Also `developer-portal.html` (real-looking form, `// TODO: Send to backend API`), `onboarding-links.html`'s sibling issues, and `menu-editor-dark.html`/`.html` duplication were confirmed in that same pass — see conversation history if a byte-for-byte diff against `dashboard.zip` is ever needed again.

## 7. Cross-cutting findings

1. **Two Supabase projects referenced across this repo**: primary `mhafixflyffflwjhcgfn.supabase.co` (used by `login.html`, `app-dashboard.html`, `js/supabase-client.js`) vs. a second one `mkepugvdlktfsossumox.supabase.co` used only by `onboarding-links.html` — a dead end if a user ever reaches that page.
2. **`signup.html` is broken** and is what your own marketing homepage links to for new signups — `login.html` is the one that actually works for both login AND signup (it has a signup mode).
3. **`dashboard.html`**, referenced by name in this repo's own old CLAUDE.md and as a redirect target inside `onboarding-links.html`, **does not exist as a file**.
4. **Duplicate/near-duplicate pages**: `menu-editor.html` vs `menu-editor-dark.html`; `admin-dashboard.html` vs `admin.html` (legacy vs real, both shipped); `connection-manager.html` vs `-dynamic.html`; 4 marketing landing pages sharing one broken framework.
5. Every hardcoded key found in this repo is a publishable/anon key, not a service-role or live-secret key — the real live-secret exposure is in `gcr-api-clean` (see that repo's audit §0), not here.
