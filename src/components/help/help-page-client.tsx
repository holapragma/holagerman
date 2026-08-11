"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Compass, Lightbulb, Sparkles } from "lucide-react";
import {
  helpConcepts,
  helpModules,
  quickStartSteps,
} from "@/data/help/content";
import { PageHeader } from "@/components/layout/page-header";
import { HelpNav, type HelpNavItem } from "@/components/help/help-nav";
import { ModuleCard } from "@/components/help/module-card";
import { RelationDiagram } from "@/components/help/relation-diagram";
import { FlowList } from "@/components/help/flow-list";

const NAV_ITEMS: HelpNavItem[] = [
  { id: "primeros-pasos", label: "Primeros pasos" },
  ...helpModules.map((m) => ({ id: m.id, label: m.label })),
  { id: "relacion", label: "Relación entre módulos" },
  { id: "conceptos", label: "Conceptos importantes" },
  { id: "guias", label: "Guías rápidas" },
];

export function HelpPageClient() {
  const [activeId, setActiveId] = useState(NAV_ITEMS[0].id);

  useEffect(() => {
    const elements = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PageHeader
        title="Manual de uso"
        description="Aprendé a utilizar el CRM y encontrá rápidamente dónde hacer cada cosa."
      />

      <div className="lg:flex lg:items-start lg:gap-10">
        <HelpNav items={NAV_ITEMS} activeId={activeId} />

        <div className="min-w-0 flex-1 space-y-14">
          <motion.section
            id="primeros-pasos"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="scroll-mt-24"
          >
            <SectionTitle
              icon={Compass}
              title="Primeros pasos"
              description="El orden recomendado para dejar el sistema listo para trabajar."
            />
            <ol className="mt-6 space-y-3">
              {quickStartSteps.map((step, i) => {
                const relatedModule = helpModules.find((m) => m.id === step.moduleId);
                return (
                  <li
                    key={step.title}
                    className="flex items-start gap-4 rounded-[16px] border border-border/70 bg-card p-4 shadow-(--shadow-card) sm:items-center sm:p-5"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold tracking-tight">{step.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {relatedModule ? (
                      <a
                        href={`#${relatedModule.id}`}
                        className="hidden shrink-0 text-xs font-medium text-primary hover:underline sm:block"
                      >
                        Ver más →
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </motion.section>

          {helpModules.map((m) => (
            <ModuleCard key={m.id} module={m} />
          ))}

          <section id="relacion" className="scroll-mt-24">
            <SectionTitle
              icon={Sparkles}
              title="Relación entre módulos"
              description="Así se conecta la información entre las distintas secciones del CRM."
            />
            <div className="mt-6">
              <RelationDiagram />
            </div>
          </section>

          <section id="conceptos" className="scroll-mt-24">
            <SectionTitle
              icon={Lightbulb}
              title="Conceptos importantes"
              description="Distinciones que pueden generar confusión si no se aclaran una vez."
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {helpConcepts.map((concept) => (
                <div
                  key={concept.id}
                  className="rounded-[16px] border border-border/70 bg-card p-5 shadow-(--shadow-card)"
                >
                  <h4 className="text-sm font-semibold tracking-tight">{concept.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {concept.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="guias" className="scroll-mt-24 pb-4">
            <SectionTitle
              icon={CheckCircle2}
              title="¿Cómo hago...?"
              description="Buscá una tarea concreta y seguí los pasos."
            />
            <div className="mt-6">
              <FlowList />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Compass;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
        <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
