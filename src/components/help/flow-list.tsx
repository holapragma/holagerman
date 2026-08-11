"use client";

import { useMemo, useState } from "react";
import { HelpCircle, Search } from "lucide-react";
import { helpFlows, helpModules } from "@/data/help/content";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

export function FlowList() {
  const [search, setSearch] = useState("");

  const filteredFlows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return helpFlows;
    return helpFlows.filter((flow) => flow.question.toLowerCase().includes(query));
  }, [search]);

  return (
    <div className="space-y-5">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar una tarea: “presupuesto”, “cotización”, “stock”..."
          className="rounded-full border-border/70 pr-4 pl-11 shadow-none focus-visible:shadow-none"
        />
      </div>

      {filteredFlows.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredFlows.map((flow) => {
            const relatedModule = helpModules.find((m) => m.id === flow.moduleId);
            return (
              <div
                key={flow.id}
                className="rounded-[16px] border border-border/70 bg-card p-5 shadow-(--shadow-card)"
              >
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
                  <h4 className="text-sm font-semibold tracking-tight">{flow.question}</h4>
                </div>
                <ol className="mt-3 space-y-1.5">
                  {flow.steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
                {relatedModule ? (
                  <a
                    href={`#${relatedModule.id}`}
                    className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    Ver módulo “{relatedModule.label}” →
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)">
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description={`No encontramos ninguna guía para “${search}”.`}
          />
        </div>
      )}
    </div>
  );
}
