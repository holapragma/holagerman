import type {
  Client,
  CompetitionEntry,
  Product,
  Quote,
  QuoteItem,
  Supplier,
  SupplierCostConfig,
  SupplierQuote,
  MarketObservation,
  CostSettings,
  CompanySettings,
} from "@/generated/prisma/client";

export type {
  Client,
  Product,
  Quote,
  QuoteItem,
  CompetitionEntry,
  Supplier,
  SupplierCostConfig,
  SupplierQuote,
  MarketObservation,
  CostSettings,
  CompanySettings,
};

export type QuoteWithRelations = Quote & {
  client: Client;
  items: (QuoteItem & { product: Product })[];
};

export type CompetitionEntryWithProduct = CompetitionEntry & {
  product: Product;
};

export type SupplierWithConfig = Supplier & {
  costConfig: SupplierCostConfig | null;
};

export type SupplierListItem = Supplier & {
  costConfig: SupplierCostConfig | null;
  _count: { quotes: number };
};

export type SupplierQuoteWithRelations = SupplierQuote & {
  supplier: SupplierWithConfig;
  product: Product;
};

export type MarketObservationWithProduct = MarketObservation & {
  product: Product;
};

export type DashboardStats = {
  clientsCount: number;
  productsCount: number;
  quotesCount: number;
  lowStockCount: number;
};

export type MonthCount = {
  label: string;
  value: number;
};

export type DashboardData = {
  stats: DashboardStats;
  recentQuotes: QuoteWithRelations[];
  lowStockProducts: Product[];
  recentClients: Client[];
  quotesByMonth: MonthCount[];
};

export type CreateQuoteItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type CreateQuoteInput = {
  clientId: string;
  notes?: string;
  items: CreateQuoteItemInput[];
  ivaPct: number | null;
};

export type CostType = "FIXED" | "PERCENT";

export type CostConfig = {
  nacionalizacionPct: number | null;
  nacionalizacionType: CostType;
  comisionPct: number | null;
  comisionType: CostType;
  costosFinancierosPct: number | null;
  costosFinancierosType: CostType;
  envio: number | null;
  envioType: CostType;
  seguro: number | null;
  seguroType: CostType;
  otrosGastos: number | null;
  otrosGastosType: CostType;
};

export type CompanySettingsConfig = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  quoteValidityDays: number;
  conditions: string;
  ivaPct: number;
};

export type CostBreakdown = {
  fobCost: number;
  currency: string;
  config: CostConfig;
  nacionalizacionAmount: number;
  comisionAmount: number;
  costosFinancierosAmount: number;
  envioAmount: number;
  seguroAmount: number;
  otrosGastosAmount: number;
  total: number;
};

export type ComparatorRow = {
  supplier: Supplier;
  latestQuote: SupplierQuoteWithRelations;
  breakdown: CostBreakdown;
  salePrice: number;
  margin: number | null;
};

export type MarketStats = {
  min: number;
  max: number;
  avg: number;
  count: number;
  lastUpdate: Date | null;
  diffVsMin: number;
  diffVsAvg: number;
  diffVsMax: number;
};

export type ProductAnalysis = {
  product: Product;
  latestQuote: SupplierQuoteWithRelations | null;
  breakdown: CostBreakdown | null;
  effectiveConfig: CostConfig | null;
  latestQuotesPerSupplier: SupplierQuoteWithRelations[];
  cheapestSupplierQuote: SupplierQuoteWithRelations | null;
  marketObservations: MarketObservationWithProduct[];
  marketStats: MarketStats;
  profitability: {
    salePrice: number;
    nationalizedCost: number | null;
    margin: number | null;
    diffVsMarketAvg: number | null;
  };
};
