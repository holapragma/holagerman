"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Pencil, Plus, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CompetitionEntryWithProduct, Product } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { deleteCompetitionAction } from "@/app/actions/competition";
import { useDebouncedValue } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { PageHeader } from "@/components/layout/page-header";
import { CompetitionForm } from "@/components/competition/competition-form";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { Badge } from "@/components/ui/badge";
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

function PriceDiff({ myPrice, competitorPrice }: { myPrice: number; competitorPrice: number }) {
  const diff = myPrice - competitorPrice;
  const isHigher = diff > 0;
  const isEqual = diff === 0;

  return (
    <Badge variant={isHigher ? "destructive" : "success"} className="h-7">
      {isEqual ? "=" : isHigher ? "+" : "−"}
      {isEqual ? "" : " "}
      {formatCurrency(Math.abs(diff))}
    </Badge>
  );
}

export function CompetitionPageClient({
  entries,
  products,
}: {
  entries: CompetitionEntryWithProduct[];
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CompetitionEntryWithProduct | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<CompetitionEntryWithProduct | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEntries = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      (e) =>
        e.product.name.toLowerCase().includes(query) ||
        e.product.category.toLowerCase().includes(query) ||
        e.source.toLowerCase().includes(query),
    );
  }, [entries, debouncedSearch]);

  const handleDelete = () => {
    if (!deletingEntry) return;
    startTransition(async () => {
      const result = await deleteCompetitionAction(deletingEntry.id);
      if (result.success) {
        toast.success("Registro eliminado");
        setDeletingEntry(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setEditingEntry(null);
      }}
    >
      <PageHeader
        title="Competencia"
        description="Seguimiento manual de precios. Preparado para futura automatización."
        action={
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="size-4" />
              Nuevo registro
            </Button>
          </DialogTrigger>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Editar registro" : "Nuevo registro"}
          </DialogTitle>
        </DialogHeader>
        <CompetitionForm
          products={products}
          entry={editingEntry ?? undefined}
          onSuccess={() => {
            setDialogOpen(false);
            setEditingEntry(null);
          }}
        />
      </DialogContent>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por producto, categoría o fuente..."
        />
        <p className="text-sm text-muted-foreground">
          {filteredEntries.length} de {entries.length} registros
        </p>
      </div>

      {filteredEntries.length ? (
        <motion.div
          key={debouncedSearch}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <div className="hidden grid-cols-[1.5fr_0.9fr_1fr_0.9fr_1.1fr_1.2fr_48px] gap-4 border-b border-border/70 bg-secondary/40 px-6 py-3.5 lg:grid">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Producto
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mi precio
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Precio competencia
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Diferencia
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fuente
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actualización
            </span>
            <span />
          </div>

          <ul className="divide-y divide-border/60">
            {filteredEntries.map((entry) => (
              <li key={entry.id} className="group">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/40 sm:px-6 lg:grid-cols-[1.5fr_0.9fr_1fr_0.9fr_1.1fr_1.2fr_48px]">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">
                      {entry.product.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground lg:hidden">
                      {formatCurrency(entry.product.price)} vs{" "}
                      {formatCurrency(entry.competitorPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground lg:hidden">
                      {entry.source}
                    </p>
                  </div>

                  <div className="hidden lg:block">
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(entry.product.price)}
                    </span>
                  </div>

                  <div className="hidden lg:block">
                    <span className="text-sm tabular-nums">
                      {formatCurrency(entry.competitorPrice)}
                    </span>
                  </div>

                  <div className="hidden lg:block">
                    <PriceDiff
                      myPrice={entry.product.price}
                      competitorPrice={entry.competitorPrice}
                    />
                  </div>

                  <div className="hidden lg:block">
                    <Badge variant="secondary" className="h-7 max-w-[140px] truncate">
                      {entry.source}
                    </Badge>
                  </div>

                  <div className="hidden lg:block">
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(entry.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 lg:hidden">
                      <PriceDiff
                        myPrice={entry.product.price}
                        competitorPrice={entry.competitorPrice}
                      />
                    </div>
                    <RowActionsMenu
                      revealAt="lg"
                      actions={[
                        {
                          label: "Editar",
                          icon: Pencil,
                          onClick: () => {
                            setEditingEntry(entry);
                            setDialogOpen(true);
                          },
                        },
                        {
                          label: "Eliminar",
                          icon: Trash2,
                          variant: "destructive",
                          onClick: () => setDeletingEntry(entry),
                        },
                      ]}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : (
        <motion.div
          key={debouncedSearch}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <EmptyState
            icon={TrendingUp}
            title={search ? "Sin resultados" : "Sin seguimiento de competencia"}
            description={
              search
                ? `No se encontraron registros para “${debouncedSearch}”.`
                : "Cargá manualmente los precios de tus competidores. Próximamente se podrán automatizar."
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" />
                  Nuevo registro
                </Button>
              )
            }
          />
        </motion.div>
      )}

      <div className="mt-8 flex justify-center lg:hidden">
        <DialogTrigger asChild>
          <Button className="h-12 w-full rounded-full text-[15px]">
            <Plus className="size-5" />
            Nuevo registro
          </Button>
        </DialogTrigger>
      </div>

      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el seguimiento de{" "}
              <strong>{deletingEntry?.product.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}