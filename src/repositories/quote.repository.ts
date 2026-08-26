import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateQuoteInput, QuoteWithRelations } from "@/types";

const quoteInclude = {
  client: true,
  company: true,
  items: {
    include: { product: true },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.QuoteInclude;

export class QuoteRepository {
  async findAll(): Promise<QuoteWithRelations[]> {
    return prisma.quote.findMany({
      include: quoteInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<QuoteWithRelations | null> {
    return prisma.quote.findUnique({
      where: { id },
      include: quoteInclude,
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

    const snapshot = input.companySnapshot;

    return prisma.$transaction(async (tx) => {
      const lastQuote = await tx.quote.findFirst({
        orderBy: { number: "desc" },
      });

      // Los ítems manuales marcados como "guardar en catálogo" crean su producto
      // dentro de la misma transacción, para que no queden productos huérfanos
      // si el presupuesto falla.
      const items = await Promise.all(
        input.items.map(async (item) => {
          let productId = item.productId ?? null;

          if (!productId && item.createProduct) {
            const product = await tx.product.create({
              data: {
                name: item.createProduct.name,
                category: item.createProduct.category,
                price: item.createProduct.price,
                stock: 0,
              },
            });
            productId = product.id;
          }

          return { ...item, productId };
        }),
      );

      return tx.quote.create({
        data: {
          number: (lastQuote?.number ?? 0) + 1,
          clientId: input.clientId,
          notes: input.notes || null,
          subtotal,
          ivaPct: input.ivaPct,
          total,
          companyId: input.companyId,
          companyName: snapshot?.name ?? null,
          companyLegalName: snapshot?.legalName ?? null,
          companyTaxId: snapshot?.taxId ?? null,
          companyAddress: snapshot?.address ?? null,
          companyPhone: snapshot?.phone ?? null,
          companyEmail: snapshot?.email ?? null,
          companyWebsite: snapshot?.website ?? null,
          companyConditions: snapshot?.conditions ?? null,
          companyValidityDays: snapshot?.quoteValidityDays ?? null,
          companyLogoId: snapshot?.logoId ?? null,
          items: {
            create: items.map((item, index) => ({
              productId: item.productId,
              name: item.name,
              description: item.description,
              position: index,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            })),
          },
        },
        include: quoteInclude,
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
