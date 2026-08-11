import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  Factory,
  FileText,
  Package,
  Receipt,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";

function FlowNode({
  icon: Icon,
  label,
  hint,
  emphasis,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex min-w-[132px] flex-col items-center gap-2 rounded-[16px] border border-primary/30 bg-primary/5 px-4 py-3.5 text-center"
          : "flex min-w-[132px] flex-col items-center gap-2 rounded-[16px] border border-border/70 bg-secondary/40 px-4 py-3.5 text-center"
      }
    >
      <span
        className={
          emphasis
            ? "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            : "flex size-9 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-(--shadow-card)"
        }
      >
        <Icon className="size-4.5" strokeWidth={1.75} />
      </span>
      <span className="text-[13px] leading-tight font-semibold">{label}</span>
      {hint ? <span className="text-[11px] leading-tight text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex shrink-0 items-center justify-center px-1 text-muted-foreground/50 max-sm:rotate-90 max-sm:py-1">
      <ArrowRight className="size-4" strokeWidth={2} />
    </div>
  );
}

interface CostFlowStep {
  icon: LucideIcon;
  label: string;
  hint?: string;
  emphasis?: boolean;
}

const costFlowSteps: CostFlowStep[] = [
  { icon: Package, label: "Producto" },
  { icon: Factory, label: "Proveedor" },
  { icon: Receipt, label: "Cotización", hint: "Costo FOB" },
  { icon: Scale, label: "Costo nacionalizado", hint: "FOB + costos variables" },
  { icon: TrendingUp, label: "Mercado / Competencia", hint: "Precios observados" },
  { icon: FileText, label: "Presupuesto", hint: "Precio de venta del producto", emphasis: true },
];

export function RelationDiagram() {
  return (
    <div className="space-y-8">
      <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card) sm:p-8">
        <h3 className="text-base font-semibold tracking-tight">De cliente a presupuesto</h3>
        <p className="mt-1 mb-6 max-w-2xl text-sm text-muted-foreground">
          Un presupuesto siempre combina un cliente con productos del catálogo.
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-2">
          <FlowNode icon={Users} label="Cliente" hint="A quién se lo proponés" />
          <Connector />
          <FlowNode
            icon={FileText}
            label="Presupuesto"
            hint="Propuesta comercial"
            emphasis
          />
          <Connector />
          <FlowNode icon={Package} label="Productos" hint="Del catálogo" />
        </div>
      </div>

      <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card) sm:p-8">
        <h3 className="text-base font-semibold tracking-tight">De costo a precio sugerido</h3>
        <p className="mt-1 mb-6 max-w-2xl text-sm text-muted-foreground">
          Así se llega a un precio de venta informado, comparando lo que cuesta comprar contra lo
          que se observa en el mercado.
        </p>
        <div className="mx-auto flex max-w-xs flex-col items-stretch">
          {costFlowSteps.map((step, i) => (
            <div key={step.label}>
              <div
                className={
                  step.emphasis
                    ? "flex items-center gap-3.5 rounded-[16px] border border-primary/30 bg-primary/5 px-4 py-3"
                    : "flex items-center gap-3.5 rounded-[16px] border border-border/70 bg-secondary/40 px-4 py-3"
                }
              >
                <span
                  className={
                    step.emphasis
                      ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                      : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-(--shadow-card)"
                  }
                >
                  <step.icon className="size-4.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] leading-tight font-semibold">{step.label}</p>
                  {step.hint ? (
                    <p className="text-[11px] leading-tight text-muted-foreground">{step.hint}</p>
                  ) : null}
                </div>
              </div>
              {i < costFlowSteps.length - 1 ? (
                <div className="flex justify-center py-1 text-muted-foreground/40">
                  <ArrowDown className="size-4" strokeWidth={2} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
