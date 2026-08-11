"use client";

import { cn } from "@/lib/utils";

export interface HelpNavItem {
  id: string;
  label: string;
}

export function HelpNav({
  items,
  activeId,
}: {
  items: HelpNavItem[];
  activeId: string;
}) {
  return (
    <>
      {/* Desktop: sticky vertical index */}
      <nav
        aria-label="Índice del manual"
        className="hidden max-h-[calc(100vh-7rem)] w-56 shrink-0 space-y-0.5 overflow-y-auto lg:sticky lg:top-24 lg:block"
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
              activeId === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Mobile / tablet: horizontal scroll pills */}
      <nav
        aria-label="Índice del manual"
        className="sticky top-16 z-10 -mx-4 mb-6 flex gap-1.5 overflow-x-auto border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden"
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
              activeId === item.id
                ? "bg-primary text-primary-foreground"
                : "border border-border/70 text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
