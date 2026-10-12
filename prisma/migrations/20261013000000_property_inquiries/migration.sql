CREATE TYPE "InquiryType" AS ENUM ('TOUR', 'MESSAGE');

CREATE TABLE "property_inquiries" (
  "id" VARCHAR(30) NOT NULL,
  "listingId" VARCHAR(30),
  "propertyTitle" VARCHAR(180) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "phone" VARCHAR(40),
  "message" TEXT NOT NULL,
  "type" "InquiryType" NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "property_inquiries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "property_inquiries_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "property_inquiries_listingId_createdAt_idx"
  ON "property_inquiries" ("listingId", "createdAt" DESC);
CREATE INDEX "property_inquiries_createdAt_idx"
  ON "property_inquiries" ("createdAt" DESC);
