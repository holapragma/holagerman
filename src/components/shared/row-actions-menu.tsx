"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowAction = {
  label: string;
  icon: LucideIcon;
  variant?: "default" | "destructive";
  onClick?: () => void;
  href?: string;
  download?: boolean;
};

export function RowActionsMenu({
  actions,
  revealAt = "md",
}: {
  actions: RowAction[];
  revealAt?: "md" | "lg";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Más acciones"
          className={cn(
            "rounded-full opacity-100 transition-opacity duration-150",
            revealAt === "md"
              ? "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
          )}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={16}>
        {actions.map((action) => {
          const Icon = action.icon;
          if (action.href) {
            return (
              <DropdownMenuItem key={action.label} asChild variant={action.variant}>
                {action.download ? (
                  <a href={action.href} download>
                    <Icon className="size-4" />
                    {action.label}
                  </a>
                ) : (
                  <Link href={action.href}>
                    <Icon className="size-4" />
                    {action.label}
                  </Link>
                )}
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem
              key={action.label}
              variant={action.variant}
              onClick={action.onClick}
            >
              <Icon className="size-4" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
