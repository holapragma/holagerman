[2mLoaded Prisma config from prisma.config.ts.
[22m
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "german_crm_clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_quotes" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "clientId" TEXT NOT NULL,
    "notes" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "german_crm_quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_competition_entries" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "competitorPrice" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "german_crm_competition_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "country" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_supplier_cost_configs" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "nacionalizacionPct" DOUBLE PRECISION,
    "nacionalizacionType" TEXT NOT NULL DEFAULT 'PERCENT',
    "comisionPct" DOUBLE PRECISION,
    "comisionType" TEXT NOT NULL DEFAULT 'PERCENT',
    "costosFinancierosPct" DOUBLE PRECISION,
    "costosFinancierosType" TEXT NOT NULL DEFAULT 'PERCENT',
    "envio" DOUBLE PRECISION,
    "envioType" TEXT NOT NULL DEFAULT 'FIXED',
    "seguro" DOUBLE PRECISION,
    "seguroType" TEXT NOT NULL DEFAULT 'FIXED',
    "otrosGastos" DOUBLE PRECISION,
    "otrosGastosType" TEXT NOT NULL DEFAULT 'FIXED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_supplier_cost_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_supplier_quotes" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierCode" TEXT,
    "fobCost" DOUBLE PRECISION NOT NULL,
    "minQuantity" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_supplier_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_market_observations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "store" TEXT,
    "url" TEXT,
    "observedPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_market_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_cost_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "nacionalizacionPct" DOUBLE PRECISION,
    "comisionPct" DOUBLE PRECISION,
    "costosFinancierosPct" DOUBLE PRECISION,
    "envio" DOUBLE PRECISION,
    "seguro" DOUBLE PRECISION,
    "otrosGastos" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_cost_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "german_crm_company_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "name" TEXT NOT NULL DEFAULT 'German CRM',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "quoteValidityDays" INTEGER NOT NULL DEFAULT 30,
    "conditions" TEXT DEFAULT 'Validez del presupuesto: 30 días desde la fecha de emisión
Forma de pago: a convenir (transferencia, cheque, efectivo)
Tiempo de entrega: a confirmar según disponibilidad de stock
Garantía: según términos del fabricante
Disponibilidad sujeta a stock al momento de la confirmación',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "german_crm_company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "german_crm_quotes_number_key" ON "german_crm_quotes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "german_crm_supplier_cost_configs_supplierId_key" ON "german_crm_supplier_cost_configs"("supplierId");

-- CreateIndex
CREATE INDEX "german_crm_supplier_quotes_productId_idx" ON "german_crm_supplier_quotes"("productId");

-- CreateIndex
CREATE INDEX "german_crm_market_observations_productId_idx" ON "german_crm_market_observations"("productId");

-- AddForeignKey
ALTER TABLE "german_crm_quotes" ADD CONSTRAINT "german_crm_quotes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "german_crm_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_quote_items" ADD CONSTRAINT "german_crm_quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "german_crm_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_quote_items" ADD CONSTRAINT "german_crm_quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "german_crm_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_competition_entries" ADD CONSTRAINT "german_crm_competition_entries_productId_fkey" FOREIGN KEY ("productId") REFERENCES "german_crm_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_supplier_cost_configs" ADD CONSTRAINT "german_crm_supplier_cost_configs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "german_crm_suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_supplier_quotes" ADD CONSTRAINT "german_crm_supplier_quotes_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "german_crm_suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_supplier_quotes" ADD CONSTRAINT "german_crm_supplier_quotes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "german_crm_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "german_crm_market_observations" ADD CONSTRAINT "german_crm_market_observations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "german_crm_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

