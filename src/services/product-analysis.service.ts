import { productRepository } from "@/repositories/product.repository";
import { supplierService } from "@/services/supplier.service";
import { marketService } from "@/services/market.service";
import type {
  ProductAnalysis,
  SupplierQuoteWithRelations,
  CostBreakdown,
  CostConfig,
} from "@/types";

function getLatestQuotePerSupplier(
  quotes: SupplierQuoteWithRelations[],
): SupplierQuoteWithRelations[] {
  const bySupplier = new Map<string, SupplierQuoteWithRelations>();
  for (const q of quotes) {
    const existing = bySupplier.get(q.supplierId);
    if (
      !existing ||
      q.date > existing.date ||
      (q.date.getTime() === existing.date.getTime() &&
        q.createdAt > existing.createdAt)
    ) {
      bySupplier.set(q.supplierId, q);
    }
  }
  return Array.from(bySupplier.values());
}

function findCheapest(
  quotes: SupplierQuoteWithRelations[],
): SupplierQuoteWithRelations | null {
  if (quotes.length === 0) return null;
  let cheapest = quotes[0];
  let minTotal = Infinity;
  for (const q of quotes) {
    if (q.currency === "ARS" && q.fobCost < minTotal) {
      minTotal = q.fobCost;
      cheapest = q;
    }
  }
  return cheapest;
}

export class ProductAnalysisService {
  async getAnalysis(productId: string): Promise<ProductAnalysis | null> {
    const product = await productRepository.findById(productId);
    if (!product) return null;

    const [quotes, marketObservations, marketStats] = await Promise.all([
      supplierService.getLatestQuotesByProduct(productId),
      marketService.getObservations(productId),
      marketService.getStats(productId, product.price),
    ]);

    const latestQuote = quotes[0] ?? null;

    let breakdown: CostBreakdown | null = null;
    let effectiveConfig: CostConfig | null = null;
    if (latestQuote) {
      effectiveConfig = await supplierService.getEffectiveConfig(
        latestQuote.supplier,
      );
      breakdown = await supplierService.calculateBreakdown(
        latestQuote.fobCost,
        latestQuote.currency,
        latestQuote.supplier,
      );
    }

    const latestQuotesPerSupplier = getLatestQuotePerSupplier(quotes);
    const cheapestSupplierQuote = findCheapest(latestQuotesPerSupplier);

    const nationalizedCost = breakdown?.total ?? null;
    const margin =
      nationalizedCost != null && product.price > 0 && latestQuote?.currency === "ARS"
        ? ((product.price - nationalizedCost) / product.price) * 100
        : null;
    const diffVsMarketAvg =
      marketStats.count > 0 && marketStats.avg > 0
        ? product.price - marketStats.avg
        : null;

    return {
      product,
      latestQuote,
      breakdown,
      effectiveConfig,
      latestQuotesPerSupplier,
      cheapestSupplierQuote,
      marketObservations,
      marketStats,
      profitability: {
        salePrice: product.price,
        nationalizedCost,
        margin,
        diffVsMarketAvg,
      },
    };
  }
}

export const productAnalysisService = new ProductAnalysisService();