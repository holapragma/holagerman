import { prisma } from "@/lib/db";
import type {
  SupplierQuote,
  SupplierQuoteWithRelations,
} from "@/types";

export class SupplierQuoteRepository {
  async create(data: {
    supplierId: string;
    productId: string;
    supplierCode?: string | null;
    fobCost: number;
    minQuantity?: number | null;
    currency: string;
    date: Date;
    notes?: string | null;
  }): Promise<SupplierQuote> {
    return prisma.supplierQuote.create({ data });
  }

  async findAllByProduct(
    productId: string,
  ): Promise<SupplierQuoteWithRelations[]> {
    return prisma.supplierQuote.findMany({
      where: { productId },
      include: {
        supplier: { include: { costConfig: true } },
        product: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  }

  async findAllBySupplier(
    supplierId: string,
  ): Promise<SupplierQuoteWithRelations[]> {
    return prisma.supplierQuote.findMany({
      where: { supplierId },
      include: { product: true, supplier: { include: { costConfig: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  }

  async delete(id: string): Promise<SupplierQuote> {
    return prisma.supplierQuote.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return prisma.supplierQuote.count();
  }
}

export const supplierQuoteRepository = new SupplierQuoteRepository();