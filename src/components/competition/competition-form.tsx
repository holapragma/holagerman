"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  competitionSchema,
  type CompetitionFormValues,
} from "@/lib/validations";
import {
  createCompetitionAction,
  updateCompetitionAction,
} from "@/app/actions/competition";
import type { CompetitionEntryWithProduct, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function CompetitionForm({
  products,
  entry,
  onSuccess,
}: {
  products: Product[];
  entry?: CompetitionEntryWithProduct;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      productId: entry?.productId ?? "",
      competitorPrice: entry?.competitorPrice ?? 0,
      source: entry?.source ?? "",
    },
  });

  const onSubmit = (values: CompetitionFormValues) => {
    startTransition(async () => {
      const result = entry
        ? await updateCompetitionAction(entry.id, values)
        : await createCompetitionAction(values);

      if (result.success) {
        toast.success(entry ? "Registro actualizado" : "Registro creado");
        onSuccess?.();
        if (!entry) form.reset();
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
              <FormLabel>Producto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
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
          name="competitorPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio competencia</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fuente</FormLabel>
              <FormControl>
                <Input placeholder="Web, catálogo, tienda..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full">
          {isPending ? "Guardando..." : entry ? "Actualizar registro" : "Crear registro"}
        </Button>
      </form>
    </Form>
  );
}
