-- AlterTable
ALTER TABLE "german_crm_quotes" ADD COLUMN "ivaPct" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "german_crm_company_settings" ADD COLUMN "ivaPct" DOUBLE PRECISION NOT NULL DEFAULT 21;
