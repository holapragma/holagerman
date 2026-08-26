import type { QuoteWithRelations } from "@/types";
import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";

export type Component = {
  render(ctx: LayoutContext): Promise<number>;
  /** Alto aproximado, para decidir saltos de página antes de dibujar. */
  estimateHeight?(ctx: LayoutContext): number;
};

export interface LayoutContext {
  page: PDFPage;
  pdfDoc: PDFDocument;
  width: number;
  height: number;
  margin: number;
  contentWidth: number;
  y: number;
  pageNumber: number;
  totalPages: number;
  colors: Colors;
  fonts: Fonts;
  quote: QuoteWithRelations;
}

export interface Colors {
  primary: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  background: string;
  surface: string;
  border: string;
  borderLight: string;
  accent: string;
  accentForeground: string;
  surfaceHover: string;
  warning: string;
  warningBackground: string;
  warningBorder: string;
}

export interface Fonts {
  regular: PDFFont;
  medium: PDFFont;
  bold: PDFFont;
}

export interface ProductRow {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SummaryData {
  subtotal: number;
  discount: number;
  total: number;
}

export interface CompanyLogoData {
  mimeType: string;
  data: Uint8Array;
}

export interface CompanyInfo {
  name: string;
  legalName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  quoteValidityDays: number;
  logo?: CompanyLogoData | null;
}