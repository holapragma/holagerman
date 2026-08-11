"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Box, Coins, TrendingUp, Package, Factory, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { ProductAnalysis } from "@/types";
import { formatMoney, formatPercent, formatDate } from "@/lib/format";
import { getProductAnalysis } from "@/app/actions/market";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AnalysisTabProps {
  productId: string;
}

export function AnalysisTab({ productId }: AnalysisTabProps) {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProductAnalysis(productId);
        if (cancelled) return;
        setAnalysis(data);
      } catch {
        toast.error("Error cargando el análisis");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-[16px] border border-border/70 bg-card p-5 animate-pulse">
            <div className="h-4 w-1/3 bg-secondary/50 rounded mb-3" />
            <div className="h-8 w-2/3 bg-secondary/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!analysis) return null;

  const { product, latestQuote, breakdown, profitability, marketStats } = analysis;
  const margin = profitability.margin;
  const nationalizedCost = profitability.nationalizedCost;

  const statCards = [
    {
      title: "Costo FOB (última cotización)",
      value: latestQuote ? formatMoney(latestQuote.fobCost, latestQuote.currency) : "—",
      icon: Box,
    },
    {
      title: "Costo nacionalizado",
      value: nationalizedCost != null && latestQuote ? formatMoney(nationalizedCost, latestQuote.currency) : "—",
      icon: Coins,
    },
    {
      title: "Margen estimado",
      value: margin != null ? formatPercent(margin) : "—",
      icon: TrendingUp,
    },
    {
      title: "Precio de venta",
      value: formatMoney(product.price),
      icon: Package,
    },
    {
      title: "Proveedores con cotización",
      value: analysis.latestQuotesPerSupplier.length.toString(),
      icon: Factory,
    },
    {
      title: "Relevamientos de mercado",
      value: marketStats.count.toString(),
      icon: ShoppingCart,
    },
  ];

  const breakdownItems = breakdown
    ? [
        { label: "Nacionalización", amount: breakdown.nacionalizacionAmount },
        { label: "Comisión", amount: breakdown.comisionAmount },
        { label: "Costos financieros", amount: breakdown.costosFinancierosAmount },
        { label: "Envío", amount: breakdown.envioAmount },
        { label: "Seguro", amount: breakdown.seguroAmount },
        { label: "Otros gastos", amount: breakdown.otrosGastosAmount },
      ].filter((i) => i.amount > 0)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((c) => (
          <StatCard key={c.title} title={c.title} value={c.value} icon={c.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost breakdown */}
        <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
          <h3 className="mb-4 text-base font-semibold tracking-tight">Detalle del costo</h3>
          {latestQuote && breakdown ? (
            <div className="space-y-1.5">
              <Row label="Costo FOB" value={formatMoney(breakdown.fobCost, breakdown.currency)} />
              {breakdownItems.map((item) => (
                <Row
                  key={item.label}
                  label={item.label}
                  value={formatMoney(item.amount, breakdown.currency)}
                />
              ))}
              <Separator className="my-2" />
              <Row
                label="Costo nacionalizado total"
                value={formatMoney(breakdown.total, breakdown.currency)}
                strong
              />
              <p className="pt-1 text-xs text-muted-foreground">
                {latestQuote.supplier.name} · {formatDate(latestQuote.date)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin cotizaciones registradas.</p>
          )}
        </div>

        {/* Suppliers */}
        <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
          <h3 className="mb-4 text-base font-semibold tracking-tight">
            Proveedores con cotización
          </h3>
          {analysis.latestQuotesPerSupplier.length > 0 ? (
            <ul className="space-y-3">
              {analysis.latestQuotesPerSupplier.map((q) => {
                const isBest =
                  q.currency === "ARS" &&
                  analysis.cheapestSupplierQuote?.id === q.id;
                return (
                  <li key={q.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-medium">
                        <span className="truncate">{q.supplier.name}</span>
                        {isBest ? (
                          <Badge variant="success" className="h-5 shrink-0 text-[10px]">
                            Mejor costo
                          </Badge>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(q.fobCost, q.currency)} FOB · {formatDate(q.date)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="h-7 shrink-0">
                      {formatMoney(q.fobCost, q.currency)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin proveedores registrados.</p>
          )}
        </div>
      </div>

      {/* Market summary */}
      <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
        <h3 className="mb-4 text-base font-semibold tracking-tight">Resumen de mercado</h3>
        {marketStats.count > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Mínimo" value={formatMoney(marketStats.min, "ARS")} />
            <MiniStat label="Máximo" value={formatMoney(marketStats.max, "ARS")} />
            <MiniStat label="Promedio" value={formatMoney(marketStats.avg, "ARS")} />
            <MiniStat
              label={marketStats.diffVsAvg >= 0 ? "Sobre mi precio" : "Bajo mi precio"}
              value={formatPercent(Math.abs((marketStats.diffVsAvg / (product.price || 1)) * 100))}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin relevamientos de mercado.</p>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="rounded-[16px] border border-border/70 bg-card p-5 shadow-(--shadow-card)">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={`tabular-nums ${strong ? "font-semibold text-primary" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}