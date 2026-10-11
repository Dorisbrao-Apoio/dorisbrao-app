CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'AGENT', 'ADMIN');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING', 'RENTED', 'SOLD', 'ARCHIVED');
CREATE TYPE "ListingKind" AS ENUM ('RENT', 'SALE');
CREATE TYPE "ConversationRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

CREATE TABLE "users" (
  "id" VARCHAR(30) PRIMARY KEY,
  "email" VARCHAR(320) NOT NULL UNIQUE,
  "displayName" VARCHAR(120),
  "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL
);

CREATE TABLE "listings" (
  "id" VARCHAR(30) PRIMARY KEY,
  "agentId" VARCHAR(30),
  "slug" VARCHAR(180) NOT NULL UNIQUE,
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT NOT NULL,
  "rawMetadata" JSONB NOT NULL DEFAULT '{}',
  "kind" "ListingKind" NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "currency" CHAR(3) NOT NULL DEFAULT 'USD',
  "priceCents" BIGINT NOT NULL,
  "bedrooms" INTEGER NOT NULL,
  "bathrooms" DECIMAL(3,1) NOT NULL,
  "squareFeet" INTEGER,
  "neighborhood" VARCHAR(120) NOT NULL,
  "city" VARCHAR(120) NOT NULL,
  "region" VARCHAR(120) NOT NULL,
  "address" VARCHAR(255),
  "latitude" DECIMAL(9,6) NOT NULL,
  "longitude" DECIMAL(9,6) NOT NULL,
  "location" geography(Point,4326),
  "amenities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "embedding" vector(1536),
  "embeddingModel" VARCHAR(80),
  "embeddedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "listings_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE "conversations" (
  "id" VARCHAR(30) PRIMARY KEY,
  "userId" VARCHAR(30) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL
);

CREATE TABLE "conversation_messages" (
  "id" VARCHAR(30) PRIMARY KEY,
  "conversationId" VARCHAR(30) NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "role" "ConversationRole" NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "conversation_listings" (
  "conversationId" VARCHAR(30) NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "listingId" VARCHAR(30) NOT NULL REFERENCES "listings"("id") ON DELETE CASCADE,
  "rank" INTEGER NOT NULL,
  "similarity" DECIMAL(6,5) NOT NULL,
  PRIMARY KEY ("conversationId", "listingId")
);

CREATE TABLE "vector_metrics" (
  "id" VARCHAR(30) PRIMARY KEY,
  "listingId" VARCHAR(30) NOT NULL REFERENCES "listings"("id") ON DELETE CASCADE,
  "embeddingModel" VARCHAR(80) NOT NULL,
  "dimensions" INTEGER NOT NULL,
  "cosineSimilarity" DECIMAL(6,5) NOT NULL,
  "queryHash" CHAR(64) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "listings_status_kind_priceCents_idx" ON "listings" ("status", "kind", "priceCents");
CREATE INDEX "listings_region_neighborhood_idx" ON "listings" ("region", "neighborhood");
CREATE INDEX "listings_agentId_idx" ON "listings" ("agentId");
CREATE INDEX "listings_embedding_hnsw_idx" ON "listings" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX "listings_location_gist_idx" ON "listings" USING gist ("location");
CREATE INDEX "conversations_userId_updatedAt_idx" ON "conversations" ("userId", "updatedAt" DESC);
CREATE INDEX "conversation_messages_conversationId_createdAt_idx" ON "conversation_messages" ("conversationId", "createdAt");
CREATE INDEX "conversation_listings_listingId_idx" ON "conversation_listings" ("listingId");
CREATE INDEX "vector_metrics_listingId_createdAt_idx" ON "vector_metrics" ("listingId", "createdAt" DESC);
CREATE INDEX "vector_metrics_embeddingModel_createdAt_idx" ON "vector_metrics" ("embeddingModel", "createdAt" DESC);

CREATE FUNCTION listings_set_location() RETURNS trigger AS $$
BEGIN
  NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_set_location_before_write
  BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "listings"
  FOR EACH ROW EXECUTE FUNCTION listings_set_location();
