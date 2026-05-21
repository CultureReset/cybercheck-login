# Admin Dashboard Edit Capabilities

## Summary
The admin dashboard is **fully built out** with edit forms for everything GCR. 

**Problem:** The backend endpoints don't exist yet.  
**Solution:** Need to add `PUT` and `PATCH` endpoints to `/api/admin/gcr/` to handle saves.

---

## What the Admin Dashboard CAN Edit (9 Tabs)

### **Tab 1: Info** ✅ (Form Ready)
All basic entity information:
- Name
- Slug
- Subtitle / Tagline
- Description
- Entity Subtype (category: restaurant, bar_grill, etc.)
- Icon (emoji)
- Phone
- Rating
- Review Count
- Hero Image URL
- Website URL
- Directions URL
- Booking URL
- Reservation URL
- Order Online URL
- Menu URL
- Social Media (Instagram, Facebook, TikTok)
- Price Range (dropdown: $, $$, $$$, $$$$)
- Google Places ID
- Address (address_line_1)
- City
- State
- Zip
- **Live on GCR** (checkbox — is_active)
- **Sponsored** (checkbox — is_sponsored, sort_order)

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id`  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 2: Hours** ✅ (Form Ready)
Open/close times for each day of the week:
- Monday: open time + close time
- Tuesday: open time + close time
- Wednesday: open time + close time
- Thursday: open time + close time
- Friday: open time + close time
- Saturday: open time + close time
- Sunday: open time + close time

(Can type "Closed" for closed days)

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id` with `{ hours: { schedule: [...] } }`  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 3: Photos** ✅ (Form Ready)
Manage entity photos:
- Add photo by URL (paste image URL)
- Add caption (optional)
- Delete individual photos
- Reorder photos

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id` with `{ photos: { add: [...], delete: [...] } }`  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 4: Tags** ✅ (Form Ready)
Add/remove tags for search, filtering, and cross-page visibility:
- Tag input field
- Category dropdown (amenity, vibe, cuisine, activity, search)
- Add tag button
- Delete individual tags

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id` with tags array  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 5: Features** ✅ (Form Ready)
Two sections:
1. **Feature Chips** — short labels shown on profile (e.g., "Waterfront Views", "Daily Departures")
2. **Perfect For** — who this business is ideal for (e.g., "Families with kids", "Date night")

Each has:
- Input field
- Add button
- Delete individual items

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id`  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 6: Content** ✅ (Form Ready)
Manage all business content across 5 sub-tabs:

#### **6a. Menu**
- Add menu items (name, description, price, image, allergens)
- Edit menu items
- Delete menu items
- Organize into sections
- Reorder items

#### **6b. Drinks**
- Add drink items (name, description, price, style, brewery)
- Edit drink items
- Delete drink items
- Organize into sections
- Reorder items

#### **6c. Happy Hour**
- Add happy hour items
- Edit happy hour items
- Delete happy hour items
- Set HH times (hh_days, hh_start, hh_end)

#### **6d. Specials**
- Add specials (name, description, discount text, days)
- Edit specials
- Delete specials

#### **6e. Events**
- Add events (name, date, description, type, venue)
- Edit events
- Delete events

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id`  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 7: Sections** ✅ (Form Ready)
Create/edit custom page sections:
- Rich text sections
- Bullet point sections
- Grouped item sections
- Card sections
- Section-specific photos
- Location info
- Hours display

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id`  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 8: Pages** ✅ (Form Ready)
Assign entity to GCR listing pages:
- Restaurants
- Activities / Things to Do
- Coffee & Sweets
- Other category pages

**Save Endpoint Called:** `PATCH /api/admin/gcr/entities/:id`  
**Status:** ❌ Endpoint doesn't exist

---

### **Tab 9: Wavegent** ✅ (Form Ready)
AI-generated page content:
- Auto-generate content
- Edit AI-generated descriptions
- Accept/reject AI suggestions

**Save Endpoint Called:** `POST /api/admin/gcr/wavegent/:id`  
**Status:** ❌ Endpoint doesn't exist

---

## Other Edit Buttons on Admin Dashboard

### **GCR Businesses List Page**
- **Edit** button per business → opens Entity Editor modal
- **Merge Entities** button → merge duplicates
- **New Entity** button → create new business

### **Create New Entity**
Form to add:
- Name
- Slug
- City
- Category
- Initial info

**Save Endpoint Called:** `POST /api/admin/gcr/entities`  
**Status:** ❌ Endpoint doesn't exist

---

## Current API Endpoints Called (Missing)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `PATCH` | `/api/admin/gcr/entities/:id` | Update entity (info, hours, photos, tags, features, content, etc.) | ❌ Missing |
| `POST` | `/api/admin/gcr/entities` | Create new entity | ❌ Missing |
| `DELETE` | `/api/admin/gcr/entities/:id` | Delete entity | ❌ Missing |
| `POST` | `/api/admin/gcr/wavegent/:id` | Generate AI content | ❌ Missing |

---

## What Needs to be Built

### **1. PATCH /api/admin/gcr/entities/:id**
Update an entity (all fields at once or specific sections)

**Request body examples:**

```javascript
// Update basic info
{
  entity: {
    name: "Cosmos Restaurant",
    slug: "cosmos-restaurant-bar",
    phone: "251-123-4567",
    rating: 4.8,
    // ... all info tab fields
  }
}

// Update hours
{
  hours: {
    schedule: [
      { day: "Monday", open: "10:00 AM", close: "9:00 PM", closed: false },
      { day: "Tuesday", open: "10:00 AM", close: "9:00 PM", closed: false },
      // ... rest of week
    ]
  }
}

// Update photos
{
  photos: {
    add: [
      { image_url: "https://...", caption: "Dining area" }
    ],
    delete: ["photo_id_1"]
  }
}

// Update tags
{
  tags: [
    { tag: "waterfront", tag_category: "amenity" },
    { tag: "live_music", tag_category: "feature" }
  ]
}

// Update menu items
{
  menu: {
    sections: [{...}],
    items: [{...}]
  }
}
```

**Response:** Updated entity object

---

### **2. POST /api/admin/gcr/entities**
Create a new entity

**Request body:**
```javascript
{
  name: "New Restaurant",
  slug: "new-restaurant",
  city: "Orange Beach",
  entity_subtype: "restaurant",
  // ... initial fields
}
```

**Response:** Created entity object with ID

---

### **3. DELETE /api/admin/gcr/entities/:id**
Delete an entity (soft delete or hard delete)

**Response:** Confirmation or updated entity

---

### **4. POST /api/admin/gcr/wavegent/:id** (Optional)
Generate AI content for an entity

**Request body:**
```javascript
{
  entity_id: "...",
  generate_for: "description" // or "features", "perfect_for", etc.
}
```

**Response:** Generated content suggestions

---

## How It Works When Connected

1. User edits business info in admin dashboard
2. Clicks "Save Info" button
3. Frontend collects all form fields
4. Sends `PATCH /api/admin/gcr/entities/:id` with updated data
5. Backend updates the `entity` table in GCR database
6. Backend invalidates cache (gcrv9:entities, gcrv9:profile:*)
7. Frontend reloads entity list
8. All frontends (launching-GCR, search.html, profile.html) fetch fresh data
9. Everyone sees updated information immediately

---

## Cache Invalidation Needed

When any edit happens, clear these cache keys:
```
gcrv9:entities          // all entities listing
gcrv9:events            // events
gcrv9:specials          // specials
gcrv9:happy-hours       // happy hour businesses
gcrv9:profile:{slug}    // individual profile (for all edited entity)
```

Or use a single pattern clear: `gcrv9:*`

---

## Data Flow: Dashboard Edit → Live Update

```
Admin Dashboard (cybercheck-login)
    ↓
Click "Save Info"
    ↓
PATCH /api/admin/gcr/entities/:id
    ↓
Database updated (entity table)
    ↓
Cache invalidated
    ↓
Frontend reloads entities list
    ↓
launching-GCR, search.html, profile.html
all fetch fresh data
    ↓
Everyone sees updated data
    ↓
✓ One source of truth (slug) across all platforms
```

---

## Next Steps

Implement the 4 missing API endpoints:
1. `PATCH /api/admin/gcr/entities/:id` — Update entity
2. `POST /api/admin/gcr/entities` — Create entity
3. `DELETE /api/admin/gcr/entities/:id` — Delete entity
4. `POST /api/admin/gcr/wavegent/:id` — AI content (optional)

Once implemented, the dashboard will work perfectly and all edits will immediately sync to all frontends.
