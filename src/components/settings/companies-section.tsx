"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2, Pencil, Plus, Power, Star } from "lucide-react";
import type { CompanyWithLogo } from "@/types";
import {
  setCompanyActiveAction,
  setDefaultCompanyAction,
} from "@/app/actions/companies";
import { CompanyForm } from "@/components/settings/company-form";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CompaniesSection({ companies }: { companies: CompanyWithLogo[] }) {
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CompanyWithLogo | null>(null);

  const toggleActive = (company: CompanyWithLogo) => {
    startTransition(async () => {
      const result = await setCompanyActiveAction(company.id, !company.active);
      if (result.success) {
        toast.success(company.active ? "Empresa desactivada" : "Empresa activada");
      } else {
        toast.error(result.error);
      }
    });
  };

  const makeDefault = (company: CompanyWithLogo) => {
    startTransition(async () => {
      const result = await setDefaultCompanyAction(company.id);
      if (result.success) {
        toast.success(`${company.name} es la empresa predeterminada`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Empresas</h3>
          <p className="text-xs text-muted-foreground">
            Cada presupuesto se emite con una de estas empresas.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Nueva empresa
        </Button>
      </div>

      {companies.length ? (
        <ul className="divide-y divide-border/60">
          {companies.map((company) => (
            <li
              key={company.id}
              className="group flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-border/70 bg-card">
                {company.logoId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/empresas/logos/${company.logoId}`}
                    alt={company.name}
                    className="size-full object-contain p-1"
                  />
                ) : (
                  <Building2 className="size-5 text-muted-foreground/60" strokeWidth={1.5} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{company.name}</p>
                  {company.isDefault ? (
                    <Badge variant="success">Predeterminada</Badge>
                  ) : null}
                  {!company.active ? <Badge variant="secondary">Inactiva</Badge> : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {[company.legalName, company.taxId ? `CUIT ${company.taxId}` : null]
                    .filter(Boolean)
                    .join(" · ") || "Sin datos fiscales cargados"}
                </p>
              </div>

              <RowActionsMenu
                actions={[
                  {
                    label: "Editar",
                    icon: Pencil,
                    onClick: () => setEditing(company),
                  },
                  ...(company.isDefault
                    ? []
                    : [
                        {
                          label: "Marcar como predeterminada",
                          icon: Star,
                          onClick: () => makeDefault(company),
                        },
                      ]),
                  {
                    label: company.active ? "Desactivar" : "Activar",
                    icon: Power,
                    onClick: () => toggleActive(company),
                  },
                ]}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[14px] border border-dashed border-border px-6 py-10 text-center">
          <Building2 className="mx-auto mb-3 size-6 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Todavía no cargaste ninguna empresa emisora.
          </p>
          <Button className="mt-4 rounded-full" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Crear la primera
          </Button>
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva empresa</DialogTitle>
            <DialogDescription>
              Los datos y el logo se imprimen en los presupuestos emitidos con esta empresa.
            </DialogDescription>
          </DialogHeader>
          <CompanyForm onSuccess={() => setCreating(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
            <DialogDescription>
              Los presupuestos ya emitidos conservan los datos con los que fueron generados.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <CompanyForm
              key={editing.id}
              company={editing}
              onSuccess={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <span className="sr-only" aria-live="polite">
        {isPending ? "Guardando cambios" : ""}
      </span>
    </>
  );
}
