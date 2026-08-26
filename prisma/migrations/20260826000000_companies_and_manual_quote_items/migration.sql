-- Empresas emisoras + ítems manuales en presupuestos.
--
-- Esta migración es incremental y preserva los datos existentes:
--   1. Crea las tablas de empresas y logos.
--   2. Migra la empresa única de "german_crm_company_settings" a una fila de
--      "german_crm_companies" (queda como empresa por defecto).
--   3. Convierte los ítems de presupuesto en un snapshot (nombre propio,
--      descripción y orden), con el producto del catálogo pasando a ser opcional.
--   4. Recién después elimina de company_settings los campos que se mudaron.

-- CreateTable
CREATE TABLE "german_crm_company_logos" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "german_crm_company_logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxId" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "quoteValidityDays" INTEGER NOT NULL DEFAULT 30,
    "conditions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "logoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_companies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "german_crm_companies" ADD CONSTRAINT "german_crm_companies_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "german_crm_company_logos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "german_crm_quotes" ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyConditions" TEXT,
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "companyLegalName" TEXT,
ADD COLUMN     "companyLogoId" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "companyTaxId" TEXT,
ADD COLUMN     "companyValidityDays" INTEGER,
ADD COLUMN     "companyWebsite" TEXT;

-- AlterTable
ALTER TABLE "german_crm_quote_items" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- DropForeignKey
ALTER TABLE "german_crm_quote_items" DROP CONSTRAINT "german_crm_quote_items_productId_fkey";

-- AlterTable
ALTER TABLE "german_crm_quote_items" ALTER COLUMN "productId" DROP NOT NULL;

-- Backfill: el nombre mostrado del ítem pasa a ser un snapshot propio.
UPDATE "german_crm_quote_items" AS qi
SET "name" = p."name"
FROM "german_crm_products" AS p
WHERE qi."productId" = p."id" AND qi."name" IS NULL;

UPDATE "german_crm_quote_items" SET "name" = 'Ítem' WHERE "name" IS NULL;

ALTER TABLE "german_crm_quote_items" ALTER COLUMN "name" SET NOT NULL;

-- Migración de datos: la empresa global pasa a ser la primera empresa emisora.
INSERT INTO "german_crm_companies" (
    "id", "name", "address", "phone", "email", "website",
    "quoteValidityDays", "conditions", "active", "isDefault", "createdAt", "updatedAt"
)
SELECT
    'company_default',
    COALESCE(NULLIF(cs."name", ''), 'Mi empresa'),
    cs."address",
    cs."phone",
    cs."email",
    cs."website",
    COALESCE(cs."quoteValidityDays", 30),
    cs."conditions",
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "german_crm_company_settings" AS cs
WHERE cs."id" = 'global';

-- Los presupuestos ya emitidos quedan asociados a esa empresa, con su snapshot.
UPDATE "german_crm_quotes" AS q
SET "companyId"           = c."id",
    "companyName"         = c."name",
    "companyLegalName"    = c."legalName",
    "companyTaxId"        = c."taxId",
    "companyAddress"      = c."address",
    "companyPhone"        = c."phone",
    "companyEmail"        = c."email",
    "companyWebsite"      = c."website",
    "companyConditions"   = c."conditions",
    "companyValidityDays" = c."quoteValidityDays"
FROM "german_crm_companies" AS c
WHERE c."id" = 'company_default' AND q."companyId" IS NULL;

-- AlterTable: los datos de identidad ya viven en german_crm_companies.
ALTER TABLE "german_crm_company_settings" DROP COLUMN "address",
DROP COLUMN "conditions",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "quoteValidityDays",
DROP COLUMN "website";

-- CreateIndex
CREATE INDEX "german_crm_quotes_companyId_idx" ON "german_crm_quotes"("companyId");

-- CreateIndex
CREATE INDEX "german_crm_quote_items_quoteId_idx" ON "german_crm_quote_items"("quoteId");

-- AddForeignKey
ALTER TABLE "german_crm_quotes" ADD CONSTRAINT "german_crm_quotes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "german_crm_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_quotes" ADD CONSTRAINT "german_crm_quotes_companyLogoId_fkey" FOREIGN KEY ("companyLogoId") REFERENCES "german_crm_company_logos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_quote_items" ADD CONSTRAINT "german_crm_quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "german_crm_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
