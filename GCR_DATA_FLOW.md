# GCR Data Flow & Admin Dashboard Connectivity

## API Connection
- **Admin Dashboard** → Points to: `https://gcr-api-clean.vercel.app` (or `gcr-api-clean-fresh.vercel.app`)
- **Public Site** (GCR Unified) → Reads same API
- **Database** ← Both repos connect to same Supabase database
- **Two Vercel Deployments** = "clean" and "fresh" (same codebase, two deploys for A/B testing)

---

## What Business Data Is Connected & Editable in Admin Dashboard

### ✅ FULLY CONNECTED (All data syncs to GCR Unified)

#### 1. **Entity Core Data** (`/api/admin/gcr/entities/:id`)
| Field | Editable? | Shows on GCR Unified |
|-------|-----------|---------------------|
| name, slug | ✅ Yes | Entity listing card & profile header |
| subtitle / tagline | ✅ Yes | Below name on card |
| description | ✅ Yes | Listing card description |
| subtype | ✅ Yes | Primary page placement (e.g. "restaurant" → Restaurants page) |
| icon | ✅ Yes | Emoji badge on listing |
| hero_image | ✅ Yes | Hero image on profile page |
| active | ✅ Yes | Live/hidden toggle |
| sponsored | ✅ Yes | ⭐ Pinned to top of listings |
| phone, website, directions | ✅ Yes | Profile page contact section |
| booking_url, reservation_url, order_url, menu_url | ✅ Yes | CTA buttons on profile |
| social_links (Instagram, Facebook, TikTok) | ✅ Yes | Profile footer |
| price_range | ✅ Yes | Profile page |
| rating, review_count | ✅ Yes | Star display on card |
| google_places_id | ✅ Yes | Google integration |
| address, city, state, zip | ✅ Yes | Profile page + map |

**API Endpoint:** `PUT /api/admin/gcr/entities/{id}` → saves all Info tab fields

---

#### 2. **Operating Hours** (`/api/admin/gcr/entities/:id`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| hours_mon, hours_tue, ... hours_sun | ✅ Yes | Profile page "Hours" section |

**API Endpoint:** `PATCH /api/admin/gcr/entities/{id}` with hours object

---

#### 3. **Photos** (`/api/admin/gcr/entities/:id`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| photos (array of URLs + captions) | ✅ Yes Add/delete | Photo gallery on profile page |
| first photo = hero on card | ✅ Yes | Card cover image |

**API Endpoint:** 
- `PATCH /api/admin/gcr/entities/{id}` with `{photos: {add: [...], delete: [...]}}`
- Image upload: `POST /api/admin/gcr/upload-image` → Supabase `entity-media` bucket

---

#### 4. **Tags** (`/api/admin/gcr/entities/:id/tags`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| tag (string) | ✅ Add/delete | Search filters, cross-page visibility |
| tag_category (amenity, cuisine, vibe, food, drink, activity, search) | ✅ Dropdown | Categorizes filters in UI |

**API Endpoints:**
- `POST /api/admin/gcr/entities/{id}/tags` → add tag
- `DELETE /api/admin/gcr/entities/{id}/tags/{tagId}` → remove tag

**Use Case:** Add "nightlife" tag to a restaurant so it appears on Nightlife page in addition to Restaurants page.

---

#### 5. **Features** (`/api/admin/gcr/entities/:id`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| features (array: {label, sort_order}) | ✅ Add/delete | Chip badges on profile (e.g. "Waterfront Views") |
| perfect_for (array: {label, sort_order}) | ✅ Add/delete | "Perfect For" section on profile |

**API Endpoint:** `POST /api/admin/gcr/entities/{id}/features` → add feature

---

#### 6. **Sections** (Rich Content) (`/api/admin/gcr/entities/:id/sections`)
Each section becomes a tab on the public profile page.

| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| section_key, section_label | ✅ Yes | Tab name on profile |
| section_type | ✅ Yes | Determines layout (rich_text, bullets, groups, cards, etc.) |
| content (rich text, bullets, images, cards, location, hours) | ✅ Full editor | Full tab content on profile |

**API Endpoints:**
- `POST /api/admin/gcr/entities/{id}/sections` → create section
- `PUT /api/admin/gcr/entities/{id}/sections/{sectionId}` → update content
- `DELETE /api/admin/gcr/entities/{id}/sections/{sectionId}` → remove section

**Examples:**
- "About" section (rich text)
- "Our Story" (bullets + images)
- "Dining Options" (cards)
- "Location & Hours" (location + embedded hours)

---

#### 7. **Menu / Drink Items** (`/api/admin/gcr/entities/:id/menu-items`, `/drink-items`, `/happy-hour`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| menu_items (name, description, price) | ✅ Add/edit/delete | Content tab on profile |
| drink_items | ✅ Add/edit/delete | Drinks list if section exists |
| happy_hour_items | ✅ Add/edit/delete | Happy Hour if section exists |

**API Endpoints:**
- `POST /api/admin/gcr/entities/{id}/menu-items` → add item
- `PUT /api/admin/gcr/entities/{id}/menu-items/{itemId}` → update
- `DELETE /api/admin/gcr/entities/{id}/menu-items/{itemId}` → remove

---

#### 8. **Events** (Per-Entity) (`/api/admin/gcr/entities/:id/events`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| event_name, description, date, time, image | ✅ Add/edit/delete | Events tab on profile OR global Events list |

**API Endpoint:**
- `POST /api/admin/gcr/entities/{id}/events` → create per-entity event
- `PUT /api/admin/gcr/events/{eventId}` → edit global event

---

#### 9. **Specials** (Per-Entity) (`/api/admin/gcr/entities/:id` or `/api/admin/gcr/specials`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| special_name, description, discount, valid_dates | ✅ Add/edit/delete | Specials section |

**API Endpoint:** `POST /api/admin/gcr/specials` → global specials (also filtered per entity)

---

#### 10. **Pages Assignment** (`/api/admin/gcr/entities/:id`)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| assigned_pages (array of page IDs) | ✅ Checkbox list | Entity appears on selected GCR pages |

**Pages Available:**
- Restaurants
- Bars & Lounges
- Coffee & Breakfast
- Happy Hours
- Activities & Tours
- Shopping
- Nightlife
- Accommodations
- Seafood
- etc.

**Logic:** 
- Subtype sets the primary page automatically
- Tags can auto-qualify for secondary pages
- Pages tab lets you manually override assignments

---

#### 11. **Wavegent** (AI-Generated Content)
| Field | Editable? | Shows on GCR |
|-------|-----------|-----|
| AI-generated descriptions, sections, tags | ✅ Edit/apply/reject | If approved, goes into profile |

**API Endpoint:** `POST /api/admin/ai-organize` → AI suggestions

---

### ⚠️ PARTIALLY CONNECTED or GLOBAL ONLY

#### **Global Events** (`/api/admin/gcr/events`)
- Editable in dashboard but **NOT per-entity-owned**
- Shows on global Events page
- Can be filtered by entity but manually linked

#### **Global Specials** (`/api/admin/gcr/specials`)
- Same as events — global list, shown everywhere
- Can tag/filter by business but not entity-exclusive

#### **Reviews** (`/api/reviews`)
- Pulled from external review providers (Google, Yelp, etc.)
- **Read-only in admin dashboard**
- Shown on profile if pulled correctly

#### **Ads** (`/api/admin/gcr/ads`)
- Managed separately for ad slots on GCR pages
- Not entity-specific data, more platform advertising

#### **Claims** (`/api/admin/gcr/claims`)
- Business ownership verification requests
- Approval workflow only

---

## Data Sync Flow

```
DATABASE (Supabase)
  ↓ (entities, sections, tags, features, photos, hours, menu_items, etc.)
  ↓
GCR API Clean / Fresh (https://gcr-api-clean.vercel.app)
  ↓ (admin endpoints) ← ADMIN DASHBOARD reads/writes
  ↓ (public endpoints) ← GCR UNIFIED reads
  ↓
GCR Unified (gcr-unified.vercel.app) — PUBLIC SITE
```

---

## What You Can Do in Admin Dashboard

### ✅ Complete Control:
1. **Create/Edit/Delete any business** (entity) with all core data
2. **Manage all business info** — name, hours, photos, contact, URLs
3. **Add/remove tags** — affects search & page visibility
4. **Add features & "perfect for"** labels
5. **Create rich content sections** — becomes tabs on profile
6. **Manage menu/drinks/happy hour** — per business
7. **Create events & specials** — per business or global
8. **Toggle live/sponsored status** — visibility control
9. **Add/remove photos** — with captions
10. **Edit business pages assignment** — which GCR pages it appears on
11. **AI-generate content** — descriptions, sections, tags
12. **Bulk import via CSV** — create/update multiple businesses at once

### ❌ Cannot Do (Read-Only or N/A):
- Pull reviews from Google/Yelp directly (they're pulled by a sync job)
- Override external review data
- Change QR tracking data (read-only, generated by system)
- Edit the GCR page templates themselves (separate repo)

---

## API Base URL in Admin Dashboard

**Default:** `https://gcr-api-clean.vercel.app`

To override in browser console:
```javascript
window.GCR_ADMIN_API = 'https://gcr-api-clean-fresh.vercel.app'
// or local
window.GCR_ADMIN_API = 'http://localhost:3000'
```

---

## Summary: Live Data Sync

**YES, all business data you edit in the admin dashboard displays LIVE on GCR Unified** because:
1. Both point to the same Supabase database
2. Admin dashboard writes via `/api/admin/gcr/*` endpoints
3. GCR Unified reads the same data via `/api/gcr/*` endpoints
4. No caching delays or sync lag

**You have complete control** over every section, field, and visibility toggle shown on GCR Unified. The admin dashboard is the single source of truth for all business data displayed on the public site.
