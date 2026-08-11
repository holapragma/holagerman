import { prisma } from "@/lib/db";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { Product } from "@/types";

export class ProductRepository {
  async findAll(search?: string): Promise<Product[]> {
    const query = search?.trim();

    return prisma.product.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { category: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async create(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    return prisma.product.create({ data });
  }

  async update(
    id: string,
    data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
  ) {
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return prisma.product.count();
  }

  async countLowStock(): Promise<number> {
    return prisma.product.count({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
    });
  }
}

export const productRepository = new ProductRepository();
