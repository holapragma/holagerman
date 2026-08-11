import { prisma } from "@/lib/db";
import type { CompetitionEntryWithProduct } from "@/types";

export class CompetitionRepository {
  async findAll(): Promise<CompetitionEntryWithProduct[]> {
    return prisma.competitionEntry.findMany({
      include: { product: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findById(id: string): Promise<CompetitionEntryWithProduct | null> {
    return prisma.competitionEntry.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async create(data: {
    productId: string;
    competitorPrice: number;
    source: string;
  }) {
    return prisma.competitionEntry.create({
      data,
      include: { product: true },
    });
  }

  async update(
    id: string,
    data: Partial<{
      productId: string;
      competitorPrice: number;
      source: string;
    }>,
  ) {
    return prisma.competitionEntry.update({
      where: { id },
      data,
      include: { product: true },
    });
  }

  async delete(id: string) {
    return prisma.competitionEntry.delete({ where: { id } });
  }
}

export const competitionRepository = new CompetitionRepository();
