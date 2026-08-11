"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { CostConfig } from "@/types";
import { supplierQuoteSchema, type SupplierQuoteFormValues, CURRENCIES } from "@/lib/validations";
import { createSupplierQuoteAction } from "@/app/actions/suppliers";
import { getProducts } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { todayInputValue } from "@/lib/format";
import { CostBreakdownDisplay } from "@/components/suppliers/cost-breakdown-display";

interface QuoteFormProps {
  supplierId: string;
  config: CostConfig;
  onSuccess?: () => void;
}

const OVERRIDE_FIELDS: { key: keyof CostConfig; label: string; percent?: boolean }[] = [
  { key: "nacionalizacionPct", label: "Nacionalización (%)", percent: true },
  { key: "comisionPct", label: "Comisión (%)", percent: true },
  { key: "costosFinancierosPct", label: "Costos financieros (%)", percent: true },
  { key: "envio", label: "Envío" },
  { key: "seguro", label: "Seguro" },
  { key: "otrosGastos", label: "Otros gastos" },
];

export function QuoteForm({ supplierId, config, onSuccess }: QuoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [overrides, setOverrides] = useState<CostConfig>(config);

  const form = useForm<SupplierQuoteFormValues>({
    resolver: zodResolver(supplierQuoteSchema) as Resolver<SupplierQuoteFormValues>,
    defaultValues: {
      supplierId,
      productId: "",
      supplierCode: "",
      fobCost: 0,
      minQuantity: undefined,
      currency: "USD",
      date: todayInputValue(),
      notes: "",
    },
  });

  const [fobCost, minQuantity, currency] = useWatch({
    control: form.control,
    name: ["fobCost", "minQuantity", "currency"],
  });

  // Load products on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getProducts();
      if (cancelled) return;
      setProducts(data.map((p) => ({ id: p.id, name: p.name })));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = (values: SupplierQuoteFormValues) => {
    startTransition(async () => {
      const result = await createSupplierQuoteAction(values);
      if (result.success) {
        toast.success("Cotización registrada");
        onSuccess?.();
        form.reset({
          supplierId,
          productId: "",
          supplierCode: "",
          fobCost: 0,
          minQuantity: undefined,
          currency: "USD",
          date: todayInputValue(),
          notes: "",
        });
      } else {
        toast.error("Revisá los datos del formulario");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fobCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo FOB *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad mínima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step="1"
                    placeholder="Opcional"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-[16px] border border-border/70 bg-secondary/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold tracking-tight">Desglose de costos estimado</h4>
              <p className="text-xs text-muted-foreground">
                Editá los valores para jugar con distintos escenarios de costo.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOverrides(config)}
            >
              Restablecer
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {OVERRIDE_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{f.label}</label>
                <Input
                  type="number"
                  min={0}
                  step={f.percent ? 0.1 : 0.01}
                  value={overrides[f.key] ?? 0}
                  onChange={(e) =>
                    setOverrides((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          <CostBreakdownDisplay
            quote={{
              fobCost: Number(fobCost) || 0,
              currency: currency || "USD",
              minQuantity: minQuantity ? Number(minQuantity) : null,
            }}
            config={overrides}
          />
        </div>

        <FormField
          control={form.control}
          name="supplierCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código del proveedor</FormLabel>
              <FormControl>
                <Input placeholder="Código interno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas..." {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full">
          {isPending ? "Registrando..." : "Registrar cotización"}
        </Button>
      </form>
    </Form>
  );
}
