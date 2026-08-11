import type { CostConfig, CostBreakdown, CostType, SupplierCostConfig } from "@/types";

function getAmount(base: number, value: number | null, type: CostType): number {
  if (value == null) return 0;
  return type === "PERCENT" ? base * (value / 100) : value;
}

export function mergeConfigs(
  globalConfig: CostConfig,
  supplierConfig: SupplierCostConfig | null,
): CostConfig {
  if (!supplierConfig) return globalConfig;

  return {
    nacionalizacionPct:
      supplierConfig.nacionalizacionPct ?? globalConfig.nacionalizacionPct,
    nacionalizacionType:
      supplierConfig.nacionalizacionPct != null
        ? (supplierConfig.nacionalizacionType as CostType)
        : globalConfig.nacionalizacionType,
    comisionPct: supplierConfig.comisionPct ?? globalConfig.comisionPct,
    comisionType:
      supplierConfig.comisionPct != null
        ? (supplierConfig.comisionType as CostType)
        : globalConfig.comisionType,
    costosFinancierosPct:
      supplierConfig.costosFinancierosPct ?? globalConfig.costosFinancierosPct,
    costosFinancierosType:
      supplierConfig.costosFinancierosPct != null
        ? (supplierConfig.costosFinancierosType as CostType)
        : globalConfig.costosFinancierosType,
    envio: supplierConfig.envio ?? globalConfig.envio,
    envioType:
      supplierConfig.envio != null
        ? (supplierConfig.envioType as CostType)
        : globalConfig.envioType,
    seguro: supplierConfig.seguro ?? globalConfig.seguro,
    seguroType:
      supplierConfig.seguro != null
        ? (supplierConfig.seguroType as CostType)
        : globalConfig.seguroType,
    otrosGastos: supplierConfig.otrosGastos ?? globalConfig.otrosGastos,
    otrosGastosType:
      supplierConfig.otrosGastos != null
        ? (supplierConfig.otrosGastosType as CostType)
        : globalConfig.otrosGastosType,
  };
}

export function calculateBreakdown(
  fobCost: number,
  currency: string,
  config: CostConfig,
): CostBreakdown {
  const nacionalizacionAmount = getAmount(
    fobCost,
    config.nacionalizacionPct,
    config.nacionalizacionType,
  );
  const comisionAmount = getAmount(fobCost, config.comisionPct, config.comisionType);
  const costosFinancierosAmount = getAmount(
    fobCost,
    config.costosFinancierosPct,
    config.costosFinancierosType,
  );
  const envioAmount = getAmount(fobCost, config.envio, config.envioType);
  const seguroAmount = getAmount(fobCost, config.seguro, config.seguroType);
  const otrosGastosAmount = getAmount(fobCost, config.otrosGastos, config.otrosGastosType);

  const total =
    fobCost +
    nacionalizacionAmount +
    comisionAmount +
    costosFinancierosAmount +
    envioAmount +
    seguroAmount +
    otrosGastosAmount;

  return {
    fobCost,
    currency,
    config,
    nacionalizacionAmount,
    comisionAmount,
    costosFinancierosAmount,
    envioAmount,
    seguroAmount,
    otrosGastosAmount,
    total,
  };
}
