import { prisma } from "@/lib/db";
import type { CompanySettings, CompanySettingsConfig } from "@/types";

export class CompanySettingsRepository {
  async get(): Promise<CompanySettings> {
    let settings = await prisma.companySettings.findUnique({
      where: { id: "global" },
    });
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: { id: "global" },
      });
    }
    return settings;
  }

  async update(
    data: Partial<CompanySettingsConfig>,
  ): Promise<CompanySettings> {
    return prisma.companySettings.upsert({
      where: { id: "global" },
      create: { id: "global", ...data },
      update: data,
    });
  }

  async toConfig(): Promise<CompanySettingsConfig> {
    const settings = await this.get();
    return {
      name: settings.name,
      email: settings.email ?? null,
      phone: settings.phone ?? null,
      address: settings.address ?? null,
      website: settings.website ?? null,
      quoteValidityDays: settings.quoteValidityDays,
      conditions: settings.conditions ?? "",
    };
  }
}

export const companySettingsRepository = new CompanySettingsRepository();
