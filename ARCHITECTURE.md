# Dorisbrao Real Estate architecture

Dorisbrao is a responsive Next.js App Router application focused on property discovery in Angola. The public browsing experience is immediately usable with typed Luanda seed data. Supabase Auth verifies account email and credentials; Prisma and PostgreSQL store application profiles and roles. Listing edits, saved homes, and inquiries still use browser storage.

## Application structure

```text
app/
  page.tsx                         Home, featured carousel, neighborhoods, testimonials
  search/page.tsx                  Search archive with URL-seeded filters
  listings/[slug]/page.tsx         Property detail route
  login/page.tsx                   Supabase email/password sign-in
  signup/page.tsx                  Supabase email verification and signup
  auth/callback/route.ts           Supabase email confirmation callback
  dashboard/page.tsx               Agent and administrator workspace
  api/                             Existing semantic search and AI route handlers
components/
  auth/AuthForm.tsx                Supabase authentication form
  dashboard/AgentDashboard.tsx     Listing CRUD and lead inbox
  home/FeaturedCarousel.tsx        Featured home carousel
  property/                        Cards, detail, gallery, tour modal, mortgage estimate
  search/                          Search bar and live client-side filters
  site/                            Shared navigation and footer
lib/
  data/types.ts                    Property, Agent, Lead, and demo session interfaces
  data/properties.ts               Interactive seed listings and agent profiles
  data/browser-store.ts            Browser-persisted demo state
  auth.ts                          Verified Supabase session and database profile lookup
  supabase/                         Browser and server Supabase clients
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

The app opens with eight example homes in Luanda neighborhoods. Search and filters update immediately. Listing pages include photo lightboxes and a principal-and-interest mortgage estimate. Tour and contact requests appear under **Dashboard → Inquiries**. Agent and administrator workspace edits remain local to the current browser.

## Data and authentication boundaries

- `lib/data/properties.ts` provides seed `Property` and `Agent` records. Browser storage overlays the property seed and stores saved homes and leads.
- Supabase Auth verifies email and password. New accounts receive the `CLIENT` role in Prisma; agent and admin access must be assigned in the database by an administrator. The dashboard's listing and lead data are still browser-local and are not production storage.
- Dashboard listing changes and leads are local to one browser and do not write to PostgreSQL. The existing Prisma schema and migrations describe the PostgreSQL data foundation; a production integration still needs server-side listing and lead CRUD endpoints.
- Semantic search and AI routes remain separate server features and use the configured database and AI provider. The home and archive currently use the local seed data so they work without credentials or a database connection.
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deployment environment, and allow `https://www.dorisbrao.ao/auth/callback` in the Supabase Auth redirect URL settings. Supabase middleware refreshes its HttpOnly cookie session; server routes verify the user and load the trusted role from Prisma.
- Existing `dorisbrao_session` tokens signed by the issuing service remain accepted for the API routes that already use them.
