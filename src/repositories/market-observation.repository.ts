import { prisma } from "@/lib/db";
import type {
  MarketObservation,
  MarketObservationWithProduct,
} from "@/types";

export class MarketObservationRepository {
  async create(data: {
    productId: string;
    source: string;
    store?: string | null;
    url?: string | null;
    observedPrice: number;
    currency: string;
    date: Date;
    notes?: string | null;
  }): Promise<MarketObservation> {
    return prisma.marketObservation.create({ data });
  }

  async findAllByProduct(
    productId: string,
  ): Promise<MarketObservationWithProduct[]> {
    return prisma.marketObservation.findMany({
      where: { productId },
      include: { product: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  }

  async count(): Promise<number> {
    return prisma.marketObservation.count();
  }
}

export const marketObservationRepository = new MarketObservationRepository();