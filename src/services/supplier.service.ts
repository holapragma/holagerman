import { supplierRepository } from "@/repositories/supplier.repository";
import { supplierQuoteRepository } from "@/repositories/supplier-quote.repository";
import { getGlobalConfig, mergeConfigs, calculateBreakdown } from "@/services/cost.service";
import type { SupplierFormValues } from "@/lib/validations";
import type {
  SupplierListItem,
  SupplierWithConfig,
  SupplierQuoteWithRelations,
  CostConfig,
  CostBreakdown,
  ComparatorRow,
} from "@/types";

export class SupplierService {
  async list(search?: string): Promise<SupplierListItem[]> {
    return supplierRepository.findAll(search);
  }

  async getById(id: string): Promise<SupplierWithConfig | null> {
    return supplierRepository.findById(id);
  }

  async create(data: SupplierFormValues): Promise<SupplierWithConfig> {
    return supplierRepository.create({
      name: data.name,
      company: data.company ?? null,
      country: data.country ?? null,
      currency: data.currency,
      contact: data.contact ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      notes: data.notes ?? null,
      nacionalizacionPct: data.nacionalizacionPct ?? null,
      nacionalizacionType: data.nacionalizacionType,
      comisionPct: data.comisionPct ?? null,
      comisionType: data.comisionType,
      costosFinancierosPct: data.costosFinancierosPct ?? null,
      costosFinancierosType: data.costosFinancierosType,
      envio: data.envio ?? null,
      envioType: data.envioType,
      seguro: data.seguro ?? null,
      seguroType: data.seguroType,
      otrosGastos: data.otrosGastos ?? null,
      otrosGastosType: data.otrosGastosType,
    });
  }

  async update(id: string, data: SupplierFormValues): Promise<SupplierWithConfig> {
    return supplierRepository.update(id, {
      name: data.name,
      company: data.company ?? null,
      country: data.country ?? null,
      currency: data.currency,
      contact: data.contact ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      notes: data.notes ?? null,
      nacionalizacionPct: data.nacionalizacionPct ?? null,
      nacionalizacionType: data.nacionalizacionType,
      comisionPct: data.comisionPct ?? null,
      comisionType: data.comisionType,
      costosFinancierosPct: data.costosFinancierosPct ?? null,
      costosFinancierosType: data.costosFinancierosType,
      envio: data.envio ?? null,
      envioType: data.envioType,
      seguro: data.seguro ?? null,
      seguroType: data.seguroType,
      otrosGastos: data.otrosGastos ?? null,
      otrosGastosType: data.otrosGastosType,
    });
  }

  async remove(id: string): Promise<void> {
    return supplierRepository.delete(id);
  }

  async registerQuote(
    data: {
      supplierId: string;
      productId: string;
      supplierCode?: string | null;
      fobCost: number;
      minQuantity?: number | null;
      currency: string;
      date?: string;
      notes?: string | null;
    },
  ): Promise<{ id: string }> {
    const quote = await supplierQuoteRepository.create({
      ...data,
      date: data.date ? new Date(`${data.date}T12:00:00`) : new Date(),
    });
    return { id: quote.id };
  }

  async removeQuote(id: string): Promise<void> {
    await supplierQuoteRepository.delete(id);
  }

  async count(): Promise<number> {
    return supplierRepository.count();
  }

  async getEffectiveConfig(supplier: SupplierWithConfig): Promise<CostConfig> {
    const global = await getGlobalConfig();
    return mergeConfigs(global, supplier.costConfig);
  }

  async calculateBreakdown(
    fobCost: number,
    currency: string,
    supplier: SupplierWithConfig,
  ): Promise<CostBreakdown> {
    const config = await this.getEffectiveConfig(supplier);
    return calculateBreakdown(fobCost, currency, config);
  }

  async getLatestQuotesByProduct(
    productId: string,
  ): Promise<SupplierQuoteWithRelations[]> {
    return supplierQuoteRepository.findAllByProduct(productId);
  }

  async getLatestQuotesBySupplier(
    supplierId: string,
  ): Promise<SupplierQuoteWithRelations[]> {
    return supplierQuoteRepository.findAllBySupplier(supplierId);
  }

  async getComparatorData(
    productId: string,
    salePrice: number,
  ): Promise<ComparatorRow[]> {
    const quotes = await this.getLatestQuotesByProduct(productId);
    const globalConfig = await getGlobalConfig();

    const bySupplier = new Map<string, SupplierQuoteWithRelations>();
    for (const q of quotes) {
      const existing = bySupplier.get(q.supplierId);
      if (!existing || q.date > existing.date || (q.date.getTime() === existing.date.getTime() && q.createdAt > existing.createdAt)) {
        bySupplier.set(q.supplierId, q);
      }
    }

    const rows: ComparatorRow[] = [];
    for (const quote of bySupplier.values()) {
      const effectiveConfig = mergeConfigs(globalConfig, quote.supplier.costConfig);
      const breakdown = calculateBreakdown(quote.fobCost, quote.currency, effectiveConfig);
      const margin =
        salePrice > 0 && quote.currency === "ARS"
          ? ((salePrice - breakdown.total) / salePrice) * 100
          : null;
      rows.push({
        supplier: quote.supplier,
        latestQuote: quote,
        breakdown,
        salePrice,
        margin,
      });
    }

    return rows;
  }
}

export const supplierService = new SupplierService();