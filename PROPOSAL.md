# German CRM

Aplicación web moderna para la gestión comercial de pequeñas empresas. Preparada para base de datos en Supabase PostgreSQL y deploy en Vercel.

## Stack

- **Next.js 16** (App Router) + TypeScript estricto
- **TailwindCSS 4** + **shadcn/ui** (diseño minimalista tipo Apple)
- **React Hook Form** + **Zod** (formularios y validación)
- **Prisma 7** + **PostgreSQL** (Supabase, driver adapter `@prisma/adapter-pg`)
- **TanStack Table** (tablas)
- **pdf-lib** (generador de presupuestos en PDF)

## Módulos

| Módulo       | Descripción                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| Dashboard    | Clientes, productos, presupuestos y stock bajo.                              |
| Clientes     | CRUD completo con búsqueda.                                                  |
| Productos    | CRUD completo con categoría, precio, stock y foto opcional.                  |
| Presupuestos | Constructor con cliente + catálogo, cantidades y precios editables, notas y PDF. |
| Competencia  | Seguimiento manual de precios de la competencia, preparada para automatizar. |

## Arquitectura

Capa de datos desacoplada para facilitar la migración a Supabase:

```
src/
├── app/            # Páginas, Route Handlers y Server Actions
│   ├── actions/    # Server Actions (capa de entrada) validadas con Zod
│   └── api/        # API routes (ej: /api/presupuestos/[id]/pdf)
├── components/     # UI (shadcn/ui) + componentes de página
│   ├── ui/         # Componentes base reutilizables
│   ├── layout/     # App shell, navegación
│   ├── shared/     # DataTable, SearchInput, StatCard
│   ├── clients/    # CRUD de clientes
│   ├── products/   # CRUD de productos
│   ├── quotes/     # Construcción de presupuestos
│   └── competition/# CRUD de competencia
├── repositories/   # Acceso a datos (Prisma) — único punto que usa la DB
├── services/       # Lógica de negocio (depende de repositorios)
├── lib/            # Utilidades, validaciones (Zod), config de PrismaClient
└── types/          # Tipos compartidos
```

La migración a Supabase solo tocó la capa de datos (adapter de Prisma en `src/lib/db.ts` y `provider` en `schema.prisma`). Los servicios, acciones, UI y lógica de negocio no se vieron afectados.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar DATABASE_URL / DIRECT_URL con los de tu proyecto Supabase
npx prisma migrate dev   # aplica la migración inicial
npm run db:seed          # datos de prueba opcional
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

> Si el puerto 3000 está ocupado, Next.js usa 3001 automáticamente.

## Scripts

| Comando              | Descripción                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`         | Servidor de desarrollo (Turbopack)        |
| `npm run build`       | Build de producción                       |
| `npm run start`       | Servir el build                           |
| `npm run lint`        | ESLint                                    |
| `npm run db:generate` | Generar cliente de Prisma                 |
| `npm run db:migrate`  | Aplicar/crear migraciones                 |
| `npm run db:seed`     | Cargar datos de datos de prueba           |
| `npm run db:studio`   | Abrir Prisma Studio                       |

## Seed

El seed crea: 3 clientes, 5 productos, 1 presupuesto con 3 líneas y 3 registros de competencia. De modalidad reemplaza tablas (idempotente): borra y regra los datos.

## Deploy

Guía completa paso a paso (crear proyecto en Supabase, connection strings, variables de entorno en Vercel) en `README.md` → sección "Deploy en Vercel".
