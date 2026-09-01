"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ListPlus,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Client, CompanyWithLogo, Product } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createQuoteAction } from "@/app/actions/quotes";
import { ProductPicker } from "@/components/quotes/product-picker";
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
import { Switch } from "@/components/ui/switch";

export type QuoteLine = {
  productId: string | null;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  saveAsProduct: boolean;
};

type EditorLine = QuoteLine & { key: string };

const panelClass =
  "rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)";

/**
 * La planilla responde al ancho del panel de ítems (container query), no al de la
 * ventana: debajo de 520px de panel cada ítem se apila como card.
 */
const GRID =
  "@min-[520px]:grid @min-[520px]:grid-cols-[minmax(0,1fr)_68px_minmax(104px,0.55fr)_minmax(92px,0.5fr)_100px] @min-[520px]:gap-2 @min-[700px]:gap-3";

let lineCounter = 0;
function newLine(partial?: Partial<QuoteLine>): EditorLine {
  lineCounter += 1;
  return {
    key: `line-${lineCounter}`,
    productId: null,
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    saveAsProduct: false,
    ...partial,
  };
}

export function QuoteBuilderClient({
  clients,
  products,
  companies,
  defaultIvaPct,
  initialQuote,
}: {
  clients: Client[];
  products: Product[];
  companies: CompanyWithLogo[];
  defaultIvaPct: number;
  initialQuote?: {
    originalNumber?: number;
    clientId: string;
    companyId?: string | null;
    notes?: string | null;
    includeIva?: boolean;
    items: QuoteLine[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultCompanyId =
    initialQuote?.companyId ??
    companies.find((company) => company.isDefault)?.id ??
    companies[0]?.id ??
    "";

  const [clientId, setClientId] = useState(initialQuote?.clientId ?? "");
  const [companyId, setCompanyId] = useState(defaultCompanyId);
  const [notes, setNotes] = useState(initialQuote?.notes ?? "");
  const [includeIva, setIncludeIva] = useState(initialQuote?.includeIva ?? true);
  const [lines, setLines] = useState<EditorLine[]>(() =>
    initialQuote?.items.length
      ? initialQuote.items.map((item) => newLine(item))
      : [newLine()],
  );

  const inputsRef = useRef(new Map<string, HTMLInputElement | null>());
  const registerInput = useCallback(
    (key: string, field: string) => (el: HTMLInputElement | null) => {
      inputsRef.current.set(`${key}:${field}`, el);
    },
    [],
  );
  const focusInput = (key: string, field: string) => {
    const el = inputsRef.current.get(`${key}:${field}`);
    el?.focus();
    el?.select?.();
  };

  const filledLines = useMemo(
    () => lines.filter((line) => line.name.trim()),
    [lines],
  );
  const subtotal = filledLines.reduce(
    (acc, line) => acc + line.quantity * line.unitPrice,
    0,
  );
  const ivaAmount = includeIva ? subtotal * (defaultIvaPct / 100) : 0;
  const total = subtotal + ivaAmount;
  const itemsCount = filledLines.reduce((acc, line) => acc + line.quantity, 0);

  const updateLine = (key: string, patch: Partial<QuoteLine>) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => {
    const line = newLine();
    setLines((current) => [...current, line]);
    requestAnimationFrame(() => focusInput(line.key, "name"));
  };

  const removeLine = (key: string) => {
    setLines((current) => {
      const next = current.filter((line) => line.key !== key);
      return next.length ? next : [newLine()];
    });
  };

  const moveLine = (key: string, direction: -1 | 1) => {
    setLines((current) => {
      const index = current.findIndex((line) => line.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Seleccioná un cliente");
      return;
    }

    if (companies.length && !companyId) {
      toast.error("Seleccioná la empresa emisora");
      return;
    }

    if (!filledLines.length) {
      toast.error("Agregá al menos un ítem con nombre");
      return;
    }

    const invalid = filledLines.find(
      (line) => line.quantity < 1 || line.unitPrice < 0,
    );
    if (invalid) {
      toast.error(`Revisá cantidad y precio de “${invalid.name.trim()}”`);
      return;
    }

    startTransition(async () => {
      const result = await createQuoteAction({
        clientId,
        companyId: companyId || null,
        notes: notes || undefined,
        includeIva,
        items: filledLines.map((line) => ({
          productId: line.productId,
          name: line.name.trim(),
          description: line.description.trim() || undefined,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          saveAsProduct: !line.productId && line.saveAsProduct,
        })),
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

  const selectedClient = clients.find((client) => client.id === clientId);

  return (
    <>
      <PageHeader
        title={initialQuote ? "Editar presupuesto" : "Nuevo presupuesto"}
        description={
          initialQuote
            ? `Vas a guardar una copia como presupuesto nuevo para conservar el registro original N° ${initialQuote.originalNumber}.`
            : "Cargá los ítems directamente: los del catálogo se autocompletan y los nuevos se escriben a mano."
        }
      />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className={cn(panelClass, "mb-6")}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Cliente</Label>
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
            {selectedClient ? (
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {[selectedClient.company, selectedClient.email, selectedClient.phone]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Empresa emisora</Label>
            {companies.length ? (
              <>
                <div className="mt-1.5">
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger className="w-full rounded-[14px]">
                      <SelectValue placeholder="Elegí la empresa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Define el logo y los datos que salen en el PDF.
                </p>
              </>
            ) : (
              <div className="mt-1.5 flex items-center gap-3 rounded-[14px] border border-dashed border-border px-4 py-3">
                <Building2 className="size-4 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No hay empresas cargadas.{" "}
                  <Link href="/configuracion" className="font-medium text-primary underline-offset-4 hover:underline">
                    Crear una en Configuración
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.8fr)] xl:items-start">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className={panelClass}
        >
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Ítems</h2>
              <p className="text-xs text-muted-foreground">
                Escribí el nombre y elegí una sugerencia del catálogo, o cargalo a mano.
              </p>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {filledLines.length} ítem{filledLines.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="@container">
            <div
              className={cn(
                "hidden border-b border-border/70 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
                GRID,
              )}
            >
              <span className="min-w-0 truncate">Producto / Descripción</span>
              <span className="min-w-0 text-center">Cant.</span>
              <span className="min-w-0 text-right">Precio</span>
              <span className="min-w-0 text-right">Subtotal</span>
              <span aria-hidden />
            </div>

            <ul className="divide-y divide-border/60">
              {lines.map((line, index) => (
                <li
                  key={line.key}
                  className={cn(
                    "space-y-3 py-4 @min-[520px]:space-y-0 @min-[520px]:py-3",
                    GRID,
                    "@min-[520px]:items-start",
                  )}
                >
                  <div className="min-w-0 space-y-2">
                    <ProductPicker
                      value={line.name}
                      products={products}
                      linked={!!line.productId}
                      inputRef={registerInput(line.key, "name")}
                      onChange={(value) =>
                        updateLine(line.key, { name: value, productId: null })
                      }
                      onPick={(product) =>
                        updateLine(line.key, {
                          productId: product.id,
                          name: product.name,
                          unitPrice: product.price,
                          saveAsProduct: false,
                        })
                      }
                      onEnter={() => focusInput(line.key, "quantity")}
                    />

                    <Input
                      value={line.description}
                      placeholder="Descripción (opcional)"
                      onChange={(event) =>
                        updateLine(line.key, { description: event.target.value })
                      }
                      className="h-9 rounded-[12px] border-transparent bg-secondary/50 text-xs placeholder:text-muted-foreground/70"
                    />

                    {!line.productId && line.name.trim() ? (
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs whitespace-nowrap text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={line.saveAsProduct}
                          onChange={(event) =>
                            updateLine(line.key, { saveAsProduct: event.target.checked })
                          }
                          className="size-3.5 rounded-[4px] accent-[var(--primary)]"
                        />
                        Guardar también como producto
                      </label>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3 @min-[520px]:contents">
                    <div className="min-w-0">
                      <Label className="text-[11px] text-muted-foreground @min-[520px]:hidden">
                        Cantidad
                      </Label>
                      <Input
                        ref={registerInput(line.key, "quantity")}
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(line.key, {
                            quantity: Number(event.target.value) || 1,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            focusInput(line.key, "unitPrice");
                          }
                        }}
                        className="mt-1 h-10 rounded-[12px] text-center tabular-nums @min-[520px]:mt-0"
                      />
                    </div>

                    <div className="min-w-0">
                      <Label className="text-[11px] text-muted-foreground @min-[520px]:hidden">
                        Precio
                      </Label>
                      <Input
                        ref={registerInput(line.key, "unitPrice")}
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        value={line.unitPrice}
                        onChange={(event) =>
                          updateLine(line.key, {
                            unitPrice: Number(event.target.value) || 0,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            if (index === lines.length - 1) addLine();
                            else focusInput(lines[index + 1].key, "name");
                          }
                        }}
                        className="mt-1 h-10 rounded-[12px] text-right tabular-nums @min-[520px]:mt-0"
                      />
                    </div>

                    <div className="col-span-2 min-w-0 @min-[520px]:col-auto">
                      <Label className="text-[11px] text-muted-foreground @min-[520px]:hidden">
                        Subtotal
                      </Label>
                      <div className="mt-1 flex h-10 items-center justify-end rounded-[12px] bg-secondary/60 px-3 text-sm font-semibold tabular-nums @min-[520px]:mt-0 @min-[520px]:bg-transparent @min-[520px]:px-0">
                        {formatCurrency(line.quantity * line.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-0.5 @min-[520px]:gap-0 @min-[520px]:justify-self-end @min-[520px]:pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 rounded-full"
                      disabled={index === 0}
                      onClick={() => moveLine(line.key, -1)}
                      aria-label="Subir ítem"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 rounded-full"
                      disabled={index === lines.length - 1}
                      onClick={() => moveLine(line.key, 1)}
                      aria-label="Bajar ítem"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 rounded-full text-destructive hover:bg-destructive/10"
                      onClick={() => removeLine(line.key)}
                      aria-label="Quitar ítem"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addLine}
            className="mt-4 h-11 w-full rounded-full border-dashed"
          >
            <Plus className="size-4" />
            Agregar ítem
          </Button>

          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ListPlus className="size-3.5" />
            Enter en el precio agrega la fila siguiente.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(panelClass, "xl:sticky xl:top-24")}
        >
          <h2 className="mb-5 text-base font-semibold tracking-tight">Resumen</h2>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Unidades</span>
              <span className="font-medium text-foreground tabular-nums">{itemsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {includeIva ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  IVA ({formatPercent(defaultIvaPct)})
                </span>
                <span className="font-medium tabular-nums">{formatCurrency(ivaAmount)}</span>
              </div>
            ) : null}
            <Separator />
            <div className="flex items-end justify-between">
              <span className="text-[15px] font-semibold">Total</span>
              <span className="text-[26px] leading-none font-semibold tracking-tight tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-[14px] bg-secondary/50 px-4 py-3">
            <Label htmlFor="include-iva" className="text-sm font-medium">
              Incluir IVA ({formatPercent(defaultIvaPct)})
            </Label>
            <Switch id="include-iva" checked={includeIva} onCheckedChange={setIncludeIva} />
          </div>

          <div className="mt-6">
            <Label className="text-xs text-muted-foreground">Observaciones</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
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
        </motion.section>
      </div>
    </>
  );
}
