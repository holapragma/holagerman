"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Eye, Package, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { deleteProductAction } from "@/app/actions/products";
import { useDebouncedValue } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
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

function ProductThumb({ product }: { product: Product }) {
  if (product.photoUrl) {
    return (
      <Image
        src={product.photoUrl}
        alt={product.name}
        width={44}
        height={44}
        unoptimized
        className="size-11 shrink-0 rounded-xl object-cover"
      />
    );
  }
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
      <Package className="size-5" strokeWidth={1.75} />
    </span>
  );
}

export function ProductsPageClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    );
  }, [products, debouncedSearch]);

  const handleDelete = () => {
    if (!deletingProduct) return;
    startTransition(async () => {
      const result = await deleteProductAction(deletingProduct.id);
      if (result.success) {
        toast.success("Producto eliminado");
        setDeletingProduct(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  return (
    <>
      <PageHeader
        title="Productos"
        description="Catálogo de productos con precios y control de stock."
        action={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingProduct(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="size-4" />
                Nuevo producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar producto" : "Nuevo producto"}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct ?? undefined}
                onSuccess={() => {
                  setDialogOpen(false);
                  setEditingProduct(null);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o categoría..."
        />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-8">
            {filteredProducts.length} productos
          </Badge>
          {lowStockCount > 0 ? (
            <Badge variant="warning" className="h-8">
              {lowStockCount} con stock bajo
            </Badge>
          ) : null}
        </div>
      </div>

      {filteredProducts.length ? (
        <motion.div
          key={debouncedSearch}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_48px] gap-4 border-b border-border/70 bg-secondary/40 px-6 py-3.5 md:grid">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Producto
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categoría
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Precio
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Stock
            </span>
            <span />
          </div>

          <ul className="divide-y divide-border/60">
            {filteredProducts.map((product) => {
              const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
              return (
                <li key={product.id} className="group">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/40 sm:px-6 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_48px]">
                    <Link
                      href={`/productos/${product.id}`}
                      className="flex items-center gap-3.5 rounded-lg"
                    >
                      <ProductThumb product={product} />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium hover:underline">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {product.category} · {formatCurrency(product.price)}
                        </p>
                      </div>
                    </Link>

                    <div className="hidden md:block">
                      <Badge variant="success" className="h-7">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="hidden md:block">
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <div className="hidden md:block">
                      <Badge variant={lowStock ? "warning" : "secondary"} className="h-7">
                        {product.stock} uds
                      </Badge>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Badge variant={lowStock ? "warning" : "secondary"} className="h-7 md:hidden">
                        {product.stock} uds
                      </Badge>
                      <RowActionsMenu
                        actions={[
                          {
                            label: "Ver detalle",
                            icon: Eye,
                            href: `/productos/${product.id}`,
                          },
                          {
                            label: "Editar",
                            icon: Pencil,
                            onClick: () => {
                              setEditingProduct(product);
                              setDialogOpen(true);
                            },
                          },
                          {
                            label: "Eliminar",
                            icon: Trash2,
                            variant: "destructive",
                            onClick: () => setDeletingProduct(product),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
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
            icon={Package}
            title={search ? "Sin resultados" : "Todavía no tenés productos"}
            description={
              search
                ? `No se encontraron productos para “${debouncedSearch}”.`
                : "Cargá tu catálogo de productos para armar presupuestos."
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" />
                  Nuevo producto
                </Button>
              )
            }
          />
        </motion.div>
      )}

      <div className="mt-8 flex justify-center md:hidden">
        <Button
          className="h-12 w-full rounded-full text-[15px]"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-5" />
          Nuevo producto
        </Button>
      </div>

      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deletingProduct?.name}</strong> del catálogo.
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