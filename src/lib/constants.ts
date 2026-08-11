export const LOW_STOCK_THRESHOLD = 10;

export const APP_NAME = "German CRM";

export const SIDEBAR_WIDTH_EXPANDED = 260;

export const SIDEBAR_WIDTH_COLLAPSED = 76;

export const SIDEBAR_COOKIE_NAME = "sidebar_collapsed";

export const CURRENCIES = [
  "USD",
  "ARS",
  "EUR",
  "BRL",
  "UYU",
  "CLP",
  "COP",
  "MXN",
  "PYG",
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" as const },
  { href: "/clientes", label: "Clientes", icon: "Users" as const },
  { href: "/productos", label: "Productos", icon: "Package" as const },
  { href: "/proveedores", label: "Proveedores", icon: "Factory" as const },
  { href: "/presupuestos", label: "Presupuestos", icon: "FileText" as const },
  { href: "/competencia", label: "Competencia", icon: "TrendingUp" as const },
] as const;
