"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText, TrendingUp, TrendingDown, Minus, Plus, Info } from "lucide-react";
import { toast } from "sonner";
import type { MarketObservationWithProduct, MarketStats } from "@/types";
import { formatMoney, formatDate, formatPercent } from "@/lib/format";
import { getMarketObservations, getMarketStats } from "@/app/actions/market";
import { MarketForm } from "@/components/products/market-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";

interface MarketTabProps {
  productId: string;
  productPrice: number;
}

export function MarketTab({ productId, productPrice }: MarketTabProps) {
  const [observations, setObservations] = useState<MarketObservationWithProduct[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loadingObs, setLoadingObs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      const [obs, st] = await Promise.all([
        getMarketObservations(productId),
        getMarketStats(productId, productPrice),
      ]);
      setObservations(obs);
      setStats(st);
    } catch {
      toast.error("Error cargando datos de mercado");
    } finally {
      setLoadingObs(false);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [obs, st] = await Promise.all([
          getMarketObservations(productId),
          getMarketStats(productId, productPrice),
        ]);
        if (cancelled) return;
        setObservations(obs);
        setStats(st);
      } catch {
        if (!cancelled) toast.error("Error cargando datos de mercado");
      } finally {
        if (!cancelled) {
          setLoadingObs(false);
          setLoadingStats(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, productPrice]);

  const handleSuccess = () => {
    setDialogOpen(false);
    setLoadingObs(true);
    setLoadingStats(true);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {!loadingStats && stats && stats.count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          <MetricCard
            title="Precio mínimo"
            value={formatMoney(stats.min, "ARS")}
            icon={TrendingDown}
            iconClass="text-destructive"
          />
          <MetricCard
            title="Precio máximo"
            value={formatMoney(stats.max, "ARS")}
            icon={TrendingUp}
            iconClass="text-success"
          />
          <MetricCard
            title="Precio promedio"
            value={formatMoney(stats.avg, "ARS")}
            icon={Minus}
            iconClass="text-primary"
          />
          <MetricCard
            title="Observaciones"
            value={stats.count.toString()}
            icon={FileText}
            iconClass="text-muted-foreground"
          />
          <MetricCard
            title="Última actualización"
            value={stats.lastUpdate ? formatDate(stats.lastUpdate) : "—"}
            icon={Info}
            iconClass="text-muted-foreground"
          />
          <MetricCard
            title={stats.diffVsAvg >= 0 ? "Sobre mi precio" : "Bajo mi precio"}
            value={formatPercent(Math.abs((stats.diffVsAvg / (productPrice || 1)) * 100))}
            icon={stats.diffVsAvg > 0 ? TrendingDown : stats.diffVsAvg < 0 ? TrendingUp : Minus}
            iconClass={stats.diffVsAvg > 0 ? "text-destructive" : stats.diffVsAvg < 0 ? "text-success" : "text-muted-foreground"}
          />
        </motion.div>
      )}

      {loadingStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-[16px] border border-border/70 bg-card p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-secondary/50 rounded mb-2" />
              <div className="h-8 w-1/2 bg-secondary/50 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loadingStats && stats && stats.count === 0 && (
        <EmptyState
          icon={FileText}
          title="Sin relevamientos"
          description="Registrá la primera observación de mercado para este producto."
          action={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="size-4 mr-2" />
                  Nueva observación
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-(--radius-card) sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registrar observación de mercado</DialogTitle>
                </DialogHeader>
                <MarketForm productId={productId} onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          }
        />
      )}

      {/* Observations list */}
      <div className="rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)">
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
          <h3 className="text-base font-semibold tracking-tight">Relevamientos de mercado</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" size="sm">
                <Plus className="size-4 mr-2" />
                Nueva observación
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-(--radius-card) sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar observación de mercado</DialogTitle>
              </DialogHeader>
              <MarketForm productId={productId} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        {loadingObs ? (
          <div className="px-6 py-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-1">
                <div className="h-4 w-1/4 bg-secondary/50 rounded" />
                <div className="h-3 w-1/2 bg-secondary/50 rounded" />
              </div>
            ))}
          </div>
        ) : observations.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {observations.map((obs) => (
              <li key={obs.id} className="px-6 py-4 hover:bg-secondary/40 transition-colors">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="h-6 shrink-0">
                      {obs.source}
                    </Badge>
                    <div>
                      <p className="font-medium">{formatMoney(obs.observedPrice, obs.currency)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(obs.date)} · {obs.currency}
                      </p>
                    </div>
                  </div>
                  {obs.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                      {obs.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Sin observaciones todavía</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClass: string;
}) {
  return (
    <div className="rounded-[16px] border border-border/70 bg-card p-4 shadow-(--shadow-card)">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Icon className={`size-5 ${iconClass}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-base font-semibold tabular-nums truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}