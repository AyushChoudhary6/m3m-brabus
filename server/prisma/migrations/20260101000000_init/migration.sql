-- Initial schema for the leads table.
-- gen_random_uuid() is provided by pgcrypto, which is available by default on
-- Neon (PostgreSQL 13+). The extension line is a no-op if it is already present.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(160),
    "project" VARCHAR(160),
    "budget" VARCHAR(80),
    "message" TEXT,
    "source" VARCHAR(60) NOT NULL DEFAULT 'Website',
    "status" VARCHAR(40) NOT NULL DEFAULT 'Fresh Lead',
    "page" VARCHAR(255),
    "ip_address" VARCHAR(64),
    "utm_source" VARCHAR(120),
    "utm_medium" VARCHAR(120),
    "utm_campaign" VARCHAR(160),
    "referrer" VARCHAR(512),
    "device" VARCHAR(40),
    "spam_score" INTEGER,
    "fill_ms" INTEGER,
    "external_id" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_external_id_key" ON "leads"("external_id");
CREATE INDEX "leads_phone_idx" ON "leads"("phone");
CREATE INDEX "leads_email_idx" ON "leads"("email");
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");
