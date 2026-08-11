import { prisma } from "@/lib/db";
import type { CostSettings, CostConfig } from "@/types";

export class CostSettingsRepository {
  async get(): Promise<CostSettings> {
    let settings = await prisma.costSettings.findUnique({
      where: { id: "global" },
    });
    if (!settings) {
      settings = await prisma.costSettings.create({
        data: { id: "global" },
      });
    }
    return settings;
  }

  async update(
    data: Partial<{
      nacionalizacionPct: number | null;
      comisionPct: number | null;
      costosFinancierosPct: number | null;
      envio: number | null;
      seguro: number | null;
      otrosGastos: number | null;
    }>,
  ): Promise<CostSettings> {
    return prisma.costSettings.upsert({
      where: { id: "global" },
      create: { id: "global", ...data },
      update: data,
    });
  }

  async toConfig(): Promise<CostConfig> {
    const settings = await this.get();
    return {
      nacionalizacionPct: settings.nacionalizacionPct ?? null,
      nacionalizacionType: "PERCENT",
      comisionPct: settings.comisionPct ?? null,
      comisionType: "PERCENT",
      costosFinancierosPct: settings.costosFinancierosPct ?? null,
      costosFinancierosType: "PERCENT",
      envio: settings.envio ?? null,
      envioType: "FIXED",
      seguro: settings.seguro ?? null,
      seguroType: "FIXED",
      otrosGastos: settings.otrosGastos ?? null,
      otrosGastosType: "FIXED",
    };
  }
}

export const costSettingsRepository = new CostSettingsRepository();