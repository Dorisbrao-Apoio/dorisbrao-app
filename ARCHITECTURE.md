# Dorisbrao Real Estate architecture

Dorisbrao is a responsive Next.js App Router application focused on property discovery in Angola. Supabase Auth verifies account email and credentials; Prisma and PostgreSQL store application profiles, listings, and inquiries. Saved homes remain browser-local.

## Application structure

```text
app/
  page.tsx                         Home, featured carousel, neighborhoods, testimonials
  search/page.tsx                  Search archive with URL-seeded filters
  listings/[slug]/page.tsx         Property detail route
  login/page.tsx                   Supabase email/password sign-in
  signup/page.tsx                  Supabase email verification and signup
  auth/callback/route.ts           Supabase email confirmation callback
  api/listings/                    Public listing reads and role-protected listing management
  api/inquiries/                   Public inquiry submission and role-protected inbox
  dashboard/page.tsx               Database-backed agent and administrator workspace
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
  data/browser-store.ts            Browser-persisted saved-home IDs
  listings.ts                      Prisma listing to website property mapping
  auth.ts                          Verified Supabase session and database profile lookup
  supabase/                         Browser and server Supabase clients
  search/semantic.ts               PostgreSQL/pgvector retrieval service
prisma/
  schema.prisma                    PostgreSQL users, listings, conversations, and metrics
  migrations/                      PostGIS and pgvector schema setup
  seed-properties.mjs              Idempotent seed data for the initial public collection
tests/
  auth.test.mjs                    JWT session verification coverage
  validation.test.mjs              Request and listing schema coverage
```

## Run locally

```bash
npm install
npm run dev
```

Listing search and detail pages read published records from PostgreSQL. Agent and administrator edits and visitor inquiries are stored in PostgreSQL and are visible across devices. The initial eight example listings can be inserted with `npm run db:seed:listings` after applying migrations.

## Data and authentication boundaries

- `lib/data/properties.ts` provides initial Luanda listings. Production builds run `prisma migrate deploy` and `npm run db:seed:listings`; seeding skips existing rows.
- Supabase Auth verifies email and password. New accounts receive the `CLIENT` role in Prisma; agent and admin access must be assigned in the database by an administrator. Saved homes remain local to each browser; listings and inquiries are shared database records.
- `GET /api/listings` returns published listings publicly and role-filtered records to agents/admins. Listing create, update, and delete endpoints require an authenticated agent/admin; agents can edit only assigned listings.
- `POST /api/inquiries` stores a visitor request against an active listing. The authenticated inquiry inbox is scoped to an agent's assigned listings; admins can see all inquiries.
- Semantic search and AI routes remain separate server features and use the configured database and AI provider. Public listing pages need the database migrations and initial seed data to be present.
- Existing listing and inquiry records previously stored in an individual browser's local storage cannot be recovered from the server. Seed the public collection once, then create new listings and inquiries through the database-backed application.
- Add `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deployment environment, and allow `https://www.dorisbrao.ao/auth/callback` in the Supabase Auth redirect URL settings. Supabase middleware refreshes its HttpOnly cookie session; server routes verify the user and load the trusted role from Prisma.
- Existing `dorisbrao_session` tokens signed by the issuing service remain accepted for the API routes that already use them.
