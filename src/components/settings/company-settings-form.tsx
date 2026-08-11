"use client";

import { useEffect, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { companySettingsSchema, type CompanySettingsFormValues } from "@/lib/validations";
import { updateCompanySettingsAction, getCompanySettings } from "@/app/actions/company-settings";
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
import { Separator } from "@/components/ui/separator";

export function CompanySettingsForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema) as Resolver<CompanySettingsFormValues>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      quoteValidityDays: 30,
      conditions: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await getCompanySettings();
      if (cancelled) return;
      form.reset({
        name: settings.name,
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        website: settings.website ?? "",
        quoteValidityDays: settings.quoteValidityDays,
        conditions: settings.conditions,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [form]);

  const onSubmit = (values: CompanySettingsFormValues) => {
    startTransition(async () => {
      const result = await updateCompanySettingsAction(values);
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
          <h3 className="text-sm font-semibold tracking-tight">Datos de la empresa</h3>
          <p className="text-xs text-muted-foreground">
            Aparecen en el encabezado y pie de página del PDF de presupuestos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la empresa</FormLabel>
                <FormControl>
                  <Input placeholder="German CRM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ventas@empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+54 11 1234-5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio web</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Av. Corrientes 1234, CABA, Argentina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">Condiciones comerciales</h3>
          <p className="text-xs text-muted-foreground">
            Se muestran al pie de cada presupuesto en PDF.
          </p>
        </div>

        <FormField
          control={form.control}
          name="quoteValidityDays"
          render={({ field }) => (
            <FormItem className="max-w-[220px]">
              <FormLabel>Validez del presupuesto (días)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="30"
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
          name="conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condiciones</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Una condición por línea. Ej: Forma de pago: a convenir (transferencia, cheque, efectivo)"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Una condición por línea. Se muestran en el PDF del presupuesto.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="h-11 w-full sm:w-auto rounded-full">
          {isPending ? "Guardando..." : "Guardar configuración"}
        </Button>
      </form>
    </Form>
  );
}
