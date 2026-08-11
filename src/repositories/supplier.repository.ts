import { prisma } from "@/lib/db";
import type {
  SupplierListItem,
  SupplierWithConfig,
} from "@/types";

export class SupplierRepository {
  async findAll(search?: string): Promise<SupplierListItem[]> {
    const query = search?.trim();

    return prisma.supplier.findMany({
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
      include: {
        costConfig: true,
        _count: { select: { quotes: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findById(id: string): Promise<SupplierWithConfig | null> {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        costConfig: true,
        quotes: {
          include: { product: true },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        },
      },
    });
  }

  async create(data: {
    name: string;
    company?: string | null;
    country?: string | null;
    currency: string;
    contact?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    notes?: string | null;
    nacionalizacionPct?: number | null;
    nacionalizacionType?: string;
    comisionPct?: number | null;
    comisionType?: string;
    costosFinancierosPct?: number | null;
    costosFinancierosType?: string;
    envio?: number | null;
    envioType?: string;
    seguro?: number | null;
    seguroType?: string;
    otrosGastos?: number | null;
    otrosGastosType?: string;
  }): Promise<SupplierWithConfig> {
    const {
      nacionalizacionPct,
      nacionalizacionType,
      comisionPct,
      comisionType,
      costosFinancierosPct,
      costosFinancierosType,
      envio,
      envioType,
      seguro,
      seguroType,
      otrosGastos,
      otrosGastosType,
      ...supplierData
    } = data;

    return prisma.supplier.create({
      data: {
        ...supplierData,
        costConfig: {
          create: {
            nacionalizacionPct,
            nacionalizacionType,
            comisionPct,
            comisionType,
            costosFinancierosPct,
            costosFinancierosType,
            envio,
            envioType,
            seguro,
            seguroType,
            otrosGastos,
            otrosGastosType,
          },
        },
      },
      include: { costConfig: true },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      company: string | null;
      country: string | null;
      currency: string;
      contact: string | null;
      email: string | null;
      phone: string | null;
      website: string | null;
      notes: string | null;
      nacionalizacionPct: number | null;
      nacionalizacionType: string;
      comisionPct: number | null;
      comisionType: string;
      costosFinancierosPct: number | null;
      costosFinancierosType: string;
      envio: number | null;
      envioType: string;
      seguro: number | null;
      seguroType: string;
      otrosGastos: number | null;
      otrosGastosType: string;
    }>,
  ): Promise<SupplierWithConfig> {
    const {
      nacionalizacionPct,
      nacionalizacionType,
      comisionPct,
      comisionType,
      costosFinancierosPct,
      costosFinancierosType,
      envio,
      envioType,
      seguro,
      seguroType,
      otrosGastos,
      otrosGastosType,
      ...supplierData
    } = data;

    return prisma.supplier.update({
      where: { id },
      data: {
        ...supplierData,
        costConfig: {
          upsert: {
            create: {
              nacionalizacionPct,
              nacionalizacionType,
              comisionPct,
              comisionType,
              costosFinancierosPct,
              costosFinancierosType,
              envio,
              envioType,
              seguro,
              seguroType,
              otrosGastos,
              otrosGastosType,
            },
            update: {
              nacionalizacionPct,
              nacionalizacionType,
              comisionPct,
              comisionType,
              costosFinancierosPct,
              costosFinancierosType,
              envio,
              envioType,
              seguro,
              seguroType,
              otrosGastos,
              otrosGastosType,
            },
          },
        },
      },
      include: { costConfig: true },
    });
  }

  async delete(id: string): Promise<void> {
    const quotesCount = await prisma.supplierQuote.count({
      where: { supplierId: id },
    });
    if (quotesCount > 0) {
      throw new Error(
        "No se puede eliminar el proveedor: tiene cotizaciones registradas.",
      );
    }
    await prisma.supplier.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return prisma.supplier.count();
  }
}

export const supplierRepository = new SupplierRepository();