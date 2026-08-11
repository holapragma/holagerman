# German CRM

CRM de gestión comercial (clientes, productos, presupuestos, competencia, proveedores) construido con Next.js 16 (App Router) y Prisma 7 sobre PostgreSQL (Supabase), con arquitectura por capas y deploy en Vercel.

---

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/) estricto
- [Prisma 7](https://www.prisma.io/) + PostgreSQL (`@prisma/adapter-pg`, driver `pg`) — hosteado en [Supabase](https://supabase.com/)
- [TailwindCSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [TanStack Table](https://tanstack.com/table)
- [motion](https://motion.dev/) (Framer Motion)
- [pdf-lib](https://pdf-lib.js.org/)
- [Supabase Auth](https://supabase.com/auth) (`@supabase/supabase-js` + `@supabase/ssr`) — login
- Deploy: [Vercel](https://vercel.com/)

> ⚠️ Este proyecto usa Next.js 16, una versión reciente con cambios respecto a versiones anteriores. Ver `node_modules/next/dist/docs/` antes de asumir comportamiento de versiones previas.

---

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (probado con v22)
- npm
- Git
- Un proyecto de [Supabase](https://supabase.com/dashboard) (gratis para desarrollo)

---

## Instalación

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd german-crm
npm install
```

### 2. Crear el proyecto en Supabase

Si todavía no existe: [supabase.com/dashboard](https://supabase.com/dashboard/) → **New Project**. Guardar la contraseña de la base al crearla.

### 3. Configurar `.env`

```bash
cp .env.example .env
```

Completar las 4 variables (ver detalle en [Variables de entorno](#variables-de-entorno)):

- `DATABASE_URL` / `DIRECT_URL` — Project Settings → Database → Connection string.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API.

### 4. Crear las tablas

El SQL de la migración inicial ya está generado en `prisma/migrations/20260811000000_init/migration.sql` (todas las tablas usan el prefijo `german_crm_`). Dos formas de aplicarlo:

- **Manual (recomendado):** pegar el contenido de ese archivo en el **SQL Editor** del dashboard de Supabase y ejecutarlo. Después, para que Prisma no intente recrearla en el futuro:
  ```bash
  npx prisma migrate resolve --applied 20260811000000_init
  ```
- **Con el CLI de Prisma:**
  ```bash
  npx prisma migrate deploy
  ```

### 5. Crear el usuario y desactivar el registro público

No hay pantalla de signup — los usuarios se crean a mano desde Supabase:

1. **Authentication → Sign In / Providers** → apagar **"Allow new users to sign up"**.
2. **Authentication → Users → Add user**: cargar tu email y contraseña, tildando **"Auto Confirm User"** (así el mail queda verificado, sin flujo de confirmación).

### 6. Datos de prueba y arranque

```bash
npm run db:seed   # opcional: datos de prueba
npm run dev
```

La app queda disponible en [http://localhost:3000](http://localhost:3000) (Next.js usa el siguiente puerto libre si el 3000 está ocupado). Vas a ser redirigido a `/login`; ingresá con el usuario que creaste en el paso 5.

---

## Variables de entorno

Definidas en `.env` (ver `.env.example`).

| Variable                        | Descripción                                                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                   | Connection string **con pooler** (pgbouncer, puerto `6543`, `?pgbouncer=true`). La usa la app en runtime (`src/lib/db.ts`) — necesaria en Vercel por el límite de conexiones concurrentes de las funciones serverless. Sale de Project Settings → Database → Connection string. |
| `DIRECT_URL`                     | Connection string **directa**, sin pooler (puerto `5432`). La usa el CLI de Prisma para migraciones (`prisma migrate dev/deploy`, `prisma studio`) — el pooler en modo transacción no soporta esos comandos. Mismo lugar que `DATABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_URL`       | URL del proyecto de Supabase, usada por Supabase Auth. Sale de Project Settings → API → Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Clave pública (anon) del proyecto, usada por Supabase Auth. Sale de Project Settings → API → anon public key. |

`prisma.config.ts` carga `.env` explícitamente vía `dotenv/config` (Prisma 7 no lo hace automáticamente) y usa `DIRECT_URL` para el CLI; `src/lib/db.ts` usa `DATABASE_URL` para el cliente de la app.

En **Vercel**, configurar las 4 variables en Project Settings → Environment Variables (ver sección [Deploy](#deploy-en-vercel)).

---

## Scripts disponibles

| Comando               | Descripción                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`           | Servidor de desarrollo                            |
| `npm run build`         | Build de producción                               |
| `npm run start`         | Sirve el build de producción                      |
| `npm run lint`          | ESLint                                            |
| `npx tsc --noEmit`      | Chequeo de tipos sin emitir output                |
| `npm run db:generate`   | Genera el cliente de Prisma (`postinstall` ya lo corre) |
| `npm run db:migrate`    | Crea/aplica migraciones (`prisma migrate dev`)    |
| `npm run db:seed`       | Carga datos de prueba (`prisma/seed.ts`, reemplaza tablas) |
| `npm run db:studio`     | Abre Prisma Studio                                |

---

## Arquitectura

Flujo de una sola dirección, sin capas cruzadas:

```
UI (Server/Client Components)
      │
      ▼
Server Actions      src/app/actions/*      entrada HTTP, validación con Zod
      │
      ▼
Services             src/services/*         lógica de negocio
      │
      ▼
Repositories          src/repositories/*     única capa que importa Prisma
      │
      ▼
Prisma Client         src/lib/db.ts          adapter @prisma/adapter-pg
      │
      ▼
PostgreSQL (Supabase)
```

Estructura de `src/`:

```
src/
├── app/
│   ├── (app)/           # Rutas protegidas: dashboard, clientes, productos, presupuestos,
│   │                     # competencia, proveedores, configuracion, ayuda — layout.tsx
│   │                     # envuelve con AppShell y trae la sesión
│   ├── login/            # Login (fuera del grupo (app), sin sidebar)
│   ├── actions/          # Server Actions (una por dominio: clients, products, quotes, auth...)
│   ├── api/               # Route Handlers (ej. /api/presupuestos/[id]/pdf)
│   ├── layout.tsx, globals.css
├── components/
│   ├── ui/                # Primitivas shadcn/ui
│   ├── layout/             # AppShell, navegación
│   ├── shared/              # DataTable, SearchInput, MetricCard, AreaChart, etc.
│   ├── auth/                # Formulario de login
│   └── clients/ products/ quotes/ competition/ suppliers/ settings/   # componentes por dominio
├── services/              # Lógica de negocio (pdf, dashboard, cost, market, etc.)
├── repositories/          # Acceso a datos vía Prisma Client
├── lib/
│   ├── supabase/           # Clientes de Supabase Auth (server.ts, middleware.ts)
│   └── db.ts, format.ts, validations/, utils.ts, constants.ts
├── generated/prisma/       # Cliente Prisma generado (gitignored)
└── types/                 # Tipos compartidos
```

Otros directorios/archivos relevantes en la raíz:

- `middleware.ts` — protege todas las rutas salvo `/login` (redirige según haya o no sesión)
- `prisma/` — `schema.prisma`, migraciones (`prisma/migrations/`), `seed.ts`
- `public/` — assets estáticos

---

## Convenciones

- TypeScript estricto en todo el proyecto.
- La UI **nunca** accede a Prisma directamente; siempre pasa por un Server Action.
- Toda la lógica de negocio vive en `services/`, no en actions ni en componentes.
- `repositories/` es la única capa que importa el cliente de Prisma.
- `formatCurrency` y `formatDate` (`src/lib/format.ts`) se usan siempre para montos y fechas, no formateo ad hoc.
- Validación de formularios y de Server Actions con Zod (`src/lib/validations/`).

---

## Autenticación

Login con Supabase Auth (email + contraseña). Decisiones deliberadas:

- **No hay signup.** No existe pantalla de registro. Los usuarios se crean a mano desde el dashboard de Supabase (ver paso 5 de [Instalación](#5-crear-el-usuario-y-desactivar-el-registro-público)).
- El registro público debe estar deshabilitado en el proyecto de Supabase, como segunda barrera además de no tener UI de registro.
- Pensado para un solo administrador por ahora; usuarios adicionales se agregan de la misma forma manual.
- `middleware.ts` protege todas las rutas salvo `/login`.
- `src/lib/supabase/server.ts` — cliente para Server Components/Actions. `src/lib/supabase/middleware.ts` — refresco de sesión + redirects.
- `src/app/actions/auth.actions.ts` — `loginAction`/`logoutAction`, mismo patrón Zod que el resto de `actions/`.

---

## Design System

- Fondo de página `#F6F7F9`, texto `#101828` (modo claro fijo, sin dark mode).
- Primario `#0F5132` (verde).
- Tokens de color en formato CSS variables (`--background`, `--primary`, `--card`, `--border`, etc.), definidos en `src/app/globals.css` y expuestos a Tailwind vía `@theme`.
- Cards blancas, `rounded-[20px]`, con `shadow-(--shadow-card)`.
- Botones tipo pill (`rounded-full`), altura `h-11` por defecto.
- Inputs `h-11 rounded-[14px]`.
- Badges pill, modales `rounded-[20px]`.
- Tipografía: **Inter**, expuesta como `--font-inter`.
- Escala de radios (`--radius-xs` a `--radius-4xl`) derivada de un único `--radius` base.

---

## Base de datos

Modelos definidos en `prisma/schema.prisma` (provider `postgresql`, generador `prisma-client`):

| Modelo               | Descripción técnica                                                        |
| --------------------- | ---------------------------------------------------------------------------- |
| `Client`               | Clientes. Relación 1-N con `Quote`.                                          |
| `Product`              | Productos/catálogo. Relación 1-N con `QuoteItem`, `CompetitionEntry`, `SupplierQuote`, `MarketObservation`. |
| `Quote`                | Presupuestos. `number` es `Int @unique` (secuencial). Relación N-1 con `Client`, 1-N con `QuoteItem`. |
| `QuoteItem`            | Líneas de un presupuesto. Relación N-1 con `Quote` y `Product`.               |
| `CompetitionEntry`     | Precios de competencia por producto.                                          |
| `Supplier`              | Proveedores. Relación 1-1 con `SupplierCostConfig`, 1-N con `SupplierQuote`.  |
| `SupplierCostConfig`    | Configuración de costos por proveedor (opcional, override de `CostSettings`). |
| `SupplierQuote`         | Cotizaciones históricas de proveedores por producto.                          |
| `MarketObservation`     | Precios observados en el mercado por producto.                                |
| `CostSettings`          | Configuración global de costos (singleton, `id: "global"`).                   |
| `CompanySettings`       | Datos de la empresa usados en presupuestos (singleton, `id: "global"`).       |

Todos los modelos usan `id String @default(cuid())` y mapean (`@@map`) a tablas `snake_case` con prefijo **`german_crm_`** (ej. `german_crm_clients`, `german_crm_supplier_quotes`). Los nombres de columnas se mapean a `camelCase` en el cliente de Prisma.

Inspección rápida de datos: desde el [Table Editor](https://supabase.com/dashboard/project/_/editor) de Supabase, o con `psql "$DIRECT_URL" -c "SELECT * FROM german_crm_clients;"`.

> `prisma/migrations.sqlite-archive/` contiene el historial de migraciones de la etapa previa en SQLite (referencia, ya no se aplica). El historial de Postgres arranca desde cero en `prisma/migrations/`.

---

## Deploy en Vercel

El repo vive en [github.com/pragmastudi0/german-crm](https://github.com/pragmastudi0/german-crm) — Vercel puede importarlo directamente por integración Git.

1. **Crear el proyecto en Supabase** (si no existe): [supabase.com/dashboard](https://supabase.com/dashboard/) → New Project. Guardar la contraseña de la base al crearlo.
2. **Obtener las connection strings**: Project Settings → Database → Connection string → copiar la variante **Transaction pooler** (puerto `6543`, para `DATABASE_URL`) y la **Direct connection** (puerto `5432`, para `DIRECT_URL`).
3. **Crear las tablas y el usuario** — ver pasos 4 y 5 de [Instalación](#4-crear-las-tablas): pegar `prisma/migrations/20260811000000_init/migration.sql` en el SQL Editor de Supabase (o `npx prisma migrate deploy`), desactivar el registro público y crear el usuario admin.
4. **Importar el repo en Vercel**: [vercel.com/new](https://vercel.com/new) → seleccionar el repo. Next.js se detecta automáticamente (build command `next build`, sin configuración adicional).
5. **Variables de entorno en Vercel** (Project Settings → Environment Variables, para Production/Preview/Development):
   - `DATABASE_URL` — connection string con pooler
   - `DIRECT_URL` — connection string directa
   - `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → anon public key
6. **Deploy.** El `postinstall` (`prisma generate`) corre automáticamente en el build de Vercel; como el cliente usa driver adapters (`@prisma/adapter-pg`), no depende de binarios de motor de Prisma, lo que es compatible con el runtime serverless de Vercel sin configuración extra.

Para cambios de schema posteriores al primer deploy: generar la migración en local (`npx prisma migrate dev --name <nombre>`), commitear `prisma/migrations/`, y correr `npx prisma migrate deploy` contra Supabase antes o después de cada deploy (no se corre automáticamente en el build de Vercel).

---

## Roadmap técnico

- Aplicación móvil.
- Funcionalidades de **IA** y **automatizaciones** sobre el CRM.
- Reportes avanzados y facturación electrónica.

---

## Contribución

```bash
git checkout -b feature/nombre-descriptivo
```

Antes de subir cambios, correr:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Abrir un Pull Request contra `main` con una descripción clara del cambio y, si aplica, capturas de pantalla.

---

## Licencia

Proyecto privado (`"private": true` en `package.json`). No tiene licencia open source asignada.
