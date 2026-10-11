# Dorisbrao Real Estate architecture

Dorisbrao is a responsive Next.js App Router application focused on property discovery in Angola. The public browsing experience is immediately usable with typed Luanda seed data. Browser storage simulates account sessions, saved homes, listing edits, and incoming leads; Prisma and PostgreSQL remain the foundation for replacing that demo data layer with shared production data.

## Application structure

```text
app/
  page.tsx                         Home, featured carousel, neighborhoods, testimonials
  search/page.tsx                  Search archive with URL-seeded filters
  listings/[slug]/page.tsx         Property detail route
  login/page.tsx                   Demo sign-in
  signup/page.tsx                  Demo role selection and signup
  dashboard/page.tsx               Agent and administrator workspace
  api/                             Existing semantic search and AI route handlers
components/
  auth/AuthForm.tsx                Demo authentication form
  dashboard/AgentDashboard.tsx     Listing CRUD and lead inbox
  home/FeaturedCarousel.tsx        Featured home carousel
  property/                        Cards, detail, gallery, tour modal, mortgage estimate
  search/                          Search bar and live client-side filters
  site/                            Shared navigation and footer
lib/
  data/types.ts                    Property, Agent, Lead, and demo session interfaces
  data/properties.ts               Interactive seed listings and agent profiles
  data/browser-store.ts            Browser-persisted demo state
  auth.ts                          Signed session validation for existing API routes
  search/semantic.ts               PostgreSQL/pgvector retrieval service
prisma/
  schema.prisma                    PostgreSQL users, listings, conversations, and metrics
  migrations/                      PostGIS and pgvector schema setup
tests/
  auth.test.mjs                    JWT session verification coverage
  validation.test.mjs              Request and listing schema coverage
```

## Run locally

```bash
npm install
npm run dev
```

The app opens with eight example homes in Luanda neighborhoods. Search and filters update immediately. Listing pages include photo lightboxes and a principal-and-interest mortgage estimate. Tour and contact requests appear under **Dashboard → Inquiries**. Agent and administrator demo workspaces can add, edit, publish, unpublish, and remove listings. Changes persist in the current browser using `localStorage`.

## Data and authentication boundaries

- `lib/data/properties.ts` provides seed `Property` and `Agent` records. Browser storage overlays the property seed and stores saved homes and leads.
- The login and signup screens are a UI demonstration. A visitor can select a demo role; credentials are not verified, and browser storage is not an authentication system. Connect a trusted identity provider and server-side role checks before handling real accounts or personal data.
- Dashboard listing changes and leads are local to one browser and do not write to PostgreSQL. The existing Prisma schema and migrations describe the PostgreSQL data foundation; a production integration still needs server-side listing and lead CRUD endpoints.
- Semantic search and AI routes remain separate server features and use the configured database and AI provider. The home and archive currently use the local seed data so they work without credentials or a database connection.
- The existing session JWT verifier protects the concierge and description APIs. It expects an HttpOnly `dorisbrao_session` JWT with issuer `dorisbrao`, audience `dorisbrao-web`, and an `AUTH_SESSION_SECRET` shared with the issuing service.
