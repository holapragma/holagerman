"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText, TrendingUp } from "lucide-react";
import type { ComparatorRow } from "@/types";
import { formatMoney, formatPercent, formatDate } from "@/lib/format";
import { getComparatorData } from "@/app/actions/suppliers";
import { getProducts } from "@/app/actions/products";
import { PageHeader } from "@/components/layout/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

import { SupplierTabs } from "@/components/suppliers/supplier-tabs";

export function SupplierComparatorClient() {
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [rows, setRows] = useState<ComparatorRow[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Load products on mount and auto-select the first one
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getProducts();
      if (cancelled) return;
      const mapped = data.map((p) => ({ id: p.id, name: p.name, price: p.price }));
      setProducts(mapped);
      if (mapped.length > 0) setSelectedProductId(mapped[0].id);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load comparator data whenever the selected product changes
  useEffect(() => {
    if (!selectedProductId) return;
    let cancelled = false;
    (async () => {
      const data = await getComparatorData(
        selectedProductId,
        products.find((p) => p.id === selectedProductId)?.price ?? 0,
      );
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [selectedProductId, products]);

  const minCost = rows.length > 0 ? Math.min(...rows.map((r) => r.breakdown.total)) : 0;
  const margins = rows.map((r) => r.margin).filter((m): m is number => m != null);
  const maxMargin = margins.length > 0 ? Math.max(...margins) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comparador de proveedores"
        description="Seleccioná un producto para comparar costos y márgenes entre proveedores."
      />

      <SupplierTabs />

      <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Select
            value={selectedProductId}
            onValueChange={(v) => {
              setSelectedProductId(v);
              setRows([]);
              setLoading(true);
            }}
          >
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder="Seleccionar un producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            Precio de venta:{" "}
            <span className="font-medium tabular-nums">
              {selectedProduct ? formatMoney(selectedProduct.price) : "—"}
            </span>
          </div>
        </div>
      </div>

      {selectedProductId && !loading && rows.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <EmptyState
            icon={FileText}
            title="Sin cotizaciones"
            description="Este producto no tiene cotizaciones registradas de ningún proveedor."
          />
        </motion.div>
      )}

      {rows.length > 0 && (
        <motion.div
          key={selectedProductId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <div className="hidden grid-cols-[1.6fr_1fr_1.2fr_1.2fr_1fr_1fr] gap-4 border-b border-border/70 bg-secondary/40 px-6 py-3.5 lg:grid">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Proveedor
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Costo FOB
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Costo nacionalizado
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Precio venta
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Margen
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actualización
            </span>
          </div>

          <ul className="divide-y divide-border/60">
            {rows.map((row) => {
              const isBestCost = minCost > 0 && row.breakdown.total === minCost;
              const isBestMargin =
                row.margin != null && row.margin > 0 && row.margin === maxMargin;
              return (
                <li key={row.supplier.id} className="group">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/40 sm:px-6 lg:grid-cols-[1.6fr_1fr_1.2fr_1.2fr_1fr_1fr]">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <TrendingUp className="size-5" strokeWidth={1.75} />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <p className="flex items-center gap-2 truncate text-[15px] font-medium">
                          <span className="truncate">{row.supplier.name}</span>
                          {isBestCost ? (
                            <Badge variant="success" className="h-5 shrink-0 text-[10px]">
                              Mejor costo
                            </Badge>
                          ) : null}
                          {isBestMargin ? (
                            <Badge variant="success" className="h-5 shrink-0 text-[10px]">
                              Mejor margen
                            </Badge>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.supplier.company || row.supplier.country || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      <span className="text-sm font-medium tabular-nums">
                        {formatMoney(row.latestQuote.fobCost, row.latestQuote.currency)}
                      </span>
                    </div>

                    <div className="hidden lg:block">
                      <span className="text-sm font-medium text-primary tabular-nums">
                        {formatMoney(row.breakdown.total, row.latestQuote.currency)}
                      </span>
                    </div>

                    <div className="hidden lg:block">
                      <span className="text-sm tabular-nums">
                        {formatMoney(row.salePrice)}
                      </span>
                    </div>

                    <div className="hidden lg:block">
                      {row.margin != null ? (
                        <Badge
                          variant={row.margin >= 30 ? "success" : row.margin >= 15 ? "secondary" : "destructive"}
                          className="h-7"
                        >
                          {formatPercent(row.margin)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </div>

                    <div className="hidden lg:block">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(row.latestQuote.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                      <Badge variant="secondary" className="h-7">
                        {row.latestQuote.currency}
                      </Badge>
                      <span className="text-sm font-medium text-primary tabular-nums">
                        {formatMoney(row.breakdown.total, row.latestQuote.currency)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </div>
  );
}