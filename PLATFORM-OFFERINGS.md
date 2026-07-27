# CyberCheck — Complete Platform & Offering Documentation

**Compiled from every uploaded document.** This catalogs every product, tool, module, feature, flow, table, and package described across all source material, plus the verified build status of each.

---

## Table of Contents

1. [The Ecosystem — Brands and Layers](#1-the-ecosystem--brands-and-layers)
2. [The 16 Platform Sections](#2-the-16-platform-sections)
3. [The 14 Build Steps — Architecture](#3-the-14-build-steps--architecture)
4. [The Modular App Store — Every App](#4-the-modular-app-store--every-app)
5. [Individual Product Offerings](#5-individual-product-offerings)
6. [Industry Packages](#6-industry-packages)
7. [Pricing Packages](#7-pricing-packages)
8. [Integrations & Platforms Supported](#8-integrations--platforms-supported)
9. [Database Structures Described](#9-database-structures-described)
10. [Build Status — Real vs. Planned](#10-build-status--real-vs-planned)

---

# 1. The Ecosystem — Brands and Layers

Everything sits on one foundation. These are the named surfaces.

| Brand / Layer | What it is | Who it serves |
|---|---|---|
| **CyberCheck** | The business command center. Dashboard, structured data, modules, automations. The SaaS product. | Business owners, managers, staff |
| **Gulf Coast Radar (GCR)** | The public discovery engine. Search, browse, maps, category pages, availability. | Tourists, locals |
| **Trip Swipe / CheckSwap** | Swipeable discovery and preference-capture layer. Turns browsing into intent data. | Tourists, trip planners |
| **CyberCheck Reviews** (a.k.a. CheckMate) | Verified review platform. Every review tied to a real booking. | Any business wanting trust |
| **CyberCheck Connect** | Email-to-automation layer. Forward an email, trigger a workflow. | Any business receiving confirmation emails |
| **Wavegent / aWavegent** | AI agent layer. Two distinct uses — see note below. | Businesses + their guests |
| **Ghost OS / Ghost Box** | AI phone/SMS number + optional local hardware runner. | Businesses, families, homes |
| **MyCheckM8** | Personal AI assistant / agent reading trusted local data. | Consumers |

> **Naming conflict to resolve:** "Wavegent" in the existing codebase is an **admin-side AI page-design assistant** (chat to generate QR menu layouts). "aWavegent" in the sales material is a **guest-facing pre-arrival concierge chat widget**. Same name, unrelated functions. One is built, one is not.

**The stated relationship:** CyberCheck gives the business a command center. GCR gives customers a discovery path. Trip Swipe captures intent. Together they turn business data into customer action.

---

# 2. The 16 Platform Sections

The master platform breakdown. Each section is sold as its own product or bundled.

## 01 — CyberCheck Core Platform
**What it is:** The system underneath the business. Connects profile, offers, customer actions, evidence, reviews, referrals, loyalty, SMS, and AI into one operating layer.

**Who buys it:** Multi-location businesses, operators, agencies, tourism businesses, property managers, charters, restaurants, local service companies.

**The pain it solves:** Most businesses have a website, a booking link, Google reviews, Facebook posts, text messages, and receipts scattered everywhere. None of it works together.

**What it does:**
- Connects every module around one business record
- Keeps business, customer, offer, resource, evidence, and review tied together
- Feeds public pages, widgets, dashboards, SMS, AI, referrals, analytics
- Lets the business keep its customer relationship instead of losing it inside third-party platforms

**Flow:** Business gets structured → Customer discovers or acts → CyberCheck captures source + intent → Booking/payment/proof arrives → Review/referral/loyalty follow-up → Dashboard and AI reuse the trusted result

**Sales angle:** The operating system behind the business — not a website, not a listing, not another app.

## 02 — Gulf Coast Radar Discovery Layer
**What it is:** The public marketplace where tourists and locals find what's actually useful right now. A regular directory shows names; GCR shows structured choices — what's open, what's available, what it costs, what the rules are, how to act.

**Who buys it:** Restaurants, charters, rentals, hotels, marinas, events, artists, attractions, services.

**What it does:**
- Displays business profiles, categories, maps, offers, photos, menus, events, availability cards
- Supports parent-child hubs: marinas, condo buildings, shopping centers, venues, local districts
- Captures clicks, saves, calls, booking handoffs, QR scans, partner referrals
- Turns local discovery into measurable customer action

**Search categories:** Food, charters, rentals, condos, events, music, services, shopping, marinas, nightlife, family activities, things to do today

**Flow:** Visitor searches or browses → GCR shows structured businesses → Visitor opens detail page → Visitor books, calls, saves, swipes, or joins SMS → CyberCheck tracks the outcome

**Sales angle:** Local discovery with action attached — not random traffic.

## 03 — TripSwipe / CheckSwap Discovery
**What it is:** The swipe layer that learns what people want before they buy. Turns browsing into intent data.

**Who buys it:** Tourism businesses, restaurants, activity operators, creators, brands, partners, hotels, condo managers, local advertisers.

**What it does:**
- Shows cards for businesses, offers, events, rooms, rentals, happy hours, products, artists, deals
- Learns preferences by category, vibe, price, time, group type, location
- Creates itinerary and group planning signals
- Feeds retargeting, recommendations, partner referrals, AI personalization

**Signals captured:** Likes, skips, saves, maybes, itineraries, deal claims, booking signals

**Flow:** Customer swipes → Preference signals build → Relevant offers rise → Customer saves or books → Business sees demand signals

**Sales angle:** The fun discovery layer that turns attention into data and data into bookings.

## 04 — Standalone Booking Platform
**What it is:** A universal booking engine that can schedule boats, rooms, units, staff, tables, chairs, vehicles, slips, classes, sessions, and equipment — without forcing each industry into a separate app.

**Who buys it:** Boat rentals, charters, tours, salons, rentals, condos, hotels, event venues, service businesses, marinas, golf courses.

**What it does:**
- Creates bookable resources: boats, rooms, units, staff, tables, chairs, vehicles, slips, equipment, event spaces
- Manages availability slots, holds, bookings, payments, deposits, cancellations, refunds, calendar claims
- Uses Stripe Connect for business payments and platform fees
- Can live separately from GCR while GCR calls it for availability via API
- Books natively **or** hands off to an existing provider

**Flow:** Business creates resources → Rates + rules added → Availability projected → Customer books natively or through widget → Payment/deposit/confirmation recorded

**Sales angle:** The transaction engine — the part that turns interest into paid bookings.

## 05 — Structured Data Engine
**What it is:** Turns messy business information into clean, reusable, AI-ready facts. Every fact gets one home.

**Who buys it:** Businesses with scattered data, agencies, developers, tourism groups, operators, AI partners.

**What it does:**
- Ingests websites, forms, menus, calendars, emails, PDFs, photos, receipts, POS exports, manual updates
- Converts raw input into structured rows: entity, offer, price, resource, policy, source, review, evidence
- Uses staging, field mapping, validation, source labels, freshness, conflict handling
- Stops production facts from being buried inside random JSON

**Flow:** Raw data enters → Importer/staging validates → Facts mapped to canonical tables → Conflicts reviewed → Public/API/AI surfaces reuse the facts

**Sales angle:** The foundation that makes every other product accurate.

## 06 — Business Entity / Profile System
**What it is:** The business brain. One slug connected to every fact, module, and action.

**Who buys it:** Every business, listing, property, artist, public place, provider, unit, venue, or parent hub.

**What it does:**
- Stores identity, locations, hours, contacts, links, photos, tags, FAQs, policies, amenities, sources, relationships
- Supports parent-child structures: The Wharf → businesses; condo building → units; marina → charters; venue → artists
- Enables optional modules by slug so any business can use any structured section
- Keeps public page, dashboard, widget, and AI tied to the same business record

**Flow:** Entity created → Facts and relationships added → Modules enabled → Profile publishes to GCR/widgets/AI → Updates flow everywhere

**Sales angle:** A smart business profile that becomes the business's digital operating record.

## 07 — Offer + Pricing System
**What it is:** The money layer. Every product, service, trip, room, rental, menu item, package, and ticket becomes sellable structured data.

**Who buys it:** Any business that sells anything.

**What it does:**
- Creates offers: menu items, trips, services, room types, rentals, products, tickets, memberships, packages
- Stores prices by unit: **per person, adult, child, hour, half-day, day, night, week, trip, session, service call, item, group, boat, room, or custom status**
- Adds fees, deposits, taxes, refunds, cancellation policies, warranties, inclusions, exclusions, requirements, add-ons
- Lets different industries share one clean pricing model without forcing one industry schema

**The pain:** Pricing is buried in text. Customers don't know if it's per person, per hour, per night, starting at, deposit-only, or call-to-confirm.

**Flow:** Business creates offer → Adds price unit + amount → Adds fees/deposit/rules → Widget/AI displays clear total context → Customer acts with fewer questions

**Sales angle:** The pricing clarity layer that reduces calls, confusion, and abandoned bookings.

## 08 — Resource + Availability Calendar
**What it is:** The "what is actually open" layer. Availability calculated from resources, schedules, bookings, holds, external calendars, capacity, weather blocks, maintenance, and freshness — not guessed from a static page.

**Who buys it:** Operators with time, capacity, inventory, staff, rooms, units, equipment, boats, chairs, slips, vehicles, or appointments.

**What it does:**
- Maps resources independently: boat, condo unit, hotel room, stylist, technician, table, chair, slip, event space, vehicle, equipment
- Calculates availability from schedules, bookings, holds, blocks, iCal, provider feeds, manual entries, weather, maintenance, capacity
- **Labels freshness:** live, near-real-time, scheduled sync, stale, request-only, unknown
- Generates iCal feeds per resource and imports external calendars when authorized

**Display styles:** Available today, next open slot, live calendar, departure list, room grid, request availability, slot cards, resource grid

**Flow:** Resources created → Schedules/rates/rules apply → External calendars sync → Bookings/blocks reduce capacity → Public surfaces show freshness-labeled availability

**Sales angle:** "Availability, not algorithms." Sell the open slot before it expires.

## 09 — Capture Widget + Booking Handoff
**What it is:** The conversion layer. Keep your booking system, but stop losing the customer before they leave.

**Who buys it:** Businesses already using FareHarbor, Peek, OpenTable, Airbnb, VRBO, Square, Toast, phone bookings, or manual workflows.

**What it does:**
- Embeds as JS snippet, WordPress plugin, hosted page, QR flow, or business profile widget
- Captures name, phone, date, party size, offer, resource, source, consent, handoff destination
- Supports native booking **or** external provider handoff with prefilled context
- Creates attribution even when the final booking happens elsewhere

**Intent data captured:** Customer name, phone/email, activity viewed, preferred date/time, party size, kids/adults count, source (QR, social, GCR, Trip Swipe, Google), clicked Book Now, abandoned before booking, saved/liked activity, related interests

**Flow:** Customer interacts with widget → Intent captured → Native booking or handoff begins → Confirmation evidence closes the loop → Review/referral/loyalty can trigger

**Sales angle:** Lets the business keep the customer even when they keep their existing booking system. *"The booking is valuable. The intent before the booking is the gold."*

## 10 — Email Parser + Evidence System
**What it is:** The proof machine. Turns confirmation emails into verified structured records — even when the booking happened somewhere else.

**Who buys it:** Operators using existing booking platforms, POS systems, calendars, invoices, or email-based confirmations.

**What it does:**
- Receives forwarded booking confirmations, receipts, cancellations, changes, refunds, invoices, POS receipts, provider emails
- Stores raw inbound message, parser run, extracted fields, confidence, provider, status, date, amount, customer, resource match
- Reconciles against capture sessions, calendars, offers, resources, existing bookings
- Creates auditable evidence for verified reviews, referrals, loyalty, reporting

**Flow:** Confirmation email arrives → Parser extracts fields → System deduplicates + reconciles → Booking event created → Evidence supports review/referral/loyalty

**Sales angle:** The bridge that works even when the provider doesn't give you an API. One forwarded email unlocks verified reviews, referral credit, loyalty, and customer history.

## 11 — Authentic / Verified Reviews
**What it is:** Reviews tied to real actions, not anonymous noise. A CyberCheck review can say what was booked, bought, stayed in, eaten, hired, visited, or completed — and what evidence supports it.

**Who buys it:** Restaurants, charters, rentals, condos, hotels, salons, service businesses, retail, venues, tourism operators.

**What it does:**
- Creates review eligibility from bookings, payments, receipts, stays, trips, visits, services, appointments, manual confirmation
- **Evidence levels:** account verified, interaction confirmed, booking verified, payment verified, completion verified, referral outcome verified
- Asks item-aware questions about boat, room, staff, menu item, service, cleanliness, communication, value, policy handling, experience
- Keeps rewards independent from sentiment; supports user-controlled third-party sharing

**Flow:** Experience completes → Evidence label assigned → Review invite sent → Customer reviews specific subject → Business displays verified review

**Sales angle:** Proof-backed reputation — stronger than generic reviews.

## 12 — Customer Identity + Consent
**What it is:** The permission layer. Build the customer relationship with permission. A phone number is the start of a permissioned relationship, not just a field.

**Who buys it:** Businesses that need repeat customers, SMS, referrals, loyalty, verified reviews, booking reminders, personalized recommendations.

**What it does:**
- Creates a durable customer profile with phone, email, anonymous ID, verified methods
- Stores consent scopes for transactional SMS, marketing SMS, email, reviews, loyalty, referrals, terms
- Tracks preferences, interests, saves, no-shows, repeat behavior, source history where allowed
- Controls what each business, employee, partner, and AI tool is allowed to see or do

**Flow:** Customer takes action → Identity resolved or created → Consent captured → Preferences/history update → Future messaging and AI actions use permissions

**Sales angle:** Customer ownership with permission — not another list trapped inside a provider.

## 13 — SMS / Notifications / Voice
**What it is:** The communication layer for reminders, alerts, openings, reviews, specials, and AI routing.

**Who buys it:** Businesses that depend on calls, texts, reminders, last-minute openings, weather updates, customer questions, repeat traffic.

**What it does:**
- Sends confirmations, reminders, review requests, last-minute openings, happy hour alerts, daily specials, weather notices, loyalty updates, staff alerts
- Supports transactional and marketing consent **separately**
- Routes customer questions to AI, dashboard, SMS, email, phone assistant, or human team
- Connects voice agents, phone routing, approval-based actions

**Flow:** Trigger occurs → Consent and rules checked → Message/call sent → Click/reply/action tracked → Dashboard shows result

**Sales angle:** The follow-up engine that fills gaps and brings customers back.

## 14 — Referral + Loyalty + Rewards
**What it is:** The growth layer that credits the people and partners who create completed outcomes. Clicks are weak; completed outcomes are strong.

**Who buys it:** Hotels, condo managers, creators, artists, partner businesses, agencies, tourism groups, local media.

**What it does:**
- Creates referral links, QR codes, creator links, hotel/condo concierge links, campaign links, partner attribution
- Tracks source, click, capture, booking, completion, payout eligibility
- Runs points, rewards, loyalty tiers, stamps, credits, repeat offers, wallet-style ledgers
- Supports business-to-business cross-referrals and creator/influencer campaigns
- **Universal wallet:** one loyalty identity across the network instead of a different app per business

**Flow:** Partner shares link → Customer acts → Evidence confirms completion → Referral event becomes eligible → Reward/payout/points credited

**Sales angle:** Attribution that pays for outcomes, not fake hype.

## 15 — Business Dashboard + Admin
**What it is:** The control room where the business actually operates the system. "A landing page sells the idea. The dashboard makes it real."

**Who buys it:** Owners, managers, front desk, marketing teams, captains, staff, property managers, agencies, admins.

**What it does:**
- Manages profile, modules, catalog, pricing, resources, availability, bookings, customers, reviews, SMS, referrals, loyalty, integrations, analytics
- Supports role-based access so staff only sees the tools they need
- Shows source, freshness, completed outcomes, review status, attribution
- Lets admin audit conflicts, parser errors, data quality, integrations

**Dashboard tiles described:** Availability, Open Seats, Leads, SMS, Promos, Reviews, Analytics, Referrals, Photos, Calendar, Services, Bookings

**Flow:** Business logs in → Edits structured modules → Connects integrations → Handles daily operations → Measures revenue and trust outcomes

**Sales angle:** Where CyberCheck turns from marketing into operations.

## 16 — AI Assistant / MyCheckM8 / Agent System
**What it is:** The intelligence layer that answers from trusted structured facts and acts with approval.

**Who buys it:** Consumers, businesses, operators, concierge partners, developers, personal-agent users.

**What it does:**
- Answers questions about businesses, prices, availability, policies, reviews, events, menus, services, products, resources
- Uses **read / propose / execute** permissions for safe AI actions
- Supports text, voice, calls, SMS, business assistants, concierge flows, personal agents
- Logs sources used so answers can be audited and improved

**Flow:** User asks → Intent detected → AI queries trusted tables → Answer includes freshness/source context → Actions require approval when needed

**Sales angle:** AI with local truth underneath — not a chatbot guessing from the internet.

---

## The Whole Loop (8 Steps)

1. **Discover** — Customer searches, scans, swipes, texts, calls, or opens a widget
2. **Evaluate** — They see structured price, rules, photos, reviews, availability, freshness
3. **Capture** — CyberCheck records source, intent, customer identity, date, party size, offer, consent
4. **Book or hand off** — Customer books natively or continues to existing provider with tracking
5. **Receive proof** — API, webhook, email parser, payment, iCal, POS, or manual confirmation
6. **Verify** — System reconciles customer, resource, booking, amount, source, status
7. **Review + refer** — Verified review, referral credit, loyalty points, SMS follow-up become eligible
8. **Reuse trust** — Dashboards, GCR, widgets, AI, partners, and future recommendations reuse the trusted record

---

# 3. The 14 Build Steps — Architecture

**The core rule:** *Do not build locked industry templates. Build reusable modules that can appear on any business page when that business has the data and the module is enabled.*

**Master system flow:** Business becomes an entity → Modules enabled → Canonical facts stored → API page composer assembles enabled modules → Frontend renders live page from module array → Customer searches/scans/swipes/texts/clicks → Customer acts (book, call, save, request, join, review) → Evidence arrives (booking, email, payment, iCal, POS, QR, manual) → Verified review, referral, loyalty, dashboard, AI records update

### Step 1 — Universal Entity Spine
Every business, location, unit, artist, provider, or resource owner starts as one entity. The permanent identity record.

- **Inputs:** business name, slug, industry code, parent/child relationship, location, phone, website, main image, status
- **Tables:** `entity`, `entity_locations`, `entity_contacts`, `entity_relations`, `entity_aliases`, `entity_sources`
- **API:** `GET /api/entities/:slug`, `POST /api/entities`, `PATCH /api/entities/:slug`
- **Live display:** hero section, business name, category chips, location, quick actions, parent/child links
- **Flow:** Business created or claimed → Entity row created → Slug becomes permanent key → Core facts attached → Modules attach to same slug → Live page has one source of identity
- **Example:** A golf course, fishing charter, condo unit, restaurant, stylist, and artist all start the same way — one entity slug.

### Step 2 — Module Registry
The catalog of everything a business page can display or do.

- **Inputs:** module key, module name, description, tables used, display components, admin editor, status, allowed-by-default industries
- **Tables:** `module_registry`, `module_display_styles`, `module_data_contracts`, `module_permissions`
- **API:** `GET /api/modules`, `GET /api/modules/:module_key`
- **Live display:** add module screen, feature cards, module marketplace, internal admin registry
- **Flow:** Developer defines module → Registry stores contract → Business can enable → API knows data sources → Frontend knows display components → AI knows query rules
- **Example:** Happy hour is one module. A restaurant, golf course, marina, hotel bar, or music venue can all enable it.

### Step 3 — Entity Module Settings
Decides which modules appear on each individual business page.

- **Inputs:** entity slug, module key, enabled, sort order, display style, custom title, visibility, source status
- **Tables:** `entity_modules`, `entity_module_grants`, `entity_module_display_settings`
- **API:** `GET /api/entities/:slug/modules`, `PATCH /api/entities/:slug/modules/:module_key`
- **Flow:** Business chooses module → Entity module row saved → Admin selects display style → API returns ordered module list → Frontend renders enabled sections only → Page becomes custom but structured

### Step 4 — Canonical Data Tables
Every fact has one correct home. Prices go in prices. Photos go in photos. Policies go in policies. Bookable things become resources.

- **Inputs:** hours, photos, offers, prices, fees, rules, events, menus, resources, reviews, sources
- **Tables:** `entity_hours`, `entity_photos`, `entity_tags`, `entity_faqs`, `entity_policies`, `entity_offers`, `entity_offer_prices`, `bookable_resources`, `review_evidence`
- **API:** `GET /api/entities/:slug/profile`, `/offers`, `/policies`
- **Flow:** Fact collected → Fact type identified → Saved to correct canonical table → Source/freshness attached → API exposes fact → Public page and AI reuse it
- **Example:** A $600 private charter, a $12 burger special, and a $99 service call are all offers with structured prices, not paragraph text.

### Step 5 — Module Data Contracts
Every module needs a rulebook: what data it needs, what tables it reads, required fields, display styles, admin editor, AI questions it can answer.

- **Tables:** `module_data_contracts`, `module_required_fields`, `module_optional_fields`, `module_ai_intents`, `module_import_rules`
- **API:** `GET /api/modules/:module_key/contract`, `/schema`
- **Live display:** setup checklist, missing data warnings, admin validation, module preview

### Step 6 — API Page Composer
The API assembles the page so the frontend doesn't guess. Takes a slug, reads enabled modules, loads correct data, attaches source/freshness labels, returns one ordered page contract.

- **API:** `GET /api/entities/:slug/page`, `GET /api/v1/entities/:slug/page`
- **Flow:** Page request arrives → Entity loaded → Enabled modules loaded → Each module's data fetched → Data normalized into page contract → Frontend renders modules in order
- **Sales angle:** One API powering every surface — website, widget, AI, mobile app, QR page, partner page, dashboard preview

### Step 7 — Frontend Module Renderer
The live site renders modules, not industry templates. Maps `module_key` → component, `display_style` → layout. Missing modules simply don't render.

- **Data source:** No direct DB reads. Frontend uses API only.
- **Components:** HeroModule, MenuModule, HappyHourModule, AvailabilityModule, BookingWidgetModule, ReviewsModule, SMSModule

### Step 8 — Display Style System
The same module can look different depending on business and page context.

- **Tables:** `module_display_styles`, `entity_module_display_settings`, `theme_settings`
- **Styles:** banner, cards, calendar, grid, list, carousel, compact chips, full section
- **Example:** Happy hour can be a big top banner on a bar page or a small clubhouse card on a golf course page.

### Step 9 — Business-Type Presets
Presets speed up setup but do not restrict what a business can use.

- **Tables:** `business_type_presets`, `preset_modules`, `industry_table_contract`, `entity_modules`
- **API:** `POST /api/entities/:slug/apply-preset`, `GET /api/presets/:industry_code`
- **Example:** Golf preset turns on tee times, pricing, memberships, restaurant menu, happy hour, events, weddings, reviews.

### Step 10 — Admin Module Editors
Every module needs a dashboard editor that writes to the right tables, validates required fields, previews the live section, publishes through API.

- **Tables:** `entity_modules`, all module tables, `dashboard_actions`, `audit_log`, `user_roles`
- **API:** `GET/POST/PATCH /api/dashboard/entities/:slug/modules/:module_key`
- **Editors:** profile editor, menu editor, pricing editor, availability editor, review dashboard, SMS dashboard
- **Example:** A restaurant manager updates today's special. A front-desk employee blocks availability. A property owner edits only their unit.

### Step 11 — Importer + AI Placement Rules
Incoming data must be mapped, not dumped. Takes scraped pages, CSVs, emails, PDFs, menus, social posts, AI extractions and routes each fact to the correct table or manual review queue.

- **Tables:** `import_batches`, `raw_import_files`, `staging_import_rows`, `import_field_mappings`, `data_quality_checks`, `manual_review_queue`
- **API:** `POST /api/imports`, `/imports/:id/map`, `/imports/:id/approve`
- **Example:** If a website mentions live music, happy hour, private events, and boat rentals, each fact maps to a module instead of one giant notes field.

### Step 12 — Availability Engine
Determines what is open, bookable, blocked, held, sold out, stale, request-only, or live. Powers charters, rentals, condos, hotel rooms, staff appointments, tee times, slips, tables.

- **Inputs:** resource, schedule, rate rule, booking, hold, calendar block, iCal import, weather block, manual block
- **Tables:** `bookable_resources`, `resource_schedules`, `rate_rules`, `availability_slots`, `calendar_claims`, `external_calendar_sources`, `booking_events`, `availability_snapshots`
- **API:** `GET /api/availability/:resource_id`, `GET /api/entities/:slug/availability`, `POST /api/holds`, `POST /api/calendar-sync`

### Step 13 — Proof, Reviews, Referrals + Loyalty Loop
Captures the customer action, waits for evidence, verifies the outcome, unlocks review eligibility, credits referral attribution, updates loyalty.

- **Tables:** `capture_sessions`, `inbound_messages`, `parser_runs`, `customer_transactions`, `review_invites`, `review_evidence`, `entity_reviews`, `referral_events`, `points_ledger`
- **API:** `POST /api/capture-sessions`, `/inbound-events`, `/review-invites`, `/referral-events`, `/loyalty/ledger`
- **Example:** A FareHarbor confirmation email proves the GCR handoff converted, triggers a verified review, credits the hotel concierge, and adds loyalty points.

### Step 14 — First Production Vertical
Build one full loop first, then expand the same modules across industries. Charters, dolphin cruises, boat rentals, and selected vacation rentals are the best first wedge — clear dates, high-value transactions, visible capacity, review opportunities.

- **Scope:** 5–10 operators, 20+ resources, offers/prices, booking links, calendar sources, email parser, reviews, dashboard

### Every Module Must Include (10 Requirements)
1. Database tables
2. API endpoint
3. Admin editor
4. Public display component
5. Display style options
6. AI answer rules
7. Import mapping rules
8. Analytics tracking
9. Permission rules
10. Source/freshness labels

### Example Module Stacks

| Golf Course | Fishing Charter | Restaurant | Condo / Rental |
|---|---|---|---|
| Hero, Hours, Location, Photos | Hero, Hours, Photos | Hero, Hours | Hero, UnitDetails |
| GolfCourse, TeeTimeAvailability | CharterBoats, Captains | Menu, DrinkMenu | PhotoGallery, Amenities |
| Pricing, Membership | TripOffers, Pricing | HappyHour, DailySpecials | RateRules, FeesDeposit |
| RestaurantMenu, HappyHour | Availability, WeatherPolicy | Events, ArtistSongRequest | CalendarAvailability |
| Events, WeddingVenue | BookingWidget | ReservationLink | BookingHandoff, HouseRules |
| VerifiedReviews, SMSUpdates | VerifiedReviews, FAQ, SMSLastMinuteOpenings | VerifiedReviews, SMS, Loyalty | GuestMessages, VerifiedReviews, LocalConcierge |

---

# 4. The Modular App Store — Every App

Businesses install only what they need. Apps are grouped by category.

### Core (always on)
| App | Purpose |
|---|---|
| Overview | Dashboard home & quick stats |
| Business Profile | Name, hours, contact, location |
| Photos & Media | Upload and manage photos |
| Customers | Customer list and contact history |
| Analytics | Views, clicks, traffic |
| Billing & Plan | Subscription and payment settings |
| Integrations | Connect Stripe, Square, and more |
| Custom Domain | Your own domain name |
| Publish | Go live and manage visibility |
| Theme & Branding | Colors, fonts, logo |
| SEO | Search engine optimization |

### Booking
| App | Purpose |
|---|---|
| Bookings | General booking management calendar |
| Photographer Booking | Service-based session booking with deposit, schedule, model release |
| Fishing Charter Booking | Full charter booking with departure times, waiver, deposit |
| Boat Rental | Hourly, half-day, full-day, multi-day rentals |
| Rides & Taxi Dispatch | SMS lead dispatch with bidding and Stripe payment links |
| Appointments | Staff-based appointment scheduling |
| Availability | Manage open slots and booking capacity |
| Waitlist | Collect and manage a customer waitlist |
| Waivers | Digital liability waivers for any service |

### Content
| App | Purpose |
|---|---|
| QR Menu | Digital menu with QR code, categories, photos |
| Events | Upcoming events, ticketing, promotions |
| Daily Specials | Happy hour, daily deals, promotions |
| FAQ | Frequently asked questions |
| Custom Pages | Build custom pages for your site |
| QR Codes | Generate QR codes for menus, links, forms |
| Site Editor | Drag-and-drop website sections |
| Social Links | Link your social media profiles |

### Commerce
| App | Purpose |
|---|---|
| Inventory | Track stock, rentals, equipment |
| Add-ons & Extras | Upsell items on bookings |
| Coupons & Discounts | Promo codes and discount offers |
| Staff Management | Team members, roles, schedules |
| Reviews | Customer reviews and reputation management |
| Messaging | SMS and email customer communication |

### AI & Automation
| App | Purpose |
|---|---|
| AI Assistant | AI-powered content, descriptions, insights |
| WaveAgent AI | AI agent for automated customer interactions |
| Data Sync | Keep data in sync across all your tools |
| CSV Import | Bulk import customers, products, menus |

### Integrations
| App | Purpose |
|---|---|
| FareHarbor | Sync availability from FareHarbor in real time |
| Square POS | Connect Square for payments and inventory |
| Google Business | Sync with Google Business Profile |

### Discovery
| App | Purpose |
|---|---|
| Discovery Search | Appear in the availability search engine for your region |
| GCR Directory | Get listed on the Gulf Coast Radar discovery platform |
| Trip Swipe | Appear in Trip Swipe vacation discovery feed |

### Full App Manifest List (69 installable apps)
`about`, `addons`, `ai-concierge`, `analytics`, `availability`, `book-boat`, `book-charter`, `book-class`, `book-dolphin`, `book-hairstylist`, `book-lodging`, `book-photographer`, `booking`, `checklist`, `checkout`, `client-galleries`, `contact`, `coupons`, `crowdfund`, `cta`, `customers`, `email-parser`, `events`, `faq`, `features`, `fleet`, `footer`, `forms`, `gallery`, `gcr-listing`, `gift-cards`, `guest-videos`, `hero`, `highlight`, `hours`, `index`, `inventory`, `links`, `locations`, `loyalty`, `memberships`, `menu`, `messaging`, `oauth-google`, `oauth-instagram`, `oauth-square`, `ordering`, `payments`, `properties`, `qr-codes`, `qr-redirect`, `reminders`, `reserve-table`, `reviews`, `reward-offers`, `richtext`, `rides`, `seo`, `services`, `shoutouts`, `song-request`, `specials`, `staff`, `steps`, `tipjar`, `waitlist`, `waivers`

---

# 5. Individual Product Offerings

Each of these is a standalone sellable product with its own sales page.

---

## 5.1 — CyberCheck Booking Platform

**Positioning:** *"A booking platform that keeps the customer on your page."*

**The problem:** Guests tap "Book Now" and get sent somewhere else. The branding changes, the experience changes, and that drop-off costs bookings. Specials, menu, music, marina services, and booking all live separately — no smooth upsells, no unified journey.

**What it does:**
- Guests stay on your page during the whole booking flow
- Works for restaurant reservations, private dining, charters, rentals, marina slips
- Add packages, upgrades, or experience-based booking options
- Build in automations, reminders, and follow-up after booking

**Booking flow:** Choose date → Select experience (dining, marina, charter, rental, event) → See live times (only available slots show) → Confirm booking → Ready for texts, reminders, follow-up

**What you can sell through it:**
- **Restaurant tables** — standard reservations, patio seating, waterfront tables, private dining, event nights
- **Marina slips** — docking, slips, dock-and-dine packages
- **Rentals & charters** — boat rentals, charters, sunset cruises

**Automations attached:** Booking confirmations to guests, owner/staff notifications, reminders before the reservation, post-visit follow-up and rebooking

**Two ways to sell it:** Use CyberCheck as the main booking experience, **or** layer automations onto other booking platforms.

**Best fits:** Restaurants with reservations/private dining; marina restaurants with slips/rentals/dock-and-dine; charter and rental businesses; venues with events and timed bookings

---

## 5.2 — Real-Time Availability Platform

**Positioning:** *"Turn local business data into live customer action."*

**The problem:** Menus are wrong. Specials are old. Availability is hidden. Reviews are unverified. Businesses update too many disconnected platforms.

**Core flow (one update powers everything):**
1. **Text Link** — Business receives a daily SMS update link
2. **Update Info** — They update specials, menu items, prices, openings, availability
3. **Sync Everywhere** — QR menu, digital signs, GCR, Trip Swipe, AI, and website update
4. **Drive Action** — Customers book, review, save, share, return

**Real-time availability by industry:**
- **Restaurants** — live specials, happy hour, current menu items, table availability, events, item-level photos
- **Activities & Rentals** — available time slots for dolphin cruises, fishing charters, jet skis, tiki boats, tours, beach rentals
- **Service Businesses** — who's available now or soon for appointments, emergency calls, beauty services, home services

**What the business gets:** QR Menu + Live Updates · Verified Reviews · Booking + Referral Tracking · SMS Promotions · Digital Signs (TV menus, chalkboard displays, specials boards, lobby screens) · AI Assistant Ready

**Package:** CyberCheck Real-Time Starter — **$99/mo**
- QR menu or live business page
- Daily SMS update link
- Real-time availability section
- Verified review requests
- Customer photo uploads
- Gulf Coast Radar listing
- Booking/referral tracking ready

---

## 5.3 — Gulf Coast Radar Availability Search Engine

**Positioning:** *"Find it. Book it. Live it."* — the live availability layer for Gulf Coast tourism.

**The difference:** A normal directory says *"Here are businesses."* GCR says *"Here is what you can actually do right now."*

**Four components:**

**1. Business Database** — Every business has a structured profile and bookable services. Categories: Photographers, Fishing Charters, Boat Rentals, Jet Ski Rentals, Restaurants, Taxi & Luggage Pickup.

**2. Availability Engine** — Three sources, clearly labeled:
- **API Integrations** — FareHarbor, Square, Checkfront, Calendly, and more
- **Manual Calendar** — Businesses without software use CyberCheck to set open times, capacity, blocked dates, services
- **Sync / Request Links** — Businesses with outside booking pages show status, request forms, external booking buttons

**3. Search Logic** — Users search by date, time, location, category, group size, budget, and intent. Example: *"fishing charter for 4 people Friday morning"*

**4. Booking / Lead Handoff** — Every result shows real availability status and next action:
- ✅ **Instant Book**
- 🕒 **Request Availability**
- ☎️ **Call Now**
- ↗ **External Booking**
- 👥 **Join Waitlist**

**How it works (5 steps):** Search → Results → Request/Book → Business Alert (SMS/email, "Reply YES if available") → Confirmation

**Core tables:** `businesses`, `services`, `availability_slots`, `bookings`, `booking_requests`, `reviews`

**MVP Build Order:**
- **Phase 1** — Listings, services, prices, booking links, request forms, SMS alerts
- **Phase 2** — CyberCheck calendar where businesses manage open slots, blocked dates, capacity, confirmations
- **Phase 3** — API integrations for booking systems, payments, calendars, SMS
- **Phase 4** — True marketplace: search → live availability → compare → book → pay → itinerary

---

## 5.4 — Condo & Rental Availability Engine

**Positioning:** *"The condo becomes the trip anchor."*

**The insight:** Most rental platforms stop when the guest books the condo. This system keeps going. Once you know where the guest is staying, when they're coming, group size, and property preferences, you can personalize the rest of the trip.

**Three components:**
- **Vacation Rental Search** — condos by dates, bedrooms, sleeps, amenities, location, budget, pet-friendly, beachfront, pools, lazy rivers
- **Availability Sync** — iCal feeds, direct booking links, property manager data, or manual updates — **without building a PMS first**
- **Trip Intelligence** — the rental becomes the starting point for restaurants, charters, photographers, rentals, events, nightlife, itinerary recommendations

**Availability without building a PMS — three methods:**
1. **External Booking Links** — Airbnb, VRBO, Brett Robinson, Vacasa, Meyer, direct booking pages, property manager websites as final checkout
2. **iCal Calendar Sync** — pull booked/blocked dates from rental calendars for real-time-ish availability without deep API access
3. **Manual Manager Updates** — CyberCheck dashboard to update listings, block dates, upload photos, edit amenities, manage guest leads

**Availability statuses:** Available · Check Dates · Request Availability · Direct Booking

**The full guest flow:**
1. Guest searches condo dates, location, bedrooms, budget, amenities
2. Engine checks synced calendars, booking links, property manager data
3. Guest saves or books a condo — creating the trip anchor
4. Trip Swipe recommends restaurants, charters, rentals, photos, events, transportation
5. CyberCheck tracks leads, bookings, partner referrals, guest behavior

**MVP build plan:**
- **Phase 1** — Launch 50–100 rental properties manually with photos, amenities, sleeps, bedrooms, location, booking URL, property manager
- **Phase 2** — Add availability status using external booking links first
- **Phase 3** — Sync calendars: iCal import for Airbnb, VRBO, Guesty, Hostaway, Lodgify, property manager calendars
- **Phase 4** — Connect trip recommendations
- **Phase 5** — Build property manager portal (CyberCheck login)

**Database structure:**
```
properties                    property_availability        trip_profiles
- id                          - id                         - id
- name                        - property_id                - phone
- manager_id                  - start_date                 - travel_dates
- condo_complex               - end_date                   - party_size
- city                        - status                     - budget
- address                     - source                     - saved_properties
- bedrooms                    - ical_url                   - saved_businesses
- bathrooms                   - last_synced_at
- sleeps
- pet_friendly
- beachfront
- pool
- lazy_river
- price_min
- price_max
- booking_url
- hero_image_url
- status
```

**Strategic note from the doc:** *"The mistake would be trying to compete with Airbnb, VRBO, Guesty, Hostaway, or Escapia immediately. The smarter move is to sit above them as the discovery, availability, and guest-planning layer."*

---

## 5.5 — Daily Menu Update Links

**Positioning:** *"Update today's rotating menu items in seconds. No dashboard hunting. No typing from scratch."*

**The problem:** Logging in, finding the right admin area, editing fields manually, and updating multiple platforms is exactly why rotating items stay outdated. One thing gets updated on the site, another stays wrong on the QR menu, a third is outdated on listings.

**How it works:**
1. **Daily text sent** — Manager gets that restaurant's private update link by text
2. **Custom page opens** — Built around the exact daily update categories that restaurant uses
3. **Pre-filled items appear** — Catch of the day, side, soup, dessert, drinks, specials
4. **Everything syncs** — Website, table QR menu, connected listings all reflect new choices together

**What can be updated:** Catch of the day · Soup or side of the day · Desserts and drinks · Lunch specials · Happy hour items · Limited-time dishes · Featured entrees

**Why it's easy to sell:** Faster updates (seconds, not admin panels) · Less training (any manager on duty can use it) · Live consistency (site, QR menu, listings at once)

---

## 5.6 — Price Memory Daily Update (Market Price)

**Positioning:** *"Daily menu updates with item-specific price memory."*

**The real market-price problem:** Restaurants don't just need to switch the item — they need to switch the exact price for that exact item. "Market price" hides the real number, and typing from scratch every day means it stops getting done.

**How the price-memory flow works:**
1. **Manager gets link** — custom daily update link by text
2. **Select exact item** — screen shows only that restaurant's catch or rotating-item choices
3. **Yesterday's price appears** — the selected item already shows the last saved price for that exact item
4. **Edit + resubmit** — if today's price changed, they update it and push live everywhere

**The key mechanic:** *"It remembers by item, not just by page."* Grouper has its own last-used price. Red Snapper has its own. Mahi has its own.

**Example UI state:** Red Snapper (Yesterday: $32) · Grouper (Yesterday: $34) · Mahi (Yesterday: $29) · Triggerfish (Yesterday: $36) — with toggles for **Featured Today** and **Sold Out**

**Best uses:** Catch of the day · Rotating market-price dishes (oysters, seafood platters, chef features) · Featured drinks and specialty items

---

## 5.7 — CyberCheck Automations

**Positioning:** *"Automations that actually run the business smoother."*

**The problem:** Important updates and follow-ups depend on people remembering to do them manually. Daily specials go stale. Catch of the day never gets updated. Customers don't get follow-up.

**Example SMS workflow:**
> **System:** Good morning. Tap to update today's catch of the day.
> **Manager:** Red Snapper
> **System:** Got it. Updating website, QR menu, and Gulf Coast Radar now.

**Three-step chain:** Input (manager selects from text-driven prompt) → Sync (restaurant site, QR table menu, connected listing update together) → Trigger (optional notifications, internal alerts, promotion rules fire next)

**What you can automate:**
- **Catch of the day** — daily text, tap the fish, updates everywhere
- **Booking reminders** — confirmations and reminders before table/experience/reservation
- **Lineup updates** — weekly live music or event details trigger page/menu/listing updates
- **Owner alerts** — notify the right person when a booking comes in or a form is filled
- **Follow-up texts** — thank-you, review prompt, return-offer after booking or visit
- **Timed promotions** — happy hour, late-night specials, time-and-day content triggers

**Two ways to sell it:** As part of the full CyberCheck system, **or** as a standalone automation layer for businesses already using other platforms.

**Best fits:** Restaurants with changing specials/catch/happy hour · Venues with weekly live music · Booking-based businesses needing confirmations and follow-up · Owners who need things handled without more staff

---

## 5.8 — CyberCheck Connect (Email-to-Automation)

**Positioning:** *"If your platform sends an email, CyberCheck can automate what happens next."*

**The universal promise:** Forward booking confirmations, order alerts, payment receipts, lead notifications, daily reports, or artist updates into your private CyberCheck address. The system extracts the data, saves it, and triggers SMS, CRM, review, dashboard, and webhook actions.

**Setup time:** 5–10 minutes. Designed so a non-technical business owner can connect an email workflow without understanding APIs, OAuth, webhooks, or parsers.

### The 7-Step Setup Wizard

**Step 1 — Automation Type.** Choose the business event:
| Type | For |
|---|---|
| 📅 New Booking | Tours, rentals, appointments, reservations, events |
| 🧾 New Order | Restaurants, online ordering, catering, delivery alerts |
| 💳 Payment Received | Stripe, PayPal, Square, Venmo-style confirmations, tips |
| 📩 New Lead | Website forms, quote requests, calls, inquiry notifications |
| 📊 Daily Report | Toast, Square, POS summaries, sales reports, owner alerts |
| 🎤 Artist Update | Tips, fan follows, shoutouts, song requests, show reminders |

**Step 2 — Source Platform.** FareHarbor · Airbnb · Booking.com · Toast · Square · Stripe/PayPal · Website Form (WPForms, Fluent Forms, Jotform, Typeform) · Gmail/Outlook · Other. Plus expected sender email or domain.

**Step 3 — Private Email.** A private forwarding address is issued (e.g. `bookings+business123@gcrconnect.com`). The business forwards one real confirmation email so the system detects the data.
> *"You are not giving CyberCheck access to your entire inbox. You are only forwarding the emails you want automated."*

**Step 4 — Data Review.** The parser shows extracted fields with confidence scores:
| Field | Detected Value | Confidence |
|---|---|---|
| Customer Name | Sarah Williams | 98% |
| Customer Phone | 251-555-1234 | 95% |
| Customer Email | sarah@email.com | 99% |
| Booking / Service | Sunset Dolphin Cruise | 97% |
| Date & Time | June 28, 2026 at 5:30 PM | 94% |
| Amount Paid | $240.00 | 96% |

**Step 5 — Actions.** Toggle what happens on every matching email:
- Send SMS to customer (confirmation, instructions, reminders, follow-up)
- Notify business owner (text owner, manager, artist, captain, staff)
- Save customer to CRM (CyberCheck or GoHighLevel)
- Send review request later
- Add to calendar
- Send webhook/API event (clean JSON to another system, dashboard, or reseller account)
- Tag customer interests (dolphin cruise, live music, seafood, happy hour, rental guest)
- Add to loyalty list

Plus an editable SMS template with variables: `{{business_name}}`, `{{service_name}}`, `{{booking_date}}`, `{{booking_time}}`

**Step 6 — Forwarding Rule.** Step-by-step Gmail and Outlook filter instructions so only matching emails get forwarded.

**Step 7 — Test & Activate.** Four status checks: Email received · Data extracted · Actions ready · Safe to activate.

### Use Cases by Industry
| Industry | What gets automated |
|---|---|
| **Restaurants** | Toast reports, online orders, catering leads, reservations, review requests, loyalty opt-ins, daily owner summaries, menu/special updates |
| **Activities & Rentals** | FareHarbor bookings, waiver links, arrival instructions, weather alerts, reminders, review requests, repeat booking offers, staff notifications |
| **Artists** | Tips, song requests, shoutouts, fan follows, show reminders, gig alerts, profile links, text opt-ins |
| **Hotels & Rentals** | Airbnb, Booking.com, guest confirmations, check-in instructions, local recommendations, review requests, repeat guest campaigns |
| **Service Businesses** | Quote requests, appointment confirmations, lead notifications, customer reminders, CRM tagging, follow-up tasks, missed-lead recovery |
| **Agencies / Resellers** | White-label client automation, setup templates, webhook delivery, agency dashboards, usage tracking, monthly recurring revenue |

---

## 5.9 — CyberCheck Reviews (Verified Review Platform)

**Positioning:** *"Every review. Verified real. Automatically."*

**The problem stated:** ~30% of online reviews are estimated fake or incentivized. 82% of consumers say fake reviews make them distrust a business. People are 4× more likely to trust a review verified against a real purchase.

### Google/Yelp vs. CyberCheck Reviews
| Google / Yelp | CyberCheck Reviews |
|---|---|
| ✗ Anyone can leave a review — customer or not | ✓ One-time link tied to a real booking |
| ✗ Competitors can post fake 1-star reviews | ✓ Zero fake reviews possible by design |
| ✗ Generic questions, no context | ✓ Custom questions showing exactly what they did |
| ✗ You don't own the data | ✓ You own every review on your platform |
| ✗ No control over when/how collected | ✓ Sent automatically after every booking |

**How it works:**
1. **Customer books** — through your system, any platform; CyberCheck notified via webhook or integration
2. **Experience ends** — you set the delay (2 hours after checkout, next morning, whatever fits)
3. **One-time SMS sent** — unique link tied to their booking ID, only they can use it, expires after 7 days
4. **Review posted** — shows their booking details, verified, visible on profile and embed

**Features:**
- **One-time verified links** — cryptographically tied to a real booking, can't be shared, reused, or faked
- **Custom review questions** — a fishing charter asks different things than a hair salon
- **Itemized booking context** — *"4-hour deep sea charter, 6 people, July 12"*
- **Automatic SMS delivery** — set once, every customer gets a request at the right time
- **Embed on your site** — one snippet adds verified reviews to your website
- **Your platform, your data** — reviews live on CyberCheck, exportable anytime, no algorithm filtering

**Three embed options:**
- **Website Widget** — `<script src="checkmate.app/w.js?id=your-biz"></script>`
- **Public Profile Page** — hosted profile at `checkmate.app/your-business`, shareable, SEO-friendly
- **QR Code & Link** — print on receipts, signs, business cards

**Platforms it connects to:** Calendly · Square · Mindbody · Acuity · FareHarbor · Bookeo · Vagaro · Rezdy · Google Cal · Any POS · Webhook/API · CSV Upload

**Pricing:**
| Tier | Price | Includes |
|---|---|---|
| **Starter** | Free (with CyberCheck Bookings) | Up to 50 reviews/month, verified SMS links, custom questions, public profile page, website embed widget |
| **Pro** ★ | $29/month | Unlimited reviews, connect any booking system, webhook + API access, custom branding, review analytics dashboard, review redirect URL, priority SMS delivery |
| **Enterprise** | Custom | Everything in Pro, white-label review platform, multi-location management, dedicated onboarding, SLA + support |

---

## 5.10 — Business Automation Command Center

**Positioning:** *"Update your business once. Let CyberCheck help update everywhere else."*

**The four-step model:**
1. Your business info gets structured (hours, menus, offers, prices, events, booking rules, reviews, photos, policies)
2. CyberCheck becomes the command center (owners update by dashboard, AI chat, SMS, phone call, or staff workflow)
3. Approved automations run (update pages, send texts, check bookings, ask for reviews, trigger loyalty, sync approved systems)
4. Customers get better answers

**The five-step process:** Structure → Connect → Command → Approve → Publish

### Plain-English Command Table
| Business need | What the owner says | What CyberCheck does | Where it shows up |
|---|---|---|---|
| Hours update | "We close at 6 this Sunday." | Creates special-hours update, asks approval, updates structured data, queues syncs | Website, GCR, QR, AI answers, Google-ready workflow |
| Menu item | "Add blackened grouper tacos for $18 today." | Adds structured special with price, availability, tags, publish targets | QR menu, website, SMS, AI assistant |
| Event promotion | "Post live music for Friday at 7." | Creates event data, updates public page, offers SMS/social/email follow-up | GCR, website, event feed, customer texts |
| Booking openings | "Do I have openings tomorrow?" | Checks resources, calendars, booking tools, summarizes availability | AI phone, dashboard, SMS, booking widget |
| Last-minute demand | "Text customers about tomorrow morning openings." | Finds opted-in customers, asks approval, sends SMS, logs response | SMS, dashboard, call summary |
| Review generation | "Send review links to yesterday's customers." | Checks proof, creates review invites, sends messages, tracks completion | SMS/email, review dashboard, public widget |
| Loyalty | "Give points for completed visits." | Uses proof to update points ledger, rewards wallet, customer history | Customer wallet, business dashboard, AI reminders |
| Local browser task | "Check the computer dashboard." | Ghost Box runs an approved local browser/script task and returns result | AI phone, dashboard, SMS summary |

**Connects to:** Google · Your site · SMS + voice · ChatGPT, Grok, Gemini, Claude · Calendars + booking tools · Review platforms · Loyalty + referrals · Ghost Box

**Key disclaimer stated:** *"Connections require authorized access to the customer's own accounts. CyberCheck is the setup, structured-data, automation, and management layer around approved systems."*

---

## 5.11 — AI Number / Ghost OS / Ghost Box

**Positioning:** *"Call your AI. Let it help plan, book, remind, reward, and remember."*

**What it is:** A permissioned AI helper you can call or text, connected to local businesses, verified reviews, rewards, bookings, family plans, and an optional Ghost Box at home.

**Explained simply:** *"You ask a question. Your AI listens. It checks the right places. It may ask a business helper. Then it shows you the best answer and asks before doing anything important."*

**How it works (5 steps):** Ask (call or text your AI number) → Identify (knows who's calling, checks permission) → Connect (checks tools, plans, rewards, businesses, other agents) → Act (book, remind, text, save, review, or ask approval) → Remember (proof, rewards, preferences, history update)

### Features

**Your AI Number** — Call or text your own AI helper from anywhere. Works by phone, SMS, app, QR, and web. Knows who's calling and checks permissions. Can serve one person, a family, a home, or a business.

**Family AI** — One shared helper with role-based access. Owner decides who can call, text, book, pay, view plans, and who needs approval first. Roles: full access, limited access, ask-first, child-safe, view-only. Temporary access for guests or relatives.

**Ghost Box** — The cloud handles calling, texting, AI reasoning, secure identity, tools, automations. The Ghost Box plugs into your home, business, RV, boat, or rental and acts as local speaker, controller, and private gateway.
- Connects through Wi-Fi, Ethernet, Starlink, or cellular backup
- Speaks reminders in the house
- Runs approved local scripts and home automations
- Cloud still answers if the box is offline

**Verified Proof** — Bookings, receipts, QR scans, email confirmations, visits, purchases, and completed services become proof an experience really happened. Rewards tied to participation and completed outcomes, **not** fake positive reviews.

**Universal Rewards** — One loyalty identity instead of a different app per business. Earn from bookings, visits, referrals, verified actions. Business-specific and co-op rewards. AI reminds you when rewards are available. Family rewards controlled by permissions.

**Business AI** — A customer's AI can talk to a business AI about hours, pricing, openings, services, policies, menus, bookings, or reviews. The business AI only shares what the business approves.

**The AI Number command flow:**
```
Business owner calls or texts the AI number
        ↓
CyberCheck identifies the caller
        ↓
Loads the correct business workspace
        ↓
Checks permission
        ↓
Understands the command
        ↓
Chooses an approved script
        ↓
Asks approval if needed
        ↓
Runs the action
        ↓
Texts or speaks the result
        ↓
Logs everything
```

**Privacy promise / Owner controls:** who can call · who can text · who can book · who can pay · who can view plans · who needs approval · who gets temporary access

**Ways people use it:** Personal AI · Family AI · Home AI · Travel AI · Business AI · Co-op Loyalty

**Packages:**
| Tier | For | Includes |
|---|---|---|
| **Starter — Personal AI Number** | One person | Personal AI number, SMS and voice access, saved preferences, rewards wallet, verified review profile |
| **Family — Family AI Number** | Families | Family access controls, owner/full/limited/view-only roles, shared plans and reminders, trip and activity help, family rewards wallet |
| **Home — AI Number + Ghost Box** | Homes, rentals, RVs, boats, offices | Cloud AI number, Ghost Box speaker/mic, Wi-Fi/Ethernet/Starlink/cellular path, local reminders and automations, home or business mode |

---

## 5.12 — Artist Dashboard / Live Music Platform

**Positioning:** *"Your live music control center."*

**What it manages:** Linktree-style artist page, song requests, shout-outs, tips, payment verification, SMS followers, upcoming shows, and QR links — all from one place.

### Dashboard Sections

**Overview** — Live Mode toggle (when ON, the smart link shows song requests first), current venue selector, quick actions. Stats: Today's Tips, Song Requests, New Followers, QR Scans.

**Public Artist Profile** — Controls the Linktree-style page fans see:
- Artist/Band Name, Tagline, Short Bio
- Primary Call-To-Action (show song requests first when live / always show bio first / always show request form first)
- Instagram, TikTok, Spotify/Music Link, Booking Email/Form

**Live Requests & Shout-Outs** — What the artist or manager sees during the show. Each request shows song, requester name, message, badges (New / Paid / Payment Review), request code, and amount. Actions: Mark Played, Skip, Approve, Hold, Done. Includes a separate **Performer View**.

**Songs & Pricing** — Set popular songs, minimum request price, custom rules:
| Song | Base Price | Rush | Available Tonight | Status |
|---|---|---|---|---|
| Wagon Wheel | $10 | +$5 | Yes | Active |
| Tennessee Whiskey | $15 | +$10 | Yes | Active |
| Sweet Caroline | $10 | +$5 | Yes | Active |
| Custom Song Request | $15+ | +$10 | Artist Review | Review |

**Payments & Email Parser** — Use Venmo/Cash App links now, upgrade to Stripe/Square webhooks later.
- Venmo Username, Cash App Cashtag, Parser Inbox (e.g. `payments+jakerivers@cybercheckinc.com`)
- Payment notes include a request code (e.g. `CC-83921`) so the parser matches the email to the request
- Parser states: matched/Paid · needs review (missing request code) · Stripe webhook ready

**SMS Followers** — One main CyberCheck number supports many artist follow codes. One-click text button opens the phone's SMS app with a keyword like **FOLLOW JAKE**. Tracks Total Followers, This Week, Top Source. Export Followers.

**Upcoming Shows** — Feeds the public profile, smart QR, and Gulf Coast Radar listing. Shows venue, date/time, requests-enabled flag, badges (Live / Smart QR Active / Upcoming / GCR Listed).

**QR Links** — Three separate codes:
- **Bio Link** — `cybercheck.com/jakerivers`
- **Song Request Link** — `cybercheck.com/jakerivers/request`
- **Smart Live Link** — `cybercheck.com/jakerivers/live`

### Artist Ecosystem (from the connected-platform page)
- **Artist Profile** — bio, genre, photos, videos, social/music links, show schedule, booking contact, price range, availability
- **Venue Search** — find artists by genre, availability, budget, solo/duo/band/DJ, last-minute openings
- **Fan Engagement** — song requests, paid shoutouts, tip links, follow artist, SMS show updates

---

## 5.13 — Guest Concierge (aWavegent)

**Positioning:** *"Your website should help the guest before the trip starts."*

A pre-arrival AI concierge widget that sits **on top of** the existing website and booking stack — explicitly **not a PMS replacement**.

### Three Market Variants

**A) Hotels & Boutique Resorts** — *"Give guests answers before they ever reach the front desk."*
- **Problems solved:** Guests calling about parking, check-in, amenities, policies; front desk answering repetitive questions all day; website not doing enough before arrival; guests arriving underprepared; staff time pulled from service
- **What's included:** Arrival questions (check-in time, valet/parking, early arrival, lobby hours, amenities, property details) · Stay-planning questions (restaurants nearby, spa info, family activities, weather-friendly options, local experiences) · Upgrade potential (room upgrades, dining, spa bookings, late checkout, on-property add-ons)
- **Form fields:** Company name, contact name, phone, email, property type (Boutique hotel / Resort / Independent hotel / Small hotel group), "What are people asking you most often right now?"

**B) Vacation Rental Management Companies** — *"Reduce repetitive guest support across all your properties."*
- **Multi-property friendly** — one concierge layer scaling across rental inventory
- **What it answers:** Property-specific questions (check-in, check-out, parking, amenity details, pet policy, Wi-Fi, beach access, pool rules, unit-specific notes) · Arrival help · Upgrade opportunities (early check-in, late checkout, premium unit options) · Local planning help · Peak-season support relief
- **What's included:** Multi-property website concierge · Property knowledge setup · Pre-arrival guest support · Local recommendation layer · Support load reduction · Future growth layer
- **Form fields:** Company/property name, contact, phone, email, property count (1–25 / 26–100 / 101–500 / 500+), "What questions do guests ask most often?"

**C) Phone-Booking Replacement** — *"Stop taking every booking by phone."*
- **The problem:** Missed calls while busy; leads lost in texts, Facebook messages, DMs; same questions repeated; no clean booking record; no automatic reminders → lost bookings, no-shows, double-booking risk, slow response, unprofessional experience
- **Four steps:** We build your page → Customers book without calling → Confirmations and reminders go out → You keep every lead organized
- **What's included:** Smart booking page · Booking/inquiry flow · Confirmation and reminders · Customer tracking · Professional local presence · Future add-ons (verified reviews, source tracking, local discovery)
- **Best for:** Fishing charters, photographers, rentals and activities, service businesses, any business still doing phone bookings

### Operator Pitch Version (pilot-first)
- **Positioning pills:** Not a PMS replacement · Guest support layer · Launches with or without one operator · Built for Gulf Coast demand
- **Six offer components:** Pre-arrival guest concierge · Local guidance layer · Support deflection · Pilot-first rollout · Revenue path later · Works on top of current stack
- **Not the fit:** People looking for a cheap chatbot · Operators wanting to replace their full stack immediately · Companies that only care about booking buttons · Anyone who wants a vague "AI" toy
- **Best fit:** Vacation rental operators with real guest volume · Teams tired of repetitive pre-arrival support · Operators who want the site to do more than list units · Groups that understand pilot-first rollouts
- **Stated posture:** *"We are looking for selective early partners, not approval to start."*

**How to position it in the room:**
> **Open:** "I'm not trying to replace your booking or PMS stack. I'm focused on what happens before the guest arrives — the part where your team still gets flooded with repetitive questions and your website stops being helpful."
> **Then:** "We're launching a concierge layer that sits on top of the current site, handles common property and area questions, and turns the website into a more useful pre-arrival experience."
> **Close:** "If this took even a meaningful slice of repetitive guest questions off your team on a pilot group of properties, would that be worth testing?"

---

## 5.14 — QR Menus & Table Experience

**What it is:** Mobile-first menus that show specials, happy hour, events, featured items, rewards, and review prompts. The QR menu becomes a customer-capture tool, not just an information display.

**Features described:**
- Digital menu with QR code, categories, and photos
- Mobile menus with specials, happy hours, images, item details, updates
- Item-level photos and details
- Live specials and market pricing
- Loyalty opt-in on the menu
- Review prompts
- Analytics: QR scans, clicks, saves, followers, menu views, lead sources

**The full-circle target flow:** Scan QR → know who scanned → loyalty opt-in → tie to their order → next-day SMS → item-level review → one verified review per visit

**QR scan capabilities:** scan logging, event tracking, lead scoring, phone capture, referral partners, time-on-page tracking, source attribution

---

## 5.15 — Customer Capture Widget

**What it is:** Captures interest before a person leaves the site, menu, booking page, or business profile.

**What it collects:** Guest name, phone, email · Party size and travel dates · Activity interest and booking intent · Digital receipt opt-in · Full trip planner opt-in · Future specials and SMS consent

**Widget options:** Request info form · VIP list signup · Digital receipt option · Trip planner option · Last-minute availability alerts · Customer info shared with business

**Deployment:** Add to your own website, landing page, or WordPress site.

**The pitch:** *"We do not just send bookings. We help you capture guests, follow up, and create repeat business."*

---

## 5.16 — Pre-Booking Capture (Activities/Tours/Rentals)

**What it is:** CyberCheck sits **before** a business's existing booking page. The booking system still handles checkout; CyberCheck captures the intent before the customer gets there.

**Five-step flow:**
1. **Customer Discovers** — finds a cruise, rental, charter, restaurant, artist, or activity on GCR, Trip Swipe, QR, or social
2. **Interest Captured** — name, phone/email, activity, party size, date, time, source
3. **Book Now Redirect** — customer continues to the business's existing booking page
4. **Dashboard Updated** — business sees who clicked, what they wanted, what they almost booked
5. **Follow-Up Sent** — recover abandoned interest with reminders, promos, weather alerts, similar options

---

## 5.17 — SMS Marketing & Last-Minute Fill

**What it is:** Automated SMS to fill openings, confirm details, and bring previous guests back.

**Campaign types:**
- **Open Seats** — alerts when seats open up or a trip needs more people
- **Weather Updates** — changes, delays, schedule updates
- **Local Promos** — specials across your local tourist audience
- **Repeat Visitors** — reach customers when they return next season or next vacation

**The problem it solves:** *"Every empty seat is lost revenue."* A fishing trip leaving with empty seats, a dolphin cruise with unsold spots, or a pontoon sitting at the dock is money that disappears forever.

---

## 5.18 — Smart Public Pages

**What it is:** A better-than-Linktree business page with real actions.

**Page actions described:**
| Action | Detail | Badge |
|---|---|---|
| Book Now | Live availability and time slots | 24/7 |
| View Services / Menu | Packages, pricing, specials, happy hour | Live |
| Reviews + Photos | Show what makes the business worth booking | Proof |
| Events / Live Music | Display what's happening right now | Updated |
| Contact + Directions | One tap to call, text, save, or map it | Easy |
| Gulf Coast Radar Boost | Tourists discover you while they're in town | Traffic |

**The four-layer model:** Smart Public Page → Booking + Reservations → Dashboard + CRM → Gulf Coast Radar

---

# 6. Industry Packages

Every industry gets the same foundation; the modules and pitch change.

| Industry | Modules / Features | Sales angle |
|---|---|---|
| **Restaurants, Bars, Cafes** | QR menus, happy hour, daily specials, events, song requests, reviews, SMS, loyalty, reservations, order links | Turn every table scan into a customer relationship |
| **Fishing Charters + Dolphin Cruises** | Boats, captains, trips, species, seats, weather rules, deposits, FareHarbor/Peek handoff, review proof | Fill open departures and prove who sent the booking |
| **Boat Rentals + Watersports** | Equipment units, time windows, damage deposits, waivers, fuel rules, pickup/return, weather holds | Make inventory bookable and reduce phone questions |
| **Condos + Vacation Rentals** | Units, rates, fees, house rules, iCal, guest messages, concierge offers, repeat stays | Turn a stay into a local guest relationship |
| **Hotels + Resorts** | Room types, rate plans, amenities, concierge recommendations, partner referrals, guest follow-up | Keep guests connected before, during, and after the trip |
| **Marinas + Location Hubs** | Slips, fuel, bait, services, resident businesses, charters, dockage, parent-child marketplace | Make the hub searchable, bookable, and referral-aware |
| **Golf Courses** | Tee times, pricing, memberships, events, clubhouse menu, happy hour, weddings, reviews | Multi-module page from one preset |
| **Salons + Personal Care** | Staff, services, durations, appointments, deposits, aftercare, reviews, rebooking SMS | Turn appointments into repeat clients |
| **Home Services + Trades** | Service areas, quote requests, technicians, work orders, emergency rates, warranties, proof-backed reviews | Capture urgent leads and prove completed work |
| **Retail + Products** | Products, variants, inventory, pickup, deals, loyalty, product-specific reviews | Show what's in stock and bring customers in |
| **Artists + Venues** | Artist profiles, song requests, tips, shoutouts, fan follows, events, booking leads | Make live music interactive and measurable |
| **Events + Attractions** | Tickets, schedules, capacity, rules, venue spaces, private requests, sponsor/referral links | Turn interest into attendance and proof |
| **Real Estate + Auto + Boat Sales** | Listings, inventory, showings, test drives, lead capture, financing info, proof and follow-up | Turn browsing into structured high-intent leads |
| **Photographers** | Packages, portfolio, booking inquiry, pricing, contact flow, client galleries, model release | Service-based session booking |
| **Transportation / Taxi** | SMS dispatch, driver rotation, luggage pickup, airport shuttle | Lead dispatch with bidding |
| **Local Groups** | Events, schedules, memberships, updates, announcements, directories, community workflows | Community workflows |

---

# 7. Pricing Packages

All pricing found across the source documents.

### CyberCheck Reviews
| Tier | Price |
|---|---|
| Starter | Free with CyberCheck Bookings (up to 50 reviews/mo) |
| Pro | **$29/month** |
| Enterprise | Custom |

### CyberCheck + GCR Connected Platform
| Tier | Price | For |
|---|---|---|
| Starter | **$99/mo** | One business profile with basic lead capture |
| Growth ★ | **$199/mo** | Businesses that want follow-up and customer recovery |
| Premium | **$399+/mo** | Custom workflows, artists, tourism, restaurants, deeper campaigns |

**Starter includes:** Business profile, lead capture, Book Now redirect, QR code, basic dashboard
**Growth adds:** SMS alerts, customer timeline, abandoned interest follow-up, events/specials management
**Premium adds:** Custom automations, artist/venue tools, QR menu system, cross-promotion campaigns, advanced reporting

### Real-Time Availability
| Tier | Price |
|---|---|
| CyberCheck Real-Time Starter | **$99/mo** |

### Business Automation Command Center (no prices stated)
| Tier | Includes |
|---|---|
| **Foundation** — Business Data Command Center | Business profile setup, hours/menu/offers/photos/FAQs/policies, website/GCR/QR-ready data, basic dashboard access, change log |
| **Popular** — Automation Pack | Everything in Foundation + approved scripts/tools, SMS updates, review invites, booking/opening checks, monthly management |
| **Full system** — Ghost OS Business AI | AI phone/SMS number, business AI workspace, Ghost Box option, review proof + loyalty, multi-AI setup support, custom scripts |

### Universal Platform Offer Stack (no prices stated)
| Tier | Includes |
|---|---|
| **Entry** — Smart Business Profile | Profile + photos + hours, FAQs + policies + tags, offers + prices, review display, basic analytics |
| **Best pilot** — Booking Capture + Verified Reviews | Capture widget, booking handoff, email parser proof, verified review flow, referral attribution |
| **Full platform** — Commerce OS + AI | Resource availability, native booking, SMS/voice, loyalty/rewards, AI assistant |

### Customer-Facing Packages (no prices stated)
| Package | For |
|---|---|
| **Starter Profile** | Businesses needing a stronger presence fast |
| **Customer Capture** | Businesses already using booking platforms |
| **Direct Booking** | Operators who want to own booking and payment |
| **Growth OS** | Serious operators and partners |

### Sellable Package Table
| Package | What it sells | Best buyer |
|---|---|---|
| QR Menu + Specials | Mobile menu, specials, happy hour, events, item highlights, review prompts | Restaurants, cafés, bars, food trucks |
| Authentic Reviews | Review requests tied to visits, receipts, reservations, orders, QR scans, completed work | Restaurants, services, charters, rentals |
| Customer Capture Widget | Lead forms, SMS opt-ins, booking interest, offers, rewards, follow-up | Any business with website traffic |
| Business Automation | Update hours, menus, pages, events, customer messages, review flows from one command center | Owners and managers |
| Gulf Coast Radar Discovery | Local listings, events, specials, recommendations, discovery pages | Businesses wanting local visibility |
| Ghost OS Business AI | AI number, voice/SMS commands, approved scripts, local runner, multi-AI setup | Advanced businesses and teams |

### The Fastest First Sale
> Start with the business profile, customer capture widget, tracked booking handoff, email parser proof, and verified review flow. That gives the business value without forcing them to replace every system immediately.

### The Long-Term Sale
> Once the first loop works, add native booking, SMS, referrals, loyalty, dashboards, AI, and additional modules.

---

# 8. Integrations & Platforms Supported

### Booking / Activity Platforms
FareHarbor · Peek Pro · BoatBooker · WaveRez · Rezdy · Bókun · Checkfront · Bookeo · Planyo

### OTA / Travel
Viator / TripAdvisor Experiences · GetYourGuide · Booking.com · Expedia

### Vacation Rental
Airbnb · VRBO / HomeAway · Guesty · Hostaway · Lodgify · Vacasa · Brett Robinson · Meyer · Escapia

### Restaurant / Reservations
OpenTable · Resy · Tock · Yelp Reservations · OnTap / Beer Menus

### POS
Toast · Aloha · Square · Clover

### Services / Appointments
Vagaro · MindBody · Square Appointments · HoneyBook · Acuity Scheduling · Calendly · Booksy · GlossGenius · StyleSeat

### Payments
Stripe (Connect, standard, webhooks, subscriptions) · Square · PayPal · Venmo · Cash App

### AI Providers
Anthropic (Claude) · OpenAI (ChatGPT) · Google (Gemini) · xAI (Grok) · Groq

### Communication
Brevo (SMS, email, promo blasts) · Nodemailer · Resend · SendGrid

### Other
Google Business Profile (OAuth + review sync) · Facebook · Instagram · TikTok · Spotify · GoHighLevel (CRM) · Ghost Box (local runner) · Starlink (connectivity path)

### Calendar
iCal import/export · Google Calendar · Outlook / Exchange

### Form Builders
WPForms · Fluent Forms · Jotform · Typeform

---

# 9. Database Structures Described

### Core Entity Model
```
entity                    — the business record (name, slug, type, contact, hero image, hours, socials)
entity_sections           — ordered content sections (section_type determines rendering)
entity_locations          — multiple locations per entity
entity_contacts           — contact records
entity_relations          — parent/child (marina → charters, building → units)
entity_aliases            — alternate names
entity_sources            — where each fact came from
entity_hours              — per-day open/close
entity_photos             — media
entity_tags               — amenity tags
entity_faqs               — Q&A
entity_policies           — rules and policies
entity_attributes         — universal key/value facts (dress code, parking, health score)
entity_theme              — per-entity theme
entity_owners             — user_id → entity_slug (ownership link)
entity_modules            — which modules a business enabled
```

### Module System
```
module_registry           — catalog of available modules
module_manifest           — installable app definitions
module_display_styles     — layout options per module
module_data_contracts     — required/optional fields per module
module_required_fields
module_optional_fields
module_ai_intents         — what questions the module can answer
module_import_rules       — how imports map to this module
module_permissions
entity_module_grants
entity_module_display_settings
business_type_presets     — recommended module bundles by industry
preset_modules
user_modules              — installed modules per site
```

### Offers & Pricing
```
entity_offers             — everything sellable
entity_offer_prices       — per-unit pricing
entity_offer_sections
entity_offer_inclusion
offerings                 — catalog rows (trips, rooms, services, fleet, add-ons, gift cards, memberships, products)
offering_prices           — per-person prices
promos                    — discounts
menu_sections + menu_items
drink_sections + drink_items
happy_hour_sections + happy_hour_items
catalog_sections + catalog_items + catalog_section_days
```

### Booking & Availability
```
bookable_resources        — boats, rooms, units, staff, tables, chairs, slips, vehicles, equipment
resource_schedules
rate_rules
availability_slots        — date, time, capacity, status
calendar_claims
booking_calendar          — every date-claim from every source (direct, manual, airbnb, fareharbor, ical, email)
external_calendar_sources
booking_events
availability_snapshots
bookings                  — one universal table; unit is DATA, not a separate table
booking_requests          — pending requests
holds
integrations              — connected provider credentials
integration_items         — items pulled from providers
```

### Evidence, Reviews, Loyalty
```
capture_sessions          — customer intent before booking
inbound_messages          — raw forwarded emails
parser_runs               — extraction attempts
customer_transactions
review_invites
review_evidence
entity_reviews
entity_google_reviews
item_reviews
referral_events
referral_partners
points_ledger
loyalty_programs
loyalty_members
reward_offers
```

### Customer Identity
```
customer_profiles
customer_identities
customer_consents
customer_transactions
customers
booking_opt_ins
```

### Import Pipeline
```
import_batches
raw_import_files
staging_import_rows
import_field_mappings
data_quality_checks
manual_review_queue
```

### Table QR / Session
```
table_sessions            — one QR per table, session starts on scan
table_orders              — what they ordered
orders + order_lines
```

### Communication
```
sms_subscribers
sms_messages
sms_log
customer_consents
```

### Condo/Rental Specific
```
properties                — name, manager, complex, city, address, bedrooms, bathrooms, sleeps,
                            pet_friendly, beachfront, pool, lazy_river, price_min, price_max,
                            booking_url, hero_image_url, status
property_availability     — property_id, start_date, end_date, status, source, ical_url, last_synced_at
trip_profiles             — phone, travel_dates, party_size, budget, saved_properties, saved_businesses
rental_units
vessels
```

### Artists
```
artists
artist_profiles
artist_bookings
song_requests
shoutouts
```

### Other
```
search_index
entity_external_listing
booking_platform
personal_care_services
trade_home_services
professional_services
health_medical_services
tourist_click_events
qr_scans
permission_catalog
action_audit_log
business_staff
```

---

# 10. Build Status — Real vs. Planned

Verified against the live codebase (`gcr-api-clean`, `cybercheck-login`, `gcr-unified`, `restaurant-menu-editor`).

## Architecture (confirmed)
- **gcr-api-clean** — pure Express API, **zero frontend files**, single Supabase database. The "remote control."
- **cybercheck-login** — admin dashboard + owner dashboard + public pages. Frontend only; Supabase anon key used for auth identity only, all data through the API.
- **gcr-unified** — React consumer app, 40+ page components, calls gcr-api-clean.
- **restaurant-menu-editor** — Next.js standalone menu editor, calls gcr-api-clean.

## ✅ Built and Real

| Thing | Evidence |
|---|---|
| Entity spine | `entity` table, 4,067 businesses |
| Content layer | 52,191 photos · 11,147 menu items · 15,116 hours rows · 1,222 events · 10,988 own reviews · 10,591 Google reviews · 18,138 offers · 1,055 bookable resources |
| Universal booking engine | `routes/platform.js`, 2,186 lines — slots/range/day modes, capacity, cutoffs, add-ons, price tiers, promos, waivers, manage/cancel/reschedule |
| Discovery API | `routes/gcr.js`, 2,670 lines — search, browse, entity detail, home feed, fuzzy match, AI concierge tools |
| Email parser | `routes/email-parser.js`, 1,464 lines — **26 platform extractors**, dedupe, iCal import |
| Daily update link | `routes/update-link.js`, 1,376 lines — token URL by SMS, no login, specials/menu/drinks/happy-hour/events/catch-of-the-day, camera upload |
| Trip Swipe | `routes/tourist.js`, 2,251 lines — swipe, saves, groups, itineraries, 8 AI tools, preference learning |
| QR system | `routes/qr.js`, 675 lines — scan logging, event tracking, lead scoring, phone capture, referral partners |
| Stripe | Connect onboarding, payments, refunds, platform fee via `application_fee_amount` |
| FareHarbor integration | `routes/fareharbor.js`, 439 lines — API key connect, pull items + availability |
| iCal in/out | `utils/ical-parse.js`, `utils/ical-feed.js` |
| Modular app store | 69 JSON manifests in `apps/`, loaded by `modular-dashboard.html` |
| Admin dashboard | `admin.html`, ~1.1 MB, live and in use |
| Signup API | `POST /api/auth/signup` — creates auth user, business, user record, JWT, with rollback |
| Wavegent (page design AI) | `js/wavegent-tab.js`, `/api/wavegent/[slug].js`, `public/wavegent/sections/*` |
| Availability widget | `widget.html`, `/widget/:slug` — embeddable per-business calendar |

## ⚠️ Built but Blocked / Not Wired

| Thing | Blocker |
|---|---|
| Public homepage explaining the platform | New version written on branch `claude/image-upload-batch-pdsr4c`, **unmerged**. Production still serves old "voice automation" page. |
| Working signup entrance | `signup.html` calls an undefined `CyberCheckAPI` global → every submit throws. Fix written on same unmerged branch. |
| Owner dashboard | `login.html` routes to `app-dashboard.html`, which only knows `/api/apps` (0 rows). Real dashboard is `modular-dashboard.html`. Fix on same branch. |
| Any booking | 5 Postgres functions the code calls do not exist: `create_booking_hold`, `create_booking_if_available`, `increment_customer_bookings`, `increment_deal_clicks`, `exec_sql`. `bookings` = 0 rows. |
| Multi-listing per account | `ownedSlug()` in `platform.js:74` uses `.maybeSingle()` — returns only one entity per user. Schema supports many; API doesn't. |
| Owner accounts | `entity_owners` = 0 rows. No business has ever completed signup. |
| Module registry (DB version) | `routes/modules.js` written but **unmounted** — backing tables don't exist. The working registry is the 69 flat JSON files. |
| Unmounted routes | `boat-rental`, `charter`, `google-business`, `messaging`, `modules`, `photographer`, `rides`, `whatsapp` — commented out in `server.js` |

## ❌ Not Built (0%)

| Thing | Status |
|---|---|
| API Page Composer (`GET /api/entities/:slug/page`) | Doesn't exist — logic scattered across `gcr.js`/`platform.js` |
| Frontend Module Renderer | Doesn't exist — `gcr-unified` pages are hand-built per business type |
| Verified review evidence system | `review_invites`, `item_reviews`, `review_evidence` — 0 rows, 0 code |
| Loyalty / rewards wallet | `loyalty_programs`, `loyalty_members` — 0 rows |
| Unified CRM | `customer_profiles`, `customer_identities`, `customer_consents` — 0 rows, 0 code |
| Table QR sessions | `table_sessions`, `table_orders` — 0 rows, 0 code |
| Referral attribution / commission | `tourist_click_events` written but never read; `referral_partners` = 0 |
| AI Number / Ghost OS / Ghost Box | No code |
| aWavegent guest concierge widget | No code (distinct from the built Wavegent page-designer) |
| Stripe subscriptions | Only Connect + per-transaction fee exist |
| SMS delivery | `sms_log` = 0 — A2P 10DLC not approved |
| Ads / sponsored placement | `ads`, `page_rails`, `tripswipe_sponsored` = 0 |
| Staff roles / permissions | `business_staff`, `permission_catalog`, `module_permissions` = 0, no code |

## 🔒 Security Items Outstanding
- **70 tables have RLS disabled** — readable and writable by anyone holding the anon key, which ships in the `gcr-unified` client bundle
- `POST /api/email-parser/inbound` accepts unsigned POSTs — anyone who finds the URL can inject fake bookings

## 🗂️ Data Model Duplication To Resolve
- `catalog_items` (12,216 rows) vs `menu_items` (11,147 rows) — two parallel menu models, both populated, only one read
- `entity_offer*` (18k rows) vs `offerings` (954) vs `bookable_resources` (1,055) — three catalog models
- `search_index` (35,182 rows) — populated, no reader
- `entity_google_reviews` (10,591 rows) — populated, no reader
- 36 of 88 populated tables have no reader anywhere in any repo

---

# The Foundation — What Has To Work First

Everything documented above sits on five things. Nothing else matters until these work.

1. **Homepage that explains the platform** — written, unmerged
2. **Account creation that works** — API is solid; the live entrance is broken; fix written, unmerged
3. **Owner dashboard with the app store** — `modular-dashboard.html` exists and works; login points at the wrong page; fix written, unmerged
4. **Multi-listing per account** — `ownedSlug()` one-line class of change, not written
5. **Bookings possible** — 5 Postgres functions, not written

Steps 1–3 are one `git merge`. Steps 4–5 are small, isolated code.

---

*Document compiled from all uploaded source material. Build status verified against live code, not assumed.*
