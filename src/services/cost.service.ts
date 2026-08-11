import { costSettingsRepository } from "@/repositories/cost-settings.repository";
import type { CostConfig } from "@/types";

export { mergeConfigs, calculateBreakdown } from "@/lib/cost-calc";

export async function getGlobalConfig(): Promise<CostConfig> {
  return costSettingsRepository.toConfig();
}