import { prisma } from "@/lib/db";
import type { Client } from "@/types";

export class ClientRepository {
  async findAll(search?: string): Promise<Client[]> {
    const query = search?.trim();

    return prisma.client.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { company: { contains: query } },
              { email: { contains: query } },
              { phone: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
    });
  }

  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { id } });
  }

  async create(data: Omit<Client, "id" | "createdAt" | "updatedAt">) {
    return prisma.client.create({ data });
  }

  async update(
    id: string,
    data: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>,
  ) {
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.client.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return prisma.client.count();
  }
}

export const clientRepository = new ClientRepository();
