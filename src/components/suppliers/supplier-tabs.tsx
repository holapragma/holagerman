"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SupplierTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/proveedores",
      label: "Lista de proveedores",
      icon: Factory,
      exact: true,
    },
    {
      href: "/proveedores/comparador",
      label: "Comparador de costos",
      icon: TrendingUp,
      exact: false,
    },
  ];

  return (
    <div className="mb-6 flex w-full items-center gap-1.5 overflow-x-auto rounded-full border border-border/70 bg-card p-1.5 shadow-(--shadow-card) sm:inline-flex sm:w-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
