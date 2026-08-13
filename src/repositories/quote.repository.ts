import { prisma } from "@/lib/db";
import type { CreateQuoteInput, QuoteWithRelations } from "@/types";

export class QuoteRepository {
  async findAll(): Promise<QuoteWithRelations[]> {
    return prisma.quote.findMany({
      include: {
        client: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<QuoteWithRelations | null> {
    return prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: { include: { product: true } },
      },
    });
  }

  async create(input: CreateQuoteInput): Promise<QuoteWithRelations> {
    const subtotal = input.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );
    const total = input.ivaPct
      ? subtotal * (1 + input.ivaPct / 100)
      : subtotal;

    return prisma.$transaction(async (tx) => {
      const lastQuote = await tx.quote.findFirst({
        orderBy: { number: "desc" },
      });

      return tx.quote.create({
        data: {
          number: (lastQuote?.number ?? 0) + 1,
          clientId: input.clientId,
          notes: input.notes || null,
          subtotal,
          ivaPct: input.ivaPct,
          total,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          client: true,
          items: { include: { product: true } },
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.quote.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return prisma.quote.count();
  }
}

export const quoteRepository = new QuoteRepository();
