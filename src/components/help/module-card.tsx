import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import type { HelpModule } from "@/data/help/content";

function SubsectionCard({
  subsection,
}: {
  subsection: NonNullable<HelpModule["subsections"]>[number];
}) {
  return (
    <div className="rounded-[16px] border border-border/70 bg-secondary/30 p-5">
      <h4 className="text-sm font-semibold tracking-tight">{subsection.title}</h4>
      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
        {subsection.whereToFind}
      </p>

      <ul className="mt-4 space-y-1.5">
        {subsection.actions.map((action) => (
          <li key={action} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2} />
            <span className="text-foreground/90">{action}</span>
          </li>
        ))}
      </ul>

      {subsection.steps ? (
        <ol className="mt-4 space-y-1.5">
          {subsection.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {subsection.notes?.length ? (
        <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
          {subsection.notes.map((note) => (
            <p key={note} className="text-xs leading-relaxed text-muted-foreground">
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ModuleCard({ module: m }: { module: HelpModule }) {
  const Icon = m.icon;

  return (
    <section id={m.id} className="scroll-mt-24">
      <div className="rounded-(--radius-card) border border-border/70 bg-card p-6 shadow-(--shadow-card) sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-(--shadow-brand)">
              <Icon className="size-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{m.label}</h2>
              <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {m.tagline}
              </p>
            </div>
          </div>
          <Link
            href={m.href}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-border/70 px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary/70 sm:self-auto"
          >
            Ir a {m.label}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Dónde lo encontrás
            </h3>
            <p className="flex items-start gap-2 text-sm text-foreground/90">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              {m.whereToFind}
            </p>

            <h3 className="mt-6 mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Qué podés hacer
            </h3>
            <ul className="space-y-1.5">
              {m.actions.map((action) => (
                <li key={action} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2} />
                  <span className="text-foreground/90">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Cómo usarlo
            </h3>
            <ol className="space-y-2">
              {m.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {m.notes.length ? (
          <div className="mt-6 space-y-2 rounded-[14px] border border-border/60 bg-secondary/30 p-4">
            <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Información importante
            </h3>
            {m.notes.map((note) => (
              <p key={note} className="text-sm leading-relaxed text-foreground/80">
                {note}
              </p>
            ))}
          </div>
        ) : null}

        {m.subsections?.length ? (
          <div className="mt-6 space-y-4">
            {m.subsections.map((sub) => (
              <SubsectionCard key={sub.title} subsection={sub} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
