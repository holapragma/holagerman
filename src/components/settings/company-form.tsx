"use client";

import { useRef, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, ImageUp, Trash2 } from "lucide-react";
import { companySchema, type CompanyFormValues } from "@/lib/validations";
import {
  createCompanyAction,
  removeCompanyLogoAction,
  updateCompanyAction,
  uploadCompanyLogoAction,
} from "@/app/actions/companies";
import type { CompanyWithLogo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export function CompanyForm({
  company,
  onSuccess,
}: {
  company?: CompanyWithLogo;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as Resolver<CompanyFormValues>,
    defaultValues: {
      name: company?.name ?? "",
      legalName: company?.legalName ?? "",
      taxId: company?.taxId ?? "",
      address: company?.address ?? "",
      phone: company?.phone ?? "",
      email: company?.email ?? "",
      website: company?.website ?? "",
      quoteValidityDays: company?.quoteValidityDays ?? 30,
      conditions: company?.conditions ?? "",
      active: company?.active ?? true,
    },
  });

  const currentLogoUrl =
    !logoRemoved && company?.logoId ? `/api/empresas/logos/${company.logoId}` : null;
  const previewUrl = pendingPreview ?? currentLogoUrl;

  const pickLogo = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("El logo debe ser PNG o JPG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("El logo no puede superar los 2 MB.");
      return;
    }
    setPendingLogo(file);
    setPendingPreview(URL.createObjectURL(file));
    setLogoRemoved(false);
  };

  const clearLogo = () => {
    setPendingLogo(null);
    setPendingPreview(null);
    setLogoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (values: CompanyFormValues) => {
    startTransition(async () => {
      const result = company
        ? await updateCompanyAction(company.id, values)
        : await createCompanyAction(values);

      if (!result.success) {
        toast.error("Revisá los datos de la empresa");
        return;
      }

      const companyId = result.companyId;

      if (pendingLogo && companyId) {
        const formData = new FormData();
        formData.append("companyId", companyId);
        formData.append("logo", pendingLogo);
        const upload = await uploadCompanyLogoAction(formData);
        if (!upload.success) {
          toast.error(upload.error);
          return;
        }
      } else if (logoRemoved && company?.logoId) {
        await removeCompanyLogoAction(company.id);
      }

      toast.success(company ? "Empresa actualizada" : "Empresa creada");
      onSuccess?.();
      if (!company) form.reset();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[14px] bg-secondary/40 p-4 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-border/70 bg-card">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Logo de la empresa"
                className="size-full object-contain p-2"
              />
            ) : (
              <Building2 className="size-7 text-muted-foreground/60" strokeWidth={1.5} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Logo</p>
            <p className="text-xs text-muted-foreground">
              PNG o JPG, hasta 2 MB. Para PNG conviene fondo transparente.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageUp className="size-4" />
                {previewUrl ? "Cambiar" : "Subir logo"}
              </Button>
              {previewUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  onClick={clearLogo}
                >
                  <Trash2 className="size-4" />
                  Quitar
                </Button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => pickLogo(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre comercial</FormLabel>
                <FormControl>
                  <Input placeholder="AGRES" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón social</FormLabel>
                <FormControl>
                  <Input placeholder="AGRES S.A." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUIT</FormLabel>
                <FormControl>
                  <Input placeholder="30-12345678-9" {...field} />
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

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quoteValidityDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Validez del presupuesto (días)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} step={1} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="justify-end">
                <div className="flex h-11 items-center justify-between rounded-[14px] bg-secondary/50 px-4">
                  <Label className="text-sm font-medium">Empresa activa</Label>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condiciones comerciales</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Una condición por línea. Ej: Forma de pago: a convenir (transferencia, cheque, efectivo)"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Una condición por línea. Se imprimen al pie del PDF de esta empresa.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full sm:w-auto">
          {isPending ? "Guardando..." : company ? "Guardar cambios" : "Crear empresa"}
        </Button>
      </form>
    </Form>
  );
}
