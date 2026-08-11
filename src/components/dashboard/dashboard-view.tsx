"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  FileText,
  Package,
  PackageX,
  Users,
} from "lucide-react";
import type { DashboardData } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { MetricCard } from "@/components/shared/metric-card";
import { ChartCard } from "@/components/shared/chart-card";
import { AreaChart } from "@/components/shared/area-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardView({ data }: { data: DashboardData }) {
  const { stats, recentQuotes, lowStockProducts, recentClients, quotesByMonth } =
    data;

  const metrics = [
    {
      title: "Clientes",
      value: stats.clientsCount,
      icon: Users,
      description: "Contactos registrados",
      delay: 0,
    },
    {
      title: "Productos",
      value: stats.productsCount,
      icon: Package,
      description: "En el catálogo activo",
      delay: 0.05,
    },
    {
      title: "Presupuestos",
      value: stats.quotesCount,
      icon: FileText,
      description: "Generados en total",
      delay: 0.1,
    },
    {
      title: "Stock bajo",
      value: stats.lowStockCount,
      icon: Package,
      description: "Productos por reponer",
      delay: 0.15,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen general de tu actividad comercial."
        action={
          <Button className="rounded-full">
            <Link href="/presupuestos/nuevo">Nuevo presupuesto</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:gap-6 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard
            key={m.title}
            title={m.title}
            value={m.value}
            icon={m.icon}
            description={m.description}
            delay={m.delay}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2"
        >
          <ChartCard
            title="Presupuestos por mes"
            description="Evolución de los últimos 6 meses"
            action={
              <Link
                href="/presupuestos"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
              >
                Ver todos
                <ArrowRight className="size-3.5" />
              </Link>
            }
          >
            <AreaChart data={quotesByMonth} height={200} />
          </ChartCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChartCard
            title="Stock bajo"
            description="Productos por reponer"
            className="h-full"
            contentClassName="flex flex-1 flex-col"
            action={
              <Link href="/productos">
                <Button variant="ghost" size="icon-sm" className="rounded-full">
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            }
          >
            {lowStockProducts.length ? (
              <div className="flex-1 space-y-1">
                {lowStockProducts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary/60"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                      <PackageX className="size-4 text-destructive" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {p.category}
                      </span>
                    </span>
                    <Badge variant={i === 0 ? "destructive" : "warning"}>
                      {p.stock} uds
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="Todo en orden"
                description="No hay productos con stock bajo."
              />
            )}
          </ChartCard>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChartCard
            title="Presupuestos recientes"
            description="Últimos emitidos"
            className="h-full"
            contentClassName="flex flex-1 flex-col"
            action={
              <Link href="/presupuestos">
                <Button variant="ghost" size="icon-sm" className="rounded-full">
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            }
          >
            {recentQuotes.length ? (
              <div className="flex-1 space-y-1">
                {recentQuotes.map((q) => (
                  <Link
                    key={q.id}
                    href={`/presupuestos/${q.id}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary/60"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground">
                      {q.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {q.client.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(q.createdAt)}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(q.total)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="Sin presupuestos"
                description="Creá tu primer presupuesto comercial."
              />
            )}
          </ChartCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChartCard
            title="Clientes recientes"
            description="Actividad de la cartera"
            className="h-full"
            contentClassName="flex flex-1 flex-col"
            action={
              <Link href="/clientes">
                <Button variant="ghost" size="icon-sm" className="rounded-full">
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            }
          >
            {recentClients.length ? (
              <div className="flex-1 space-y-1">
                {recentClients.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                  >
                    <Avatar name={c.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {c.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {c.company ?? c.email ?? "Cliente individual"}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Sin clientes"
                description="Registrá tu primer cliente."
              />
            )}
          </ChartCard>
        </motion.div>
      </div>
    </>
  );
}