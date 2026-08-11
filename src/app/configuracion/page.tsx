import { Building2, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CostSettingsForm } from "@/components/settings/cost-settings-form";
import { CompanySettingsForm } from "@/components/settings/company-settings-form";

export default async function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Parámetros globales del sistema."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Settings2 className="size-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Cálculo de costos</h3>
                <p className="text-xs text-muted-foreground">
                  Valores por defecto para el costo nacionalizado
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Estos valores se usan cuando un proveedor no define los suyos. Se aplican al
              registrar cotizaciones y en el comparador de proveedores.
            </p>
          </div>
        </div>

        <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
          <CostSettingsForm />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Building2 className="size-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Empresa y presupuestos</h3>
                <p className="text-xs text-muted-foreground">
                  Datos de contacto y condiciones comerciales
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Estos datos se usan para armar el encabezado, pie de página y condiciones
              comerciales de cada presupuesto en PDF.
            </p>
          </div>
        </div>

        <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)">
          <CompanySettingsForm />
        </div>
      </div>
    </div>
  );
}