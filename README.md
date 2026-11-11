# cybercheck-login

The original CyberCheck business platform: about a hundred static HTML pages with vanilla JavaScript for the admin and for each business (dashboards, menu editor, booking, automations, onboarding, an app store), served from Vercel and backed by the Gulf Coast Radar API.

No build step. Every page talks to [`gcr-api-clean`](https://github.com/CultureReset/gcr-api-clean); the address is set in `config.js`. This platform has been replaced by [`Admin-dashboard-main`](https://github.com/CultureReset/Admin-dashboard-main) and [`Dashboards-users-`](https://github.com/CultureReset/Dashboards-users-).

## What is here

| Path | What it holds |
|---|---|
| `*.html` (root) | The admin and business pages: admin dashboard and pricing, business dashboard, booking, menu and card builders, automations, claim a business, app store, QR tracker, tourist admin |
| `apps/` | The installable apps the app store lists, one folder each |
| `api/` | Vercel serverless functions used by the pages |
| `js/`, `css/`, `tabs/`, `shared-data.js` | Shared scripts, styles and dashboard tabs |
| `integrations/`, `migrations/`, `tools/` | Integration helpers, SQL migrations and maintenance scripts |
| `GCR_DATA_FLOW.md`, `ADMIN_EDIT_CAPABILITIES.md`, `MENU_SYSTEMS_COMPARISON.md` | How data moves, what the admin can edit, and how the menu systems compare |

## Run it

Serve the folder with any static server, or deploy it to Vercel as is; `vercel.json` holds the rewrites. Last changed August 2, 2026.
