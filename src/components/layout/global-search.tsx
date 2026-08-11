"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, Users } from "lucide-react";import { getProducts } from "@/app/actions/products";
import { getClients } from "@/app/actions/clients";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";

export function GlobalSearch({
  autoFocus = false,
  variant = "floating",
  onNavigate,
}: {
  autoFocus?: boolean;
  variant?: "floating" | "inline";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 250);
  const [clients, setClients] = useState<Awaited<ReturnType<typeof getClients>>>([]);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = debounced.trim();
      if (!q) {
        setClients([]);
        setProducts([]);
        setLoading(false);
        setOpen(false);
        return;
      }
      setLoading(true);
      const [c, p] = await Promise.all([getClients(q), getProducts(q)]);
      if (cancelled) return;
      setClients(c);
      setProducts(p);
      setLoading(false);
      setOpen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(href);
  };

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => (query.trim() ? setOpen(true) : setOpen(false))}
        placeholder="Buscar clientes, productos..."
        autoFocus={autoFocus}
        className="h-10 rounded-full border-border/70 bg-card pr-4 pl-11 shadow-[0_1px_2px_rgb(16_24_40/0.03)]"
      />

      {open ? (
        <div
          className={cn(
            "z-50 overflow-hidden rounded-[16px] border border-border/70 bg-card p-1.5 shadow-[0_8px_30px_rgb(16_24_40/0.12),0_24px_60px_-24px_rgb(16_24_40/0.22)]",
            variant === "floating"
              ? "absolute inset-x-0 top-[calc(100%+8px)]"
              : "mt-2",
          )}
        >
          {loading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : products.length || clients.length ? (
            <div className="max-h-80 overflow-y-auto">
              {clients.length ? (
                <ResultGroup label="Clientes" icon={Users}>
                  {clients.slice(0, 4).map((c) => (
                    <ResultRow
                      key={c.id}
                      title={c.name}
                      subtitle={c.company ?? c.email ?? ""}
                      onClick={() => go("/clientes")}
                    />
                  ))}
                </ResultGroup>
              ) : null}
              {products.length ? (
                <ResultGroup label="Productos" icon={Package}>
                  {products.slice(0, 4).map((p) => (
                    <ResultRow
                      key={p.id}
                      title={p.name}
                      subtitle={p.category}
                      onClick={() => go("/productos")}
                    />
                  ))}
                </ResultGroup>
              ) : null}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Sin resultados para “{debounced.trim()}”
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-1">
      <div className="flex items-center gap-2 px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary/70"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <ArrowRightIcon />
    </button>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="size-4 text-muted-foreground/60"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 4l5 5-5 5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}