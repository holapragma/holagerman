"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Factory, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SupplierListItem } from "@/types";
import { deleteSupplierAction } from "@/app/actions/suppliers";
import { useDebouncedValue } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
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
import { SupplierTabs } from "@/components/suppliers/supplier-tabs";
import Link from "next/link";

export function SuppliersPageClient({ suppliers }: { suppliers: SupplierListItem[] }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierListItem | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredSuppliers = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.company?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.phone?.toLowerCase().includes(query),
    );
  }, [suppliers, debouncedSearch]);

  const handleDelete = () => {
    if (!deletingSupplier) return;
    startTransition(async () => {
      const result = await deleteSupplierAction(deletingSupplier.id);
      if (result.success) {
        toast.success("Proveedor eliminado");
        setDeletingSupplier(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Proveedores"
        description="Gestioná tus proveedores, cotizaciones y configuración de costos."
        action={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingSupplier(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="size-4" />
                Nuevo proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? "Editar proveedor" : "Nuevo proveedor"}
                </DialogTitle>
              </DialogHeader>
              <SupplierForm
                supplier={editingSupplier ?? undefined}
                onSuccess={() => {
                  setDialogOpen(false);
                  setEditingSupplier(null);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <SupplierTabs />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, empresa, email..."
        />
        <p className="text-sm text-muted-foreground">
          {filteredSuppliers.length} de {suppliers.length} proveedores
        </p>
      </div>

      {filteredSuppliers.length ? (
        <motion.div
          key={debouncedSearch}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_48px] gap-4 border-b border-border/70 bg-secondary/40 px-6 py-3.5 lg:grid">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Proveedor
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              País
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Moneda
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cotizaciones
            </span>
            <span />
          </div>

          <ul className="divide-y divide-border/60">
            {filteredSuppliers.map((supplier) => (
              <li key={supplier.id} className="group">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/40 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr_48px]">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <Factory className="size-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/proveedores/${supplier.id}`}
                        className="truncate text-[15px] font-medium hover:underline"
                      >
                        {supplier.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground md:hidden">
                        {supplier.company || supplier.country || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <span className="text-sm text-muted-foreground">
                      {supplier.country || "—"}
                    </span>
                  </div>

                  <div className="hidden md:block">
                    <span className="text-sm font-medium tabular-nums">
                      {supplier.currency}
                    </span>
                  </div>

                  <div className="hidden md:block">
                    <span className="text-sm font-medium tabular-nums">
                      {supplier._count.quotes}
                    </span>
                  </div>

                  <RowActionsMenu
                    revealAt="lg"
                    actions={[
                      {
                        label: "Editar",
                        icon: Pencil,
                        onClick: () => {
                          setEditingSupplier(supplier);
                          setDialogOpen(true);
                        },
                      },
                      {
                        label: "Eliminar",
                        icon: Trash2,
                        variant: "destructive",
                        onClick: () => setDeletingSupplier(supplier),
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
            icon={Factory}
            title={search ? "Sin resultados" : "Todavía no tenés proveedores"}
            description={
              search
                ? `No se encontraron proveedores para “${debouncedSearch}”.`
                : "Registrá tu primer proveedor para comenzar a cargar cotizaciones."
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" />
                  Nuevo proveedor
                </Button>
              )
            }
          />
        </motion.div>
      )}

      <div className="mt-8 flex justify-center lg:hidden">
        <Button onClick={() => setDialogOpen(true)} className="h-12 w-full rounded-full text-[15px]">
          <Plus className="size-5" />
          Nuevo proveedor
        </Button>
      </div>

      <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará{" "}
              <strong>{deletingSupplier?.name}</strong>. Solo es posible si no tiene
              cotizaciones registradas.
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