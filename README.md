# CyberCheck Business Dashboard Platform

**Multi-tenant business management dashboard** - Works for ALL business types (rentals, restaurants, salons, shops, etc.)

## Features

### Core Modules (All Businesses)
- 📊 **Analytics** - Traffic, conversions, revenue tracking
- 🔍 **SEO Manager** - Meta tags, sitemap generation, schema.org
- 📱 **Social Media** - Post to Facebook, Instagram, Twitter, TikTok, YouTube
- 👥 **Customers** - CRM with full customer database
- ⭐ **Reviews** - Review management and responses
- 💬 **Messaging** - SMS notifications and customer communication
- 🎨 **Theme Editor** - Customize colors, fonts, branding
- 🌐 **Domain Manager** - Custom domain setup
- 💳 **Billing** - Subscription and payment management
- 🔗 **Connections** - OAuth integrations (Stripe, Square, Google, etc.)

### Business-Type Specific Modules
**Rental Businesses** (boats, bikes, equipment):
- Fleet management
- Availability calendar
- Digital waivers
- Add-ons (docks, helmets, etc.)

**Bakery/Restaurant** (coming soon):
- Product catalog
- Orders management
- Categories & variants
- Inventory tracking

## Tech Stack

- **Frontend**: Vanilla JavaScript (no framework dependencies)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe Connect
- **CSS**: Custom CSS variables for easy theming

## Setup

1. Install Supabase and get your credentials
2. Update `js/supabase-client.js` with your Supabase URL and anon key
3. Deploy database schema (see backend-api repository)
4. Open `index.html` in browser or deploy to hosting

## Multi-Tenant Architecture

- Each business has a unique `site_id`
- Row Level Security (RLS) ensures data isolation
- Same dashboard code serves all businesses
- User sees only their business data after login

## Login

Default demo credentials:
```
Email: beachsideboats@myyahoo.com
Password: BeachBoats2026!
```

Create new businesses using the backend API.

## File Structure

```
/
├── index.html           - Main dashboard app
├── login.html          - Login page
├── css/
│   ├── dashboard.css   - Main styles
│   └── analytics-seo-social.css - Marketing module styles
├── js/
│   ├── cc.js           - API client
│   ├── analytics.js    - Analytics module
│   ├── seo.js          - SEO manager module
│   ├── social.js       - Social media module
│   ├── bookings.js     - Booking management
│   ├── customers.js    - Customer CRM
│   ├── reviews.js      - Review management
│   └── [27 other modules...]
└── shared-data.js      - Configuration
```

## License

Proprietary - CyberCheck Platform
