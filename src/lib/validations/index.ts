import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const clientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  category: z.string().min(1, "La categoría es requerida"),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  stock: z.coerce.number().int().min(0, "El stock debe ser mayor o igual a 0"),
  photoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const quoteItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "Cantidad mínima: 1"),
  unitPrice: z.coerce.number().min(0, "Precio inválido"),
});

export const quoteSchema = z.object({
  clientId: z.string().min(1, "Seleccioná un cliente"),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "Agregá al menos un producto"),
  includeIva: z.boolean(),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;

export const competitionSchema = z.object({
  productId: z.string().min(1, "Seleccioná un producto"),
  competitorPrice: z.coerce
    .number()
    .min(0, "El precio debe ser mayor o igual a 0"),
  source: z.string().min(1, "La fuente es requerida"),
});

export type CompetitionFormValues = z.infer<typeof competitionSchema>;

const optionalPercent = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().min(0).max(100).optional(),
);

const optionalNumber = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().min(0).optional(),
);

const optionalCostValue = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().min(0).optional(),
);

export const costTypeSchema = z.enum(["FIXED", "PERCENT"]);

export const supplierSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  company: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().min(1, "Seleccioná una moneda"),
  contact: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  notes: z.string().optional(),
  nacionalizacionPct: optionalCostValue,
  nacionalizacionType: costTypeSchema.default("PERCENT"),
  comisionPct: optionalCostValue,
  comisionType: costTypeSchema.default("PERCENT"),
  costosFinancierosPct: optionalCostValue,
  costosFinancierosType: costTypeSchema.default("PERCENT"),
  envio: optionalCostValue,
  envioType: costTypeSchema.default("FIXED"),
  seguro: optionalCostValue,
  seguroType: costTypeSchema.default("FIXED"),
  otrosGastos: optionalCostValue,
  otrosGastosType: costTypeSchema.default("FIXED"),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const supplierQuoteSchema = z.object({
  supplierId: z.string().min(1, "Seleccioná un proveedor"),
  productId: z.string().min(1, "Seleccioná un producto"),
  supplierCode: z.string().optional(),
  fobCost: z.coerce.number().min(0, "El costo FOB debe ser mayor o igual a 0"),
  minQuantity: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(1, "La cantidad mínima debe ser mayor a 0").optional(),
  ),
  currency: z.string().min(1, "Seleccioná una moneda"),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export type SupplierQuoteFormValues = z.infer<typeof supplierQuoteSchema>;

export const marketObservationSchema = z.object({
  productId: z.string().min(1),
  source: z.string().min(1, "La fuente es requerida"),
  store: z.string().optional(),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  observedPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  currency: z.string().min(1, "Seleccioná una moneda"),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export type MarketObservationFormValues = z.infer<typeof marketObservationSchema>;

export const costSettingsSchema = z.object({
  nacionalizacionPct: optionalPercent,
  comisionPct: optionalPercent,
  costosFinancierosPct: optionalPercent,
  envio: optionalNumber,
  seguro: optionalNumber,
  otrosGastos: optionalNumber,
});

export type CostSettingsFormValues = z.infer<typeof costSettingsSchema>;

export const companySettingsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  quoteValidityDays: z.coerce.number().int().min(1, "Debe ser al menos 1 día"),
  conditions: z.string().optional(),
  ivaPct: z.coerce.number().min(0).max(100),
});

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

export const CURRENCIES = [
  "USD",
  "ARS",
  "EUR",
  "BRL",
  "UYU",
  "CLP",
  "COP",
  "MXN",
  "PYG",
] as const;

export type Currency = (typeof CURRENCIES)[number];
