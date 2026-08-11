import type { CostConfig } from "@/types";
import { calculateBreakdown } from "@/lib/cost-calc";
import { formatMoney, formatPercent } from "@/lib/format";

export function CostBreakdownDisplay({
  quote,
  config,
}: {
  quote: { fobCost: number; currency: string; minQuantity?: number | null };
  config: CostConfig;
}) {
  const breakdown = calculateBreakdown(quote.fobCost, quote.currency, config);
  const totalFob =
    quote.minQuantity && quote.minQuantity > 0 ? quote.fobCost * quote.minQuantity : null;

  const row = (label: string, value: number, pct?: number | null) => (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {formatMoney(value, quote.currency)}
        {pct != null && pct > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({formatPercent(pct)})
          </span>
        )}
      </span>
    </div>
  );

  return (
    <div className="rounded-xl border border-border/70 bg-secondary/50 p-4">
      <div className="space-y-1.5">
        <div className="flex justify-between pb-2 border-b border-border/60">
          <span className="font-medium">Detalle del cálculo</span>
          <span className="font-semibold tabular-nums text-primary">
            {formatMoney(breakdown.total, quote.currency)}
          </span>
        </div>
        {row("Costo FOB", breakdown.fobCost)}
        {totalFob != null &&
          row(`Total FOB (x${quote.minQuantity} unidades)`, totalFob)}
        {breakdown.nacionalizacionAmount > 0 &&
          row(
            "Nacionalización",
            breakdown.nacionalizacionAmount,
            config.nacionalizacionType === "PERCENT" ? config.nacionalizacionPct : null,
          )}
        {breakdown.comisionAmount > 0 &&
          row("Comisión", breakdown.comisionAmount, config.comisionType === "PERCENT" ? config.comisionPct : null)}
        {breakdown.costosFinancierosAmount > 0 &&
          row(
            "Costos financieros",
            breakdown.costosFinancierosAmount,
            config.costosFinancierosType === "PERCENT" ? config.costosFinancierosPct : null,
          )}
        {breakdown.envioAmount > 0 &&
          row("Envío", breakdown.envioAmount, config.envioType === "PERCENT" ? config.envio : null)}
        {breakdown.seguroAmount > 0 &&
          row("Seguro", breakdown.seguroAmount, config.seguroType === "PERCENT" ? config.seguro : null)}
        {breakdown.otrosGastosAmount > 0 &&
          row(
            "Otros gastos",
            breakdown.otrosGastosAmount,
            config.otrosGastosType === "PERCENT" ? config.otrosGastos : null,
          )}
      </div>
    </div>
  );
}
