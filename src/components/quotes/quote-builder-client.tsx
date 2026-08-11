"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Client, Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createQuoteAction } from "@/app/actions/quotes";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type QuoteLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

const panelClass =
  "rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)";

export function QuoteBuilderClient({
  clients,
  products,
  initialQuote,
}: {
  clients: Client[];
  products: Product[];
  initialQuote?: {
    originalNumber?: number;
    clientId: string;
    notes?: string | null;
    items: QuoteLine[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState(initialQuote?.clientId ?? "");
  const [notes, setNotes] = useState(initialQuote?.notes ?? "");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState<QuoteLine[]>(initialQuote?.items ?? []);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [items],
  );

  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addProduct = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast.error("Seleccioná un producto");
      return;
    }

    const existing = items.find((item) => item.productId === product.id);
    if (existing) {
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
        },
      ]);
    }

    setSelectedProductId("");
  };

  const updateItem = (
    productId: string,
    field: "quantity" | "unitPrice",
    value: number,
  ) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Seleccioná un cliente");
      return;
    }

    if (!items.length) {
      toast.error("Agregá al menos un producto");
      return;
    }

    startTransition(async () => {
      const result = await createQuoteAction({
        clientId,
        notes: notes || undefined,
        items,
      });

      if (result.success && result.quoteId) {
        toast.success(
          initialQuote
            ? "Nueva versión guardada como presupuesto nuevo"
            : "Presupuesto creado",
        );
        router.push(`/presupuestos/${result.quoteId}`);
      } else {
        toast.error("No se pudo crear el presupuesto");
      }
    });
  };

  return (
    <>
      <PageHeader
        title={initialQuote ? "Editar presupuesto" : "Nuevo presupuesto"}
        description={
          initialQuote
            ? `Vas a guardar una copia como presupuesto nuevo para conservar el registro original N° ${initialQuote.originalNumber}.`
            : "Seleccioná un cliente, agregá productos y generá el presupuesto."
        }
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[0.8fr_1.2fr_0.9fr]">
        {/* Panel izquierdo: Cliente */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={cn(panelClass, "lg:order-1 xl:order-none")}
        >
          <h2 className="mb-1 text-base font-semibold tracking-tight">Cliente</h2>
          <p className="mb-5 text-xs text-muted-foreground">
            El destinatario del presupuesto
          </p>

          <Label className="text-xs text-muted-foreground">Seleccionar cliente</Label>
          <div className="mt-1.5">
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="w-full rounded-[14px]">
                <SelectValue placeholder="Elegí un cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                    {client.company ? ` · ${client.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clientId ? (
            <div className="mt-5 rounded-[14px] bg-secondary/50 p-4">
              {(() => {
                const client = clients.find((c) => c.id === clientId);
                if (!client) return null;
                return (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{client.name}</p>
                    {client.company ? <p className="text-muted-foreground">{client.company}</p> : null}
                    {client.phone ? <p className="text-muted-foreground">{client.phone}</p> : null}
                    {client.email ? <p className="text-muted-foreground">{client.email}</p> : null}
                  </div>
                );
              })()}
            </div>
          ) : null}
        </motion.section>

        {/* Panel central: Productos */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className={cn(panelClass, "lg:order-3 lg:col-span-2 xl:order-none xl:col-span-1")}
        >
          <h2 className="mb-1 text-base font-semibold tracking-tight">Productos</h2>
          <p className="mb-5 text-xs text-muted-foreground">
            Agregá productos desde el catálogo
          </p>

          <div className="flex gap-2">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-full rounded-[14px]">
                <SelectValue placeholder="Buscar en el catálogo..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} · {formatCurrency(product.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addProduct} size="icon" className="shrink-0 rounded-full" aria-label="Agregar producto">
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {items.length ? (
              items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;

                return (
                  <div
                    key={item.productId}
                    className="rounded-[14px] border border-border/70 p-4 transition-colors hover:bg-secondary/30"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Quitar ${product.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Cantidad</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.productId, "quantity", Number(e.target.value) || 1)
                          }
                          className="mt-1 h-10 rounded-[12px]"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Precio unitario</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.productId, "unitPrice", Number(e.target.value) || 0)
                          }
                          className="mt-1 h-10 rounded-[12px]"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs text-muted-foreground">Subtotal</Label>
                        <div className="mt-1 flex h-10 items-center rounded-[12px] bg-secondary/60 px-3 text-sm font-semibold tabular-nums">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[14px] border border-dashed border-border px-6 py-10 text-center">
                <FileText className="mx-auto mb-3 size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Agregá productos del catálogo para armar el presupuesto.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Panel derecho: Resumen */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 lg:order-2 xl:order-none"
        >
          <div className={`${panelClass} lg:sticky lg:top-24`}>
            <h2 className="mb-5 text-base font-semibold tracking-tight">Resumen</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Ítems</span>
                <span className="font-medium text-foreground">{itemsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <Separator />
              <div className="flex items-end justify-between">
                <span className="text-[15px] font-semibold">Total</span>
                <span className="text-[26px] leading-none font-semibold tracking-tight tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-xs text-muted-foreground">Observaciones</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condiciones, validez, notas..."
                rows={4}
                className="mt-1.5 rounded-[14px]"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="mt-6 h-12 w-full rounded-full text-[15px]"
            >
              {isPending
                ? "Guardando..."
                : initialQuote
                  ? "Guardar como nuevo"
                  : "Crear presupuesto"}
            </Button>

            {initialQuote ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                El presupuesto original N° {initialQuote.originalNumber} se conserva.
              </p>
            ) : null}
          </div>
        </motion.section>
      </div>
    </>
  );
}