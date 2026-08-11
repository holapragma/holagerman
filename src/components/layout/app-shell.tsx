"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Factory,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  APP_NAME,
  NAV_ITEMS,
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "@/lib/constants";
import { Avatar } from "@/components/shared/avatar";
import { GlobalSearch } from "@/components/layout/global-search";
import { Notifications } from "@/components/layout/notifications";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap = {
  LayoutDashboard,
  Users,
  Package,
  Factory,
  FileText,
  TrendingUp,
  Settings,
  HelpCircle,
};

const EASE = [0.22, 1, 0.36, 1] as const;

function CollapsedTooltip({
  collapsed,
  label,
  children,
}: {
  collapsed: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {collapsed ? <TooltipContent side="right">{label}</TooltipContent> : null}
    </Tooltip>
  );
}

function FadeLabel({
  show,
  className,
  children,
}: {
  show: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn("min-w-0", className)}
        >
          {children}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3",
        collapsed && "justify-center px-0",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-primary text-sm font-semibold text-primary-foreground shadow-(--shadow-brand)">
        <span className="-mt-px">G</span>
      </div>
      <FadeLabel show={!collapsed}>
        <p className="truncate text-[15px] leading-tight font-semibold tracking-tight">
          {APP_NAME}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          Gestión comercial
        </p>
      </FadeLabel>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: keyof typeof iconMap;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const Icon = iconMap[icon] || LayoutDashboard;
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <CollapsedTooltip collapsed={collapsed} label={label}>
      <Link
        href={href}
        onClick={onClick}
        aria-label={collapsed ? label : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-primary text-primary-foreground shadow-(--shadow-nav-active)"
            : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
        )}
      >
        <Icon
          className={cn(
            "size-[17px] shrink-0 transition-transform duration-200 group-hover:scale-110",
            !isActive && "opacity-80",
          )}
          strokeWidth={1.75}
        />
        <FadeLabel show={!collapsed} className="truncate">
          {label}
        </FadeLabel>
      </Link>
    </CollapsedTooltip>
  );
}

function SidebarContent({
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-x-hidden overflow-y-auto">
      <div className="px-3 py-7">
        <Brand collapsed={collapsed} />
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <div className="mx-3 mb-2 space-y-1">
        <NavLink
          href="/configuracion"
          label="Configuración"
          icon="Settings"
          collapsed={collapsed}
          onClick={onNavigate}
        />
        <NavLink
          href="/ayuda"
          label="Manual de uso"
          icon="HelpCircle"
          collapsed={collapsed}
          onClick={onNavigate}
        />
      </div>

      <div className="border-t border-sidebar-border p-3">
        {onToggle ? (
          <CollapsedTooltip
            collapsed={collapsed}
            label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            <button
              type="button"
              onClick={onToggle}
              aria-label={
                collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
              }
              aria-expanded={!collapsed}
              className={cn(
                "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-[17px] shrink-0 opacity-80" strokeWidth={1.75} />
              ) : (
                <PanelLeftClose className="size-[17px] shrink-0 opacity-80" strokeWidth={1.75} />
              )}
              <FadeLabel show={!collapsed}>Colapsar</FadeLabel>
            </button>
          </CollapsedTooltip>
        ) : null}

        <CollapsedTooltip collapsed={collapsed} label="Administrador">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-2 py-2",
              collapsed && "justify-center px-0",
            )}
          >
            <Avatar name="Administrador" />
            <FadeLabel show={!collapsed} className="min-w-0">
              <p className="truncate text-[13px] font-medium">Administrador</p>
              <p className="truncate text-xs text-muted-foreground">
                german@local
              </p>
            </FadeLabel>
          </div>
        </CollapsedTooltip>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <motion.aside
          initial={false}
          animate={{
            width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
          }}
          transition={{ duration: 0.25, ease: EASE }}
          className="sticky top-0 z-30 hidden h-screen shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar lg:block"
        >
          <SidebarContent collapsed={collapsed} onToggle={toggleCollapsed} />
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-(--shell-max-width) items-center gap-3 px-4 sm:px-6 lg:px-10">
              <div className="lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label="Abrir menú"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[280px] border-r border-border/70 p-0"
                  >
                    <SidebarContent onNavigate={() => setOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="hidden flex-1 sm:block">
                <GlobalSearch />
              </div>

              <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
                <div className="sm:hidden">
                  <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label="Buscar"
                      onClick={() => setMobileSearchOpen(true)}
                    >
                      <Search className="size-[18px]" />
                    </Button>
                    <DialogContent className="top-6 max-h-[calc(100vh-3rem)] translate-y-0 sm:max-w-lg">
                      <DialogTitle>Buscar</DialogTitle>
                      <GlobalSearch
                        autoFocus
                        variant="inline"
                        onNavigate={() => setMobileSearchOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <Notifications />
                <button
                  type="button"
                  className="group ml-1 flex items-center gap-2 rounded-full p-1 pr-1 transition-colors hover:bg-secondary/70"
                  aria-label="Cuenta de usuario"
                >
                  <Avatar name="Administrador" className="size-8 text-[10px]" />
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-(--shell-max-width) px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
