"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { marketObservationSchema, type MarketObservationFormValues } from "@/lib/validations";
import { createMarketObservationAction } from "@/app/actions/market";
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

export function MarketForm({ productId, onSuccess }: { productId?: string; onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  const form = useForm<MarketObservationFormValues>({
    resolver: zodResolver(marketObservationSchema),
    defaultValues: {
      productId: productId || "",
      source: "",
      observedPrice: undefined,
      currency: "ARS",
      notes: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getProducts();
      if (cancelled) return;
      setProducts(data.map((p) => ({ id: p.id, name: p.name, price: p.price })));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = (values: MarketObservationFormValues) => {
    startTransition(async () => {
      const result = await createMarketObservationAction(values);
      if (result.success) {
        toast.success("Observación registrada");
        onSuccess?.();
      } else {
        toast.error("Revisá los datos");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto *</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="BRL">BRL</SelectItem>
                      <SelectItem value="UYU">UYU</SelectItem>
                      <SelectItem value="CLP">CLP</SelectItem>
                      <SelectItem value="COP">COP</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="PYG">PYG</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuente *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Mercado Libre, Apple Store, Distribuidor X"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="observedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio observado *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles adicionales..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="h-11 w-full sm:w-auto rounded-full">
          {isPending ? "Registrando..." : "Registrar observación"}
        </Button>
      </form>
    </Form>
  );
}