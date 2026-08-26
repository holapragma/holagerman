"use client";

import { useEffect, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { companySettingsSchema, type CompanySettingsFormValues } from "@/lib/validations";
import { updateCompanySettingsAction, getCompanySettings } from "@/app/actions/company-settings";
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

export function QuoteSettingsForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema) as Resolver<CompanySettingsFormValues>,
    defaultValues: { ivaPct: 21 },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await getCompanySettings();
      if (cancelled) return;
      form.reset({ ivaPct: settings.ivaPct });
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
        <div className="max-w-[240px]">
          <FormField
            control={form.control}
            name="ivaPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IVA (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="21"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Alícuota que se puede aplicar al armar un presupuesto.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full sm:w-auto">
          {isPending ? "Guardando..." : "Guardar configuración"}
        </Button>
      </form>
    </Form>
  );
}
