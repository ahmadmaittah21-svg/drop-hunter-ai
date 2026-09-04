# Drop Hunter AI

AI-powered e-commerce research and eBay listing preparation platform. Paste an AliExpress product URL, get a factual, normalized product record, an AI-drafted eBay listing (title, description, item specifics, category suggestion), a profit calculator, a transparent Winning Product Score, and a policy/risk check — all before you publish.

The app also ships the full database schema, provider architecture, and UI shell for a future **Product Hunter** automated discovery engine, so that feature can be added without re-architecting anything.

## Features

- **Product Importer** — paste a URL, get normalized product data via a pluggable `ProductDataProvider` (AliExpress integration layer + offline Demo provider).
- **AI Listing Generation** — centralized prompt engine (`src/lib/ai/prompts.ts`) that never fabricates brand/model/spec data; every AI call is schema-validated.
- **Profit Calculator** — instant recalculation of gross revenue, fees, total cost, profit, margin, and ROI.
- **Winning Product Score** — transparent, weighted 0–100 score across 9 factors; explicitly reports `INSUFFICIENT DATA` instead of faking a high score.
- **Item Specifics Mapper** — AI-mapped eBay item specifics with a HIGH/MEDIUM/LOW confidence indicator per field.
- **Policy / Risk Checker** — pattern-based GREEN/YELLOW/RED warnings for medical claims, trademarks, restricted items, and missing information. Assistance only — never claims eBay compliance.
- **Listing Builder** — tabbed editor (title, description, specifics, category, variations, images, pricing, preview) with a Listing Quality Score, export (JSON/CSV/HTML/TXT), and copy-to-clipboard.
- **Product Finder / Product Radar** — architecture (`ProductDiscoveryProvider`) plus a working demo discovery provider so the research flow is fully clickable today.
- **eBay API preparation** — `EbayService` abstraction with mock responses until real credentials are configured; a real integration can be dropped in without touching the rest of the app.
- **Demo Mode** — the entire product flow works with zero external credentials, using realistic sample data.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI primitives, lucide-react
- **Backend:** Next.js Route Handlers (API routes), TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **AI:** OpenAI API via a centralized server-side service layer (never exposed to the browser)
- **Auth:** Minimal built-in session auth (scrypt password hashing + signed cookie) with a Demo Mode auto-provisioned user, so no external provider is required to try the app
- **Testing:** Vitest

## Project Structure

```
drop-hunter-ai/
├─ prisma/
│  ├─ schema.prisma        # all data models (Product, Listing, ProductAnalysis, ...)
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ dashboard/                     /dashboard
│  │  ├─ products/                      /products, /products/import, /products/[id]
│  │  ├─ research/                      /research (Product Finder + Product Radar)
│  │  ├─ listings/                      /listings, /listings/[id]
│  │  ├─ settings/                      /settings, /settings/api, /settings/preferences
│  │  ├─ analytics/                     /analytics
│  │  └─ api/                           all route handlers (see below)
│  ├─ components/
│  │  ├─ ui/                 button, card, badge, input, tabs, switch, select
│  │  ├─ layout/              app-shell (sidebar nav)
│  │  ├─ products/            product-workspace (overview/specs/images/profit/score/listing tabs)
│  │  ├─ listings/            listing-builder
│  │  └─ shared/               page-header, score-pill
│  ├─ lib/
│  │  ├─ providers/           ProductDataProvider interface, AliExpress + Demo + Generic
│  │  ├─ discovery/           ProductDiscoveryProvider interface + Demo implementation
│  │  ├─ ai/                  aiService.ts + prompts.ts (centralized prompt engine)
│  │  ├─ scoring/              winningScore.ts, listingQuality.ts
│  │  ├─ profit/               profitCalculator.ts
│  │  ├─ policy/               policyChecker.ts
│  │  ├─ ebay/                 ebayService.ts (Sell API abstraction)
│  │  ├─ validation/           zod schemas
│  │  ├─ auth.ts, db.ts, crypto.ts, utils.ts
│  └─ types/product.ts        shared domain types
└─ tests/                     vitest unit tests
```

### API Routes

```
POST /api/products/import
GET  /api/products
GET  /api/products/:id
POST /api/products/:id/analyze
POST /api/products/:id/generate-title
POST /api/products/:id/generate-description
POST /api/products/:id/generate-specifics
POST /api/products/:id/calculate-score
POST /api/products/:id/policy-check
POST /api/profit/calculate

POST /api/listings
GET  /api/listings
GET  /api/listings/:id
PUT  /api/listings/:id
POST /api/listings/:id/quality-score
GET  /api/listings/:id/export?format=json|csv|html|txt

POST /api/research/search
GET  /api/research/winners

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

GET/PUT /api/settings/preferences
GET/POST /api/settings/credentials

GET /api/dashboard/summary
```

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in what you have:

```bash
cp .env.example .env
```

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Signs session cookies. `openssl rand -base64 32` |
| `CREDENTIAL_ENCRYPTION_KEY` | Only if storing per-account API credentials | AES-256-GCM key. `openssl rand -base64 32` |
| `DEMO_MODE` | No (defaults to on) | `true` runs on offline sample data with an auto-provisioned demo user; set `false` for live data + required sign-in |
| `OPENAI_API_KEY` | For AI generation | Powers title/description/specifics/analysis generation |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `ALIEXPRESS_DATA_API_URL` / `ALIEXPRESS_DATA_API_KEY` | For live AliExpress imports | See "AliExpress data access" below |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` / `EBAY_RU_NAME` | For future "Publish to eBay" | eBay Developer Program credentials |

## Database Setup

1. Provision a PostgreSQL database and set `DATABASE_URL`.
2. Push the schema:

```bash
npm run db:generate
npm run db:push
```

3. (Optional) seed a demo user:

```bash
npm run db:seed
```

## AI (OpenAI) Setup

1. Create an API key at platform.openai.com.
2. Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`).
3. Without a key, every AI endpoint still responds — with a clearly-labeled Demo Mode fallback derived only from the product's verified source data (see `src/lib/ai/aiService.ts`).

## Demo Mode

Demo Mode is on by default (`DEMO_MODE=true` / the in-app toggle in **Settings → Preferences**). In this mode:

- **Any** product URL you paste into the importer returns realistic offline sample data (a cleaning-brush kit or a wrist watch, depending on the URL).
- AI generation endpoints return clearly-labeled, non-fabricated fallback content when `OPENAI_API_KEY` isn't set.
- Product Finder returns curated sample "winning product" opportunities.
- eBay publish actions return mock, clearly-labeled responses.

This lets you exercise the **entire** user flow — import → analyze → profit calculator → winning score → generate listing → edit → quality check → preview → save → export — without any external credentials.

## Development

```bash
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/dashboard`.

## Production Build

```bash
npm run build
npm run start
```

## Testing

```bash
npm run test
```

Covers: profit calculation formulas, winning-score weighting and insufficient-data handling, policy checker pattern matching, and provider normalization (never fabricating brand/model).

## eBay API Integration (future "Publish to eBay")

`src/lib/ebay/ebayService.ts` defines `getCategories`, `getCategorySpecifics`, `createInventoryItem`, `createOffer`, `publishOffer`, `updateInventoryItem`, `updateOffer`. Until `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` are set, every method returns a mock, clearly-labeled result (`mock: true`) instead of a fake successful publish. To go live:

1. Register an app in the eBay Developer Program and obtain OAuth credentials.
2. Set `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_RU_NAME`.
3. Implement the real HTTP calls inside each `EbayService` method (the method signatures and mock contract are already in place).

## AliExpress Data Access

AliExpress has no public product-detail API. `src/lib/providers/aliexpressProvider.ts` is a complete integration layer that expects a configured `ALIEXPRESS_DATA_API_URL` + `ALIEXPRESS_DATA_API_KEY` pointing at either:

1. A licensed commerce-data API partner you have a contract with, or
2. Your own compliant data pipeline that respects AliExpress's Terms of Service.

Without one configured, imports fall back to the `DemoProvider` (or fail clearly, if Demo Mode is off) rather than scraping or fabricating data.

## Troubleshooting

- **"No AliExpress data provider is configured"** — expected with Demo Mode off and no data provider set. Either turn Demo Mode back on or configure `ALIEXPRESS_DATA_API_URL`/`KEY`.
- **"AI generation failed. Your extracted product data is still saved."** — the OpenAI call failed or returned invalid JSON; your product record is untouched, retry the specific generation step.
- **"CREDENTIAL_ENCRYPTION_KEY is not set"** — required only if you use Settings → API to store per-account credentials; set a 32-byte base64 key.
- **Prisma errors on start** — run `npm run db:generate` after any `schema.prisma` change, and confirm `DATABASE_URL` is reachable.

## What Requires External Credentials

| Feature | Without credentials | With credentials |
|---|---|---|
| Product import | Offline sample data (Demo Mode) | Live AliExpress data via your configured provider |
| Title/description/specifics/analysis generation | Clearly-labeled non-fabricated fallback | Full AI generation via OpenAI |
| Publish to eBay | Mock response, clearly labeled | Real eBay Inventory/Offer API calls |

## Known Limitations (V1)

- Product Hunter automated discovery ships with one working demo provider; live AliExpress/eBay/trend discovery providers are architected (`ProductDiscoveryProvider`) but not implemented.
- eBay category taxonomy lookups are mocked until `EbayService` is wired to the real Taxonomy API.
- Built-in auth is intentionally minimal (no email verification, password reset, or OAuth) — swap in NextAuth/Clerk/etc. for a production-hardened flow; every read goes through `getCurrentUserId()`, so this is a contained change.
- Per-account encrypted API credentials are stored but not yet read by `aiService`/`ebayService`/`aliexpressProvider` — those currently read server env vars. Wiring per-user keys is a small, isolated change in those three files.

## Next Recommended Development Step

Implement `AliExpressDiscoveryProvider` (or a trend-data partner) against the existing `ProductDiscoveryProvider` interface — the `/research` UI, API route, and `ProductSearch`/`SavedProduct` models are already wired to accept it.
