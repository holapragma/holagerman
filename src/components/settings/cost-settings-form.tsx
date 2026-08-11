"use client";

import { useEffect, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { costSettingsSchema, type CostSettingsFormValues } from "@/lib/validations";
import { updateCostSettingsAction, getCostSettings } from "@/app/actions/cost-settings";
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
import { Separator } from "@/components/ui/separator";

export function CostSettingsForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CostSettingsFormValues>({
    resolver: zodResolver(costSettingsSchema) as Resolver<CostSettingsFormValues>,
    defaultValues: {
      nacionalizacionPct: undefined,
      comisionPct: undefined,
      costosFinancierosPct: undefined,
      envio: undefined,
      seguro: undefined,
      otrosGastos: undefined,
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await getCostSettings();
      if (cancelled) return;
      form.reset({
        nacionalizacionPct: settings.nacionalizacionPct ?? undefined,
        comisionPct: settings.comisionPct ?? undefined,
        costosFinancierosPct: settings.costosFinancierosPct ?? undefined,
        envio: settings.envio ?? undefined,
        seguro: settings.seguro ?? undefined,
        otrosGastos: settings.otrosGastos ?? undefined,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [form]);

  const onSubmit = (values: CostSettingsFormValues) => {
    startTransition(async () => {
      const result = await updateCostSettingsAction(values);
      if (result.success) {
        toast.success("Configuración actualizada");
      } else {
        toast.error("Revisá los datos");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">
            Porcentajes (se aplican sobre el costo FOB)
          </h3>
          <p className="text-xs text-muted-foreground">
            Dejá vacío para que no se aplique.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="nacionalizacionPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalización (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="20"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comisionPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comisión (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="4"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costosFinancierosPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costos financieros (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="2"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">
            Importes fijos
          </h3>
          <p className="text-xs text-muted-foreground">
            Se suman directamente al costo FOB, en la misma moneda que cada proveedor. Si un
            proveedor cotiza en USD, cargá estos importes en USD; si cotiza en ARS, cargalos en
            ARS. Dejá vacío para que no se aplique.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="envio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Envío</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="10000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seguro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seguro</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="2000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otrosGastos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Otros gastos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="5000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="h-11 w-full sm:w-auto rounded-full">
          {isPending ? "Guardando..." : "Guardar configuración"}
        </Button>
      </form>
    </Form>
  );
}