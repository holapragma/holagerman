"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, PackageX } from "lucide-react";
import { getProducts } from "@/app/actions/products";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Notifications() {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStock, setLowStock] = useState<
    Awaited<ReturnType<typeof getProducts>>
  >([]);

  useEffect(() => {
    getProducts().then((products) => {
      const low = products
        .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
        .slice(0, 6);
      setLowStock(low);
      setLowStockCount(low.length);
    });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-secondary/80"
          aria-label="Notificaciones"
        >
          <Bell className="size-[18px]" />
          {lowStockCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className="w-80 p-1.5"
      >
        <DropdownMenuLabel className="px-3 pt-2 pb-1 text-sm font-semibold text-foreground">
          Notificaciones
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {lowStock.length ? (
          <DropdownMenuGroup className="max-h-80 overflow-y-auto">
            {lowStock.map((p) => (
              <DropdownMenuItem key={p.id} asChild>
                <Link
                  href="/productos"
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <PackageX className="size-4 text-destructive" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {p.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Stock bajo
                    </span>
                  </span>
                  <Badge variant="destructive">{p.stock}</Badge>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Estás al día. Sin alertas.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}