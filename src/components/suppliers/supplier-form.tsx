"use client";

import { useTransition } from "react";
import { useForm, useWatch, type Control, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  supplierSchema,
  type SupplierFormValues,
  CURRENCIES,
  type Currency,
} from "@/lib/validations";
import { createSupplierAction, updateSupplierAction } from "@/app/actions/suppliers";
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
import { Separator } from "@/components/ui/separator";

interface SupplierFormProps {
  supplier?: {
    id: string;
    name: string;
    company?: string | null;
    country?: string | null;
    currency?: string;
    contact?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    notes?: string | null;
    nacionalizacionPct?: number | null;
    nacionalizacionType?: string | null;
    comisionPct?: number | null;
    comisionType?: string | null;
    costosFinancierosPct?: number | null;
    costosFinancierosType?: string | null;
    envio?: number | null;
    envioType?: string | null;
    seguro?: number | null;
    seguroType?: string | null;
    otrosGastos?: number | null;
    otrosGastosType?: string | null;
  };
  onSuccess?: () => void;
}

const COST_FIELDS = [
  { valueName: "nacionalizacionPct", typeName: "nacionalizacionType", label: "Nacionalización" },
  { valueName: "comisionPct", typeName: "comisionType", label: "Comisión" },
  {
    valueName: "costosFinancierosPct",
    typeName: "costosFinancierosType",
    label: "Costos financieros",
  },
  { valueName: "envio", typeName: "envioType", label: "Envío" },
  { valueName: "seguro", typeName: "seguroType", label: "Seguro" },
  { valueName: "otrosGastos", typeName: "otrosGastosType", label: "Otros gastos" },
] as const;

function CostFieldRow({
  control,
  valueName,
  typeName,
  label,
  currency,
}: {
  control: Control<SupplierFormValues>;
  valueName: (typeof COST_FIELDS)[number]["valueName"];
  typeName: (typeof COST_FIELDS)[number]["typeName"];
  label: string;
  currency: string;
}) {
  const type = useWatch({ control, name: typeName });
  const isPercent = type === "PERCENT";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <FormLabel className="text-sm font-normal">{label}</FormLabel>
        <FormField
          control={control}
          name={typeName}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-7 w-[92px] rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">%</SelectItem>
                <SelectItem value="FIXED">Fijo</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <FormField
        control={control}
        name={valueName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={isPercent ? 100 : undefined}
                step={isPercent ? 0.1 : 0.01}
                placeholder={isPercent ? "20" : "10000"}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {!isPercent && (
        <p className="text-[11px] text-muted-foreground">Importe fijo en {currency}</p>
      )}
    </div>
  );
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as Resolver<SupplierFormValues>,
    defaultValues: {
      name: supplier?.name ?? "",
      company: supplier?.company ?? "",
      country: supplier?.country ?? "",
      currency: (supplier?.currency as Currency) ?? "USD",
      contact: supplier?.contact ?? "",
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
      website: supplier?.website ?? "",
      notes: supplier?.notes ?? "",
      nacionalizacionPct: supplier?.nacionalizacionPct ?? undefined,
      nacionalizacionType: (supplier?.nacionalizacionType as "FIXED" | "PERCENT") ?? "PERCENT",
      comisionPct: supplier?.comisionPct ?? undefined,
      comisionType: (supplier?.comisionType as "FIXED" | "PERCENT") ?? "PERCENT",
      costosFinancierosPct: supplier?.costosFinancierosPct ?? undefined,
      costosFinancierosType:
        (supplier?.costosFinancierosType as "FIXED" | "PERCENT") ?? "PERCENT",
      envio: supplier?.envio ?? undefined,
      envioType: (supplier?.envioType as "FIXED" | "PERCENT") ?? "FIXED",
      seguro: supplier?.seguro ?? undefined,
      seguroType: (supplier?.seguroType as "FIXED" | "PERCENT") ?? "FIXED",
      otrosGastos: supplier?.otrosGastos ?? undefined,
      otrosGastosType: (supplier?.otrosGastosType as "FIXED" | "PERCENT") ?? "FIXED",
    },
  });

  const currency = useWatch({ control: form.control, name: "currency" });

  const onSubmit = (values: SupplierFormValues) => {
    startTransition(async () => {
      const result = supplier
        ? await updateSupplierAction(supplier.id, values)
        : await createSupplierAction(values);

      if (result.success) {
        toast.success(supplier ? "Proveedor actualizado" : "Proveedor creado");
        onSuccess?.();
        if (!supplier) form.reset();
      } else {
        toast.error("Revisá los datos del formulario");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del contacto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="País" {...field} />
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
                <FormLabel>Moneda *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar moneda" />
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del contacto" {...field} />
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
                  <Input type="email" placeholder="email@proveedor.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
                  <Input type="url" placeholder="https://proveedor.com" {...field} />
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
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales..." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">
            Configuración de costos (opcional)
          </h3>
          <p className="text-xs text-muted-foreground">
            Si no se completa, se usará la configuración global. Para cada costo, elegí si es un
            porcentaje sobre el FOB o un importe fijo en {currency}.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {COST_FIELDS.map((f) => (
            <CostFieldRow
              key={f.valueName}
              control={form.control}
              valueName={f.valueName}
              typeName={f.typeName}
              label={f.label}
              currency={currency}
            />
          ))}
        </div>

        <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full">
          {isPending ? "Guardando..." : supplier ? "Actualizar proveedor" : "Crear proveedor"}
        </Button>
      </form>
    </Form>
  );
}