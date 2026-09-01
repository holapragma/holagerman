"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Package, Sparkles } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const MAX_SUGGESTIONS = 6;

/**
 * Campo de nombre del ítem con autocompletado del catálogo. Escribir libremente
 * deja el ítem como manual; elegir una sugerencia lo enlaza al producto y trae
 * su precio.
 */
export function ProductPicker({
  value,
  products,
  linked,
  placeholder = "Buscar producto o escribir un ítem nuevo...",
  inputRef,
  onChange,
  onPick,
  onEnter,
}: {
  value: string;
  products: Product[];
  linked: boolean;
  placeholder?: string;
  inputRef?: (el: HTMLInputElement | null) => void;
  onChange: (value: string) => void;
  onPick: (product: Product) => void;
  onEnter?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [products, value]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (product: Product) => {
    onPick(product);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    const showing = open && suggestions.length > 0;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!showing) {
        setOpen(true);
        setHighlight(0);
        return;
      }
      setHighlight((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp" && showing) {
      event.preventDefault();
      setHighlight((current) => (current - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (showing && suggestions[highlight]) {
        pick(suggestions[highlight]);
        return;
      }
      setOpen(false);
      onEnter?.();
    }
  };

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div className="relative">
        {linked ? (
          <Package className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary" />
        ) : null}
        <Input
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onFocus={() => value.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn("h-10 rounded-[12px] text-sm", linked && "pl-9")}
        />
      </div>

      {open && suggestions.length ? (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full min-w-[260px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] border border-border/70 bg-card p-1.5 shadow-[0_8px_30px_rgb(16_24_40/0.12)]">
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onMouseEnter={() => setHighlight(index)}
              onClick={() => pick(product)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-left text-sm transition-colors",
                index === highlight ? "bg-secondary" : "hover:bg-secondary/60",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{product.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {product.category}
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums">
                {formatCurrency(product.price)}
              </span>
            </button>
          ))}
          <p className="flex items-center gap-1.5 px-3 pt-1.5 pb-1 text-[11px] text-muted-foreground">
            <Sparkles className="size-3" />
            Enter para elegir · seguí escribiendo para cargarlo como ítem manual
          </p>
        </div>
      ) : null}
    </div>
  );
}
