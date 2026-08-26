import { prisma } from "@/lib/db";
import type { Company, CompanyLogo, CompanyWithLogo } from "@/types";

export type CompanyWriteData = {
  name: string;
  legalName: string | null;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  quoteValidityDays: number;
  conditions: string | null;
  active: boolean;
};

export class CompanyRepository {
  async findAll(): Promise<CompanyWithLogo[]> {
    return prisma.company.findMany({
      include: { logo: { select: { id: true, mimeType: true, createdAt: true } } },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  }

  async findActive(): Promise<CompanyWithLogo[]> {
    return prisma.company.findMany({
      where: { active: true },
      include: { logo: { select: { id: true, mimeType: true, createdAt: true } } },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  }

  async findById(id: string): Promise<CompanyWithLogo | null> {
    return prisma.company.findUnique({
      where: { id },
      include: { logo: { select: { id: true, mimeType: true, createdAt: true } } },
    });
  }

  async create(data: CompanyWriteData): Promise<Company> {
    return prisma.$transaction(async (tx) => {
      const isFirst = (await tx.company.count()) === 0;
      return tx.company.create({ data: { ...data, isDefault: isFirst } });
    });
  }

  async update(id: string, data: Partial<CompanyWriteData>): Promise<Company> {
    return prisma.company.update({ where: { id }, data });
  }

  async setActive(id: string, active: boolean): Promise<Company> {
    return prisma.company.update({ where: { id }, data: { active } });
  }

  async setDefault(id: string): Promise<Company> {
    return prisma.$transaction(async (tx) => {
      await tx.company.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
      return tx.company.update({
        where: { id },
        data: { isDefault: true, active: true },
      });
    });
  }

  async count(): Promise<number> {
    return prisma.company.count();
  }

  /**
   * Los logos son inmutables: cambiar el logo de una empresa crea una fila nueva
   * y deja la anterior intacta, para que los presupuestos históricos sigan
   * mostrando el logo con el que fueron emitidos.
   */
  async attachLogo(
    companyId: string,
    logo: { mimeType: string; data: Uint8Array<ArrayBuffer> },
  ): Promise<Company> {
    return prisma.$transaction(async (tx) => {
      const created = await tx.companyLogo.create({
        data: { mimeType: logo.mimeType, data: logo.data },
      });
      return tx.company.update({
        where: { id: companyId },
        data: { logoId: created.id },
      });
    });
  }

  async detachLogo(companyId: string): Promise<Company> {
    return prisma.company.update({
      where: { id: companyId },
      data: { logoId: null },
    });
  }

  async findLogo(id: string): Promise<CompanyLogo | null> {
    return prisma.companyLogo.findUnique({ where: { id } });
  }
}

export const companyRepository = new CompanyRepository();
