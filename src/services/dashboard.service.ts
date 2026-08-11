import { clientRepository } from "@/repositories/client.repository";
import { productRepository } from "@/repositories/product.repository";
import { quoteRepository } from "@/repositories/quote.repository";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { DashboardData, MonthCount } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function buildQuotesByMonth(quotes: { createdAt: Date }[], months = 6): MonthCount[] {
  const now = new Date();

  return Array.from({ length: months }, (_, i) => {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - (months - 2 - i), 1);
    const count = quotes.filter((q) => {
      const d = q.createdAt;
      return d >= monthStart && d < monthEnd;
    }).length;

    return {
      label: format(monthStart, "MMM", { locale: es }),
      value: count,
    };
  });
}

export class DashboardService {
  async getData(): Promise<DashboardData> {
    const [
      clientsCount,
      productsCount,
      quotesCount,
      lowStockCount,
      quotes,
      products,
      clients,
    ] = await Promise.all([
      clientRepository.count(),
      productRepository.count(),
      quoteRepository.count(),
      productRepository.countLowStock(),
      quoteRepository.findAll(),
      productRepository.findAll(),
      clientRepository.findAll(),
    ]);

    return {
      stats: { clientsCount, productsCount, quotesCount, lowStockCount },
      recentQuotes: quotes.slice(0, 5),
      lowStockProducts: products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).slice(0, 5),
      recentClients: clients.slice(0, 5),
      quotesByMonth: buildQuotesByMonth(quotes),
    };
  }
}

export const dashboardService = new DashboardService();