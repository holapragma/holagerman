"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Download, Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { QuoteWithRelations } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteQuoteAction } from "@/app/actions/quotes";
import { useDebouncedValue } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar } from "@/components/shared/avatar";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function QuotesPageClient({ quotes }: { quotes: QuoteWithRelations[] }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [deletingQuote, setDeletingQuote] = useState<QuoteWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredQuotes = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return quotes;
    return quotes.filter(
      (q) =>
        q.client.name.toLowerCase().includes(query) ||
        q.client.company?.toLowerCase().includes(query),
    );
  }, [quotes, debouncedSearch]);

  const handleDelete = () => {
    if (!deletingQuote) return;
    startTransition(async () => {
      const result = await deleteQuoteAction(deletingQuote.id);
      if (result.success) {
        toast.success("Presupuesto eliminado");
        setDeletingQuote(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Presupuestos"
        description="Creá presupuestos profesionales y exportalos en PDF."
        action={
          <Button asChild className="rounded-full">
            <Link href="/presupuestos/nuevo">
              <Plus className="size-4" />
              Nuevo presupuesto
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por cliente..."
        />
        <p className="text-sm text-muted-foreground">
          {filteredQuotes.length} de {quotes.length} presupuestos
        </p>
      </div>

      {filteredQuotes.length ? (
        <motion.div
          key={debouncedSearch}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <div className="hidden grid-cols-[64px_1.4fr_1fr_0.7fr_1fr_48px] gap-4 border-b border-border/70 bg-secondary/40 px-6 py-3.5 md:grid">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              N°
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cliente
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fecha
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <span />
          </div>

          <ul className="divide-y divide-border/60">
            {filteredQuotes.map((quote) => (
              <li key={quote.id} className="group">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/40 sm:px-6 md:grid-cols-[64px_1.4fr_1fr_0.7fr_1fr_48px] md:gap-4">
                  <div className="flex items-center gap-3.5 md:contents">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground">
                      {quote.number}
                    </span>
                    <div className="min-w-0 md:flex md:items-center md:gap-3.5">
                      <Avatar name={quote.client.name} className="hidden size-9 md:flex" />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium">
                          {quote.client.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground md:hidden">
                          {formatDate(quote.createdAt)} · {formatCurrency(quote.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </span>
                  </div>

                  <div className="hidden md:block">
                    <Badge variant="secondary" className="h-7">
                      {quote.items.length} ítem{quote.items.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="hidden md:block">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(quote.total)}
                    </span>
                  </div>

                  <RowActionsMenu
                    actions={[
                      {
                        label: "Ver detalle",
                        icon: Eye,
                        href: `/presupuestos/${quote.id}`,
                      },
                      {
                        label: "Editar (nueva versión)",
                        icon: Pencil,
                        href: `/presupuestos/${quote.id}/editar`,
                      },
                      {
                        label: "Descargar PDF",
                        icon: Download,
                        href: `/api/presupuestos/${quote.id}/pdf`,
                        download: true,
                      },
                      {
                        label: "Eliminar",
                        icon: Trash2,
                        variant: "destructive",
                        onClick: () => setDeletingQuote(quote),
                      },
                    ]}
                  />
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
            icon={FileText}
            title={search ? "Sin resultados" : "Todavía no hay presupuestos"}
            description={
              search
                ? `No se encontraron presupuestos para “${debouncedSearch}”.`
                : "Creá tu primer presupuesto comercial y descargalo en PDF."
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/presupuestos/nuevo">
                    <Plus className="size-4" />
                    Nuevo presupuesto
                  </Link>
                </Button>
              )
            }
          />
        </motion.div>
      )}

      <AlertDialog open={!!deletingQuote} onOpenChange={() => setDeletingQuote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el presupuesto N° {deletingQuote?.number} de{" "}
              <strong>{deletingQuote?.client.name}</strong>.
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
    </>
  );
}