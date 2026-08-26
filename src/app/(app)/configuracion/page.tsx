import { Building2, Percent, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CostSettingsForm } from "@/components/settings/cost-settings-form";
import { QuoteSettingsForm } from "@/components/settings/quote-settings-form";
import { CompaniesSection } from "@/components/settings/companies-section";
import { companyService } from "@/services/company.service";

const cardClass =
  "rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card)";

function SectionIntro({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Settings2;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export default async function ConfiguracionPage() {
  const companies = await companyService.list();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Parámetros globales del sistema."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <SectionIntro
          icon={Building2}
          title="Empresas"
          subtitle="Identidad de cada empresa emisora"
        >
          Clientes y productos son compartidos entre todas las empresas. Lo único que
          cambia por empresa es la identidad del presupuesto: logo, datos fiscales y
          condiciones comerciales del PDF.
        </SectionIntro>

        <div className={cardClass}>
          <CompaniesSection companies={companies} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <SectionIntro
          icon={Settings2}
          title="Cálculo de costos"
          subtitle="Valores por defecto para el costo nacionalizado"
        >
          Estos valores se usan cuando un proveedor no define los suyos. Se aplican al
          registrar cotizaciones y en el comparador de proveedores.
        </SectionIntro>

        <div className={cardClass}>
          <CostSettingsForm />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <SectionIntro
          icon={Percent}
          title="Impuestos"
          subtitle="Alícuota de IVA de los presupuestos"
        >
          El IVA se activa o desactiva en cada presupuesto, pero el porcentaje sale
          siempre de acá. Los presupuestos ya emitidos guardan la alícuota con la que
          fueron creados.
        </SectionIntro>

        <div className={cardClass}>
          <QuoteSettingsForm />
        </div>
      </div>
    </div>
  );
}
