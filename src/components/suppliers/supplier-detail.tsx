"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CostConfig, CostType, SupplierWithConfig, SupplierQuoteWithRelations } from "@/types";
import { formatMoney, formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { calculateBreakdown } from "@/lib/cost-calc";
import { deleteSupplierQuoteAction } from "@/app/actions/suppliers";
import { PageHeader } from "@/components/layout/page-header";
import { CostBreakdownDisplay } from "@/components/suppliers/cost-breakdown-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { QuoteForm } from "@/components/suppliers/quote-form";
import { SupplierForm } from "@/components/suppliers/supplier-form";

interface SupplierDetailProps {
  supplier: SupplierWithConfig;
  quotes: SupplierQuoteWithRelations[];
  effectiveConfig: CostConfig | null;
}

const EMPTY_CONFIG: CostConfig = {
  nacionalizacionPct: null,
  nacionalizacionType: "PERCENT",
  comisionPct: null,
  comisionType: "PERCENT",
  costosFinancierosPct: null,
  costosFinancierosType: "PERCENT",
  envio: null,
  envioType: "FIXED",
  seguro: null,
  seguroType: "FIXED",
  otrosGastos: null,
  otrosGastosType: "FIXED",
};

function formatCostValue(value: number, type: CostType, currency: string): string {
  return type === "PERCENT" ? formatPercent(value) : formatMoney(value, currency);
}

export function SupplierDetail({ supplier, quotes, effectiveConfig: effectiveConfigProp }: SupplierDetailProps) {
  const router = useRouter();
  const [editingSupplier, setEditingSupplier] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState<SupplierQuoteWithRelations | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteQuote = () => {
    if (!deletingQuote) return;
    startTransition(async () => {
      const result = await deleteSupplierQuoteAction(deletingQuote.id);
      if (result.success) {
        toast.success("Cotización eliminada");
        setDeletingQuote(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const effectiveConfig: CostConfig = effectiveConfigProp ?? EMPTY_CONFIG;
  const latestQuote = quotes[0];
  const selectedQuote = quotes.find((q) => q.id === selectedQuoteId) ?? latestQuote;

  return (
    <>
      <PageHeader
        title={supplier.name}
        description={
          supplier.company
            ? `${supplier.company} · ${supplier.country || "—"} · ${supplier.currency}`
            : `${supplier.country || "—"} · ${supplier.currency}`
        }
        action={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Dialog
              open={editingSupplier}
              onOpenChange={(open) => {
                setEditingSupplier(open);
                if (!open) router.refresh();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full rounded-full sm:w-auto">
                  <Pencil className="size-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-(--radius-card) sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar proveedor</DialogTitle>
                </DialogHeader>
                <SupplierForm
                  supplier={{
                    id: supplier.id,
                    name: supplier.name,
                    company: supplier.company ?? undefined,
                    country: supplier.country ?? undefined,
                    currency: supplier.currency,
                    contact: supplier.contact ?? undefined,
                    email: supplier.email ?? undefined,
                    phone: supplier.phone ?? undefined,
                    website: supplier.website ?? undefined,
                    notes: supplier.notes ?? undefined,
                    nacionalizacionPct: supplier.costConfig?.nacionalizacionPct ?? undefined,
                    nacionalizacionType: supplier.costConfig?.nacionalizacionType,
                    comisionPct: supplier.costConfig?.comisionPct ?? undefined,
                    comisionType: supplier.costConfig?.comisionType,
                    costosFinancierosPct: supplier.costConfig?.costosFinancierosPct ?? undefined,
                    costosFinancierosType: supplier.costConfig?.costosFinancierosType,
                    envio: supplier.costConfig?.envio ?? undefined,
                    envioType: supplier.costConfig?.envioType,
                    seguro: supplier.costConfig?.seguro ?? undefined,
                    seguroType: supplier.costConfig?.seguroType,
                    otrosGastos: supplier.costConfig?.otrosGastos ?? undefined,
                    otrosGastosType: supplier.costConfig?.otrosGastosType,
                  }}
                  onSuccess={() => {
                    setEditingSupplier(false);
                    router.refresh();
                  }}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-full sm:w-auto">
                  <Plus className="size-4" />
                  Nueva cotización
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-(--radius-card) sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registrar cotización</DialogTitle>
                </DialogHeader>
                <QuoteForm
                  supplierId={supplier.id}
                  config={effectiveConfig}
                  onSuccess={() => {
                    setQuoteDialogOpen(false);
                    router.refresh();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
            <h3 className="mb-4 text-base font-semibold tracking-tight">
              Información del proveedor
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="grid grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Contacto</dt>
                <dd className="truncate">{supplier.contact || "—"}</dd>
              </div>
              <div className="grid grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate">
                  {supplier.email ? (
                    <a
                      href={`mailto:${supplier.email}`}
                      className="text-primary hover:underline"
                    >
                      {supplier.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd className="truncate">
                  {supplier.phone ? (
                    <a
                      href={`tel:${supplier.phone.replace(/[^+\d]/g, "")}`}
                      className="text-primary hover:underline"
                    >
                      {supplier.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Sitio web</dt>
                <dd className="truncate">
                  {supplier.website ? (
                    <a
                      href={
                        /^https?:\/\//i.test(supplier.website)
                          ? supplier.website
                          : `https://${supplier.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {supplier.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
            {supplier.notes ? (
              <div className="mt-4 pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground">Observaciones</p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {supplier.notes}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
            <h3 className="mb-4 text-base font-semibold tracking-tight">
              Configuración de costos
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              {supplier.costConfig
                ? "Configuración propia (los valores vacíos usan la global)"
                : "Sin configuración propia — se usa la global"}
            </p>
            <dl className="grid gap-2 sm:grid-cols-2 text-sm">
              {(
                [
                  {
                    label: "Nacionalización",
                    value: supplier.costConfig?.nacionalizacionPct,
                    type: supplier.costConfig?.nacionalizacionType as CostType | undefined,
                    globalValue: effectiveConfig.nacionalizacionPct,
                    globalType: effectiveConfig.nacionalizacionType,
                  },
                  {
                    label: "Comisión",
                    value: supplier.costConfig?.comisionPct,
                    type: supplier.costConfig?.comisionType as CostType | undefined,
                    globalValue: effectiveConfig.comisionPct,
                    globalType: effectiveConfig.comisionType,
                  },
                  {
                    label: "Costos financieros",
                    value: supplier.costConfig?.costosFinancierosPct,
                    type: supplier.costConfig?.costosFinancierosType as CostType | undefined,
                    globalValue: effectiveConfig.costosFinancierosPct,
                    globalType: effectiveConfig.costosFinancierosType,
                  },
                  {
                    label: "Envío",
                    value: supplier.costConfig?.envio,
                    type: supplier.costConfig?.envioType as CostType | undefined,
                    globalValue: effectiveConfig.envio,
                    globalType: effectiveConfig.envioType,
                  },
                  {
                    label: "Seguro",
                    value: supplier.costConfig?.seguro,
                    type: supplier.costConfig?.seguroType as CostType | undefined,
                    globalValue: effectiveConfig.seguro,
                    globalType: effectiveConfig.seguroType,
                  },
                  {
                    label: "Otros gastos",
                    value: supplier.costConfig?.otrosGastos,
                    type: supplier.costConfig?.otrosGastosType as CostType | undefined,
                    globalValue: effectiveConfig.otrosGastos,
                    globalType: effectiveConfig.otrosGastosType,
                  },
                ] as const
              ).map((item) => (
                <div key={item.label}>
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-medium tabular-nums">
                    {item.value != null
                      ? formatCostValue(item.value, item.type ?? "FIXED", supplier.currency)
                      : `Global: ${formatCostValue(item.globalValue ?? 0, item.globalType, supplier.currency)}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          {selectedQuote ? (
            <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight">
                  {selectedQuote.id === latestQuote?.id ? "Última cotización" : "Cotización seleccionada"}
                </h3>
                <Badge variant="secondary" className="h-7">
                  {selectedQuote.currency}
                </Badge>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                {selectedQuote.product.name} · {formatDate(selectedQuote.date)}
              </p>
              <CostBreakdownDisplay
                quote={selectedQuote}
                config={effectiveConfig}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Código: {selectedQuote.supplierCode || "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cantidad mínima: {selectedQuote.minQuantity ?? "—"}
              </p>
            </div>
          ) : (
            <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card) text-center">
              <FileText className="mx-auto mb-3 size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Sin cotizaciones registradas</p>
            </div>
          )}

          <div className="@container rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)">
            <div className="border-b border-border/70 px-6 py-4">
              <h3 className="text-base font-semibold tracking-tight">
                Historial de cotizaciones
              </h3>
            </div>
            {quotes.length ? (
              <>
                <div className="hidden grid-cols-[1.6fr_1fr_1.2fr_1fr_1fr_40px] gap-4 border-b border-border/70 bg-secondary/40 px-6 py-3.5 @lg:grid">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Producto
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    FOB
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nacionalizado
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Fecha
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Código
                  </span>
                  <span />
                </div>

                <ul className="divide-y divide-border/60">
                  {quotes.map((quote) => {
                    const fob = quote.fobCost;
                    const total = calculateBreakdown(fob, quote.currency, effectiveConfig).total;
                    const isSelected = quote.id === selectedQuote?.id;
                    return (
                      <li key={quote.id} className="group">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedQuoteId(quote.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedQuoteId(quote.id);
                            }
                          }}
                          className={cn(
                            "grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 border-l-2 border-l-transparent px-4 py-4 transition-colors hover:bg-secondary/40 sm:px-6 @lg:grid-cols-[1.6fr_1fr_1.2fr_1fr_1fr_40px]",
                            isSelected && "border-l-primary bg-primary/5 hover:bg-primary/5",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{quote.product.name}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground @lg:hidden">
                              <span>{formatMoney(fob, quote.currency)} FOB</span>
                              <span>·</span>
                              <span>{formatDate(quote.date)}</span>
                            </p>
                          </div>

                          <div className="hidden @lg:block">
                            <span className="text-sm tabular-nums">
                              {formatMoney(fob, quote.currency)}
                            </span>
                          </div>
                          <div className="hidden @lg:block">
                            <span className="text-sm font-medium text-primary tabular-nums">
                              {formatMoney(total, quote.currency)}
                            </span>
                          </div>
                          <div className="hidden @lg:block">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(quote.date)}
                            </span>
                          </div>
                          <div className="hidden @lg:block">
                            <span className="text-sm text-muted-foreground">
                              {quote.supplierCode || "—"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-primary tabular-nums @lg:hidden">
                              {formatMoney(total, quote.currency)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 rounded-full @lg:opacity-0 @lg:transition-opacity @lg:group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingQuote(quote);
                              }}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No hay cotizaciones</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deletingQuote} onOpenChange={() => setDeletingQuote(null)}>
        <AlertDialogContent className="rounded-(--radius-card)">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la cotización de <strong>{deletingQuote?.product.name}</strong> por{" "}
              <strong>{deletingQuote ? formatMoney(deletingQuote.fobCost, deletingQuote.currency) : ""}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuote}
              disabled={isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}