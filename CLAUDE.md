@AGENTS.md

# German CRM — Documento de contexto

Este documento es la fuente de verdad funcional del proyecto. Su objetivo es que cualquier
IA (Claude Code, OpenCode, Cursor, ChatGPT, etc.) entienda **qué estamos construyendo y por
qué** antes de escribir código. No es un README técnico: es la filosofía, las reglas de
negocio y las decisiones de arquitectura del producto.

**Este archivo debe mantenerse actualizado a medida que el sistema evoluciona.** Si agregás
un módulo, cambiás una regla de negocio o tomás una decisión de arquitectura, actualizá la
sección correspondiente en el mismo cambio.

---

## Qué estamos construyendo

Un CRM moderno para pequeñas y medianas empresas.

**No es un ERP.** No buscamos cubrir cada caso de uso administrativo posible. Buscamos una
herramienta extremadamente simple, rápida e intuitiva, donde la prioridad número uno es la
experiencia del usuario.

Minimizar la cantidad de clics necesarios para cualquier operación es un objetivo de diseño
explícito, no un detalle. La interfaz debe transmitir calidad, orden y profesionalismo.

Referencias de producto e interfaz: **Linear, Stripe, Notion, Apple, Vercel**. No queremos
que esto se sienta como un sistema administrativo clásico (grillas densas, formularios
interminables, configuración excesiva).

---

## Filosofía

- La simplicidad tiene prioridad sobre la cantidad de funcionalidades.
- Toda funcionalidad debe resolver un problema real, no uno hipotético.
- Evitar configuraciones excesivas, pantallas complejas y formularios largos.
- Siempre construir el MVP más simple posible para cada problema nuevo; no diseñar de más
  para necesidades futuras.
- Cada pantalla nueva debe poder responder tres preguntas:
  1. ¿Qué está tratando de hacer el usuario?
  2. ¿Cuántos clics necesita?
  3. ¿Se puede hacer más simple?

---

## Estado actual

MVP funcional, preparado para producción. Stack:

- **Next.js 16.3.0** (App Router) + **TypeScript** estricto
- **Prisma 7.9.1** + **PostgreSQL** vía `@prisma/adapter-pg` (driver `pg`), hosteado en
  **Supabase**
- **TailwindCSS 4** + **shadcn/ui**
- **React Hook Form + Zod** para formularios/validación
- **pdf-lib** para generación de PDFs
- **TanStack Table** (solo para el data-table genérico, ver Diseño)
- **motion** (Framer Motion) para animaciones
- **Supabase Auth** (`@supabase/supabase-js` + `@supabase/ssr`) para el login
- Despliegue en **Vercel**

La migración de SQLite a PostgreSQL/Supabase ya se hizo a nivel de código (`schema.prisma`,
`prisma.config.ts`, `src/lib/db.ts`, dependencias) — como estaba previsto, tocó únicamente
la capa de repositorios/infraestructura, sin cambios en `services/` ni en la UI. Falta el
paso operativo: crear el proyecto real en Supabase, cargar las variables de entorno y
correr `prisma migrate deploy` contra esa base (ver `README.md` → sección "Deploy en
Vercel"). El historial de migraciones de la etapa SQLite quedó archivado en
`prisma/migrations.sqlite-archive/`; `prisma/migrations/` arranca de cero para Postgres.

---

## Módulos

- **Dashboard** (`/`): métricas generales, gráfico de presupuestos por mes, stock bajo,
  presupuestos y clientes recientes. Vista de arranque del día a día.
- **Clientes** (`/clientes`): CRUD de clientes (nombre, empresa, contacto, notas).
- **Productos** (`/productos`): CRUD de productos + ficha de detalle con pestañas de
  análisis y mercado (ver más abajo).
- **Presupuestos** (`/presupuestos`): armado de presupuestos a partir de cliente + productos,
  generación de PDF tipo propuesta comercial.
- **Mercado**: precios observados del mercado por producto (competencia, e-commerce, etc.),
  cargados a mano desde la ficha de cada producto. Alimenta la comparación de precio
  sugerido vs. mercado.
- **Competencia** (`/competencia`): listado propio (ítem de nav) de precios de la
  competencia por producto (`CompetitionEntry`: precio, fuente). Es un registro más simple
  y puntual que `Mercado`/`MarketObservation` (que vive dentro de la ficha de producto con
  historial y estadísticas); hoy conviven ambos modelos.
- **Proveedores** (`/proveedores`): proveedores, sus cotizaciones históricas y el
  comparador de costos/precio sugerido (ver modelo conceptual abajo).
- **Configuración** (`/configuracion`): parámetros globales de cálculo de costos (usados
  como default cuando un proveedor no define los suyos) y datos de la empresa/condiciones
  comerciales que aparecen en los presupuestos, incluida la alícuota de **IVA** (`ivaPct`
  en `CompanySettings`).

El sistema va a seguir creciendo, pero módulo por módulo, solo cuando resuelva un problema
real. No adelantar funcionalidad.

---

## Autenticación

Login con **Supabase Auth**, email + contraseña. Decisiones deliberadas, no default:

- **No hay signup.** No existe pantalla de registro ni endpoint que la exponga. Los
  usuarios se crean a mano desde el dashboard de Supabase (Authentication → Users → Add
  user), tildando **"Auto Confirm User"** para que el mail quede verificado al crearlo —
  no hay flujo de confirmación por mail ni de recuperación de contraseña todavía.
- El signup público debe estar deshabilitado en el proyecto de Supabase
  (Authentication → Sign In / Providers → "Allow new users to sign up" en off), como
  segunda barrera además de no tener UI de registro.
- Pensado para uso de un solo administrador por ahora. Si se suman usuarios, se agregan de
  la misma forma manual — no construir gestión de usuarios/roles sin necesidad concreta.
- `middleware.ts` (raíz) protege todas las rutas salvo `/login`: redirige a `/login` si no
  hay sesión, y a `/` si ya hay sesión y se intenta entrar a `/login`.
- `src/lib/supabase/server.ts` — cliente de Supabase para Server Components/Actions.
  `src/lib/supabase/middleware.ts` — refresco de sesión + redirects, usado por
  `middleware.ts`.
- `src/app/actions/auth.actions.ts` — `loginAction`/`logoutAction`, mismo patrón que el
  resto de `actions/` (Zod + `{ success, error }`).
- Todas las rutas de la app viven en el route group `src/app/(app)/`, cuyo `layout.tsx`
  envuelve con `AppShell` y obtiene el mail de la sesión server-side. `/login` queda fuera
  del grupo y no tiene sidebar.

---

## Arquitectura

Flujo estricto de una sola dirección:

```
UI (Server/Client Components)
      ↓
Server Actions   (src/app/actions/*)   — entrada HTTP, validación con Zod
      ↓
Services         (src/services/*)      — lógica de negocio
      ↓
Repositories     (src/repositories/*)  — única capa que toca Prisma
      ↓
Prisma           (src/lib/db.ts)       — adapter @prisma/adapter-pg, Postgres/Supabase
```

Reglas no negociables:

- La UI **nunca** llama a Prisma directamente. Siempre pasa por un Server Action.
- Toda lógica de negocio vive en `services/`, no en actions ni en componentes.
- `repositories/` es la única capa que importa el cliente de Prisma. Es lo único que
  cambiará cuando migremos a Postgres/Supabase.
- No duplicar un componente o servicio para resolver el mismo problema dos veces.

---

## Proveedores — modelo conceptual

El módulo de proveedores modela cómo se llega a un precio de venta sugerido a partir de una
cotización de compra:

```
Proveedor
   ↓
Cotización (fobCost, moneda, fecha — por producto)
   ↓
FOB
   ↓
+ Costos variables (nacionalización, comisión, costos financieros, envío, seguro, otros)
   ↓
= Costo Nacionalizado
   ↓
Precio sugerido
   ↓
Comparación con Mercado (precios observados del producto)
```

- Los porcentajes/valores de costos variables pueden definirse por proveedor
  (`SupplierCostConfig`) o usar los defaults globales de `Configuración` (`CostSettings`).
- **El sistema trabaja con historial: una cotización nueva nunca sobreescribe una
  anterior.** Cada `SupplierQuote` es un registro nuevo con su fecha; el comparador siempre
  puede mirar la evolución de costos en el tiempo, no solo el último valor.

---

## Mercado

Todo el ingreso de datos de mercado es **manual** (data entry desde la ficha de producto).

No construir todavía:

- Scraping de precios de la competencia
- Integraciones con APIs externas de precios
- Automatizaciones de actualización de mercado

La arquitectura (`MarketObservation` + `market.service.ts`) ya está preparada para que, en
el futuro, esas fuentes se puedan enchufar sin cambiar el modelo de datos — pero no
implementarlas antes de que haya una necesidad concreta.

---

## Presupuestos

El PDF de un presupuesto **no es una factura**. El objetivo es que se sienta y se lea como
una propuesta comercial que ayuda a vender, no como un comprobante administrativo.

Reglas de negocio:

- Los presupuestos usan un **número secuencial** (`Quote.number`, `Int @unique`) asignado
  por el repositorio como `max + 1` dentro de un `$transaction`. La UI y el PDF **nunca**
  muestran el `id` interno, siempre `quote.number`.
- **Editar un presupuesto genera una copia nueva** (`/presupuestos/[id]/editar`); el
  original se conserva intacto. Nunca se actualiza un presupuesto existente in place —
  esto preserva el historial de qué se le propuso al cliente en cada momento.
- El PDF se genera en `src/app/api/presupuestos/[id]/pdf/route.ts`, con nombre de archivo
  `Presupuesto N° {number} - {cliente}.pdf` (headers `filename` + `filename*=UTF-8''` para
  compatibilidad con acentos).
- **IVA opcional por presupuesto.** Al armar un presupuesto se elige con/sin IVA (por
  defecto, con IVA). No hay alícuota editable por presupuesto, solo el on/off — el % sale
  siempre del valor global de `Configuración`. El presupuesto guarda la alícuota aplicada
  en `Quote.ivaPct` (`null` = sin IVA) como snapshot del momento de creación, igual que las
  cotizaciones de proveedores: si el % global cambia después, los presupuestos ya emitidos
  no se recalculan.

---

## Diseño

Un único Design System para toda la app — no crear componentes distintos para resolver el
mismo problema, no romper la consistencia visual entre módulos.

- Fondo `#F6F7F9`, cards blancas `rounded-[20px]` con `shadow-(--shadow-card)`, primario
  `#0F5132` (verde), texto `#101828`.
- Botones pill (`rounded-full`, h-11 default), inputs h-11 `rounded-[14px]`, badges pill,
  modales `rounded-[20px]`.
- Fuente **Inter** (`--font-inter`), tokens centralizados en `src/app/globals.css`, modo
  claro fijo (no hay dark mode todavía).
- Componentes compartidos en `src/components/shared/` (avatar, metric-card, area-chart,
  chart-card, empty-state, search-input, data-table).
- Los listados de clientes/productos/presupuestos/competencia usan un **layout de lista
  custom** (avatar + grilla con headers uppercase + dropdown en hover + versión mobile), no
  el data-table genérico (ese queda reservado para vistas de gran volumen de datos).

---

## Convenciones

- `formatCurrency`, `formatMoney`, `formatPercent` y `formatDate`/`formatDateTime` viven en
  `src/lib/format.ts`; usar siempre esas funciones para montos, porcentajes y fechas — no
  formatear a mano.
- Mensajes al usuario en español (voseo).
- No comentar el código a menos que se pida explícitamente.
- TypeScript estricto: no usar `any` para evitar un error de tipos.

## Comandos

- `npm run dev` — dev server
- `npm run build` / `npm run lint` / `npx tsc --noEmit` — verificación
- `npx prisma migrate dev` — crea/aplica migraciones en local
- `npx prisma migrate deploy` — aplica migraciones pendientes contra Supabase (deploy)
- `npm run db:seed` — seed de datos de ejemplo
- Table Editor de Supabase, o `psql "$DIRECT_URL" -c "..."` — inspección rápida de datos

## Variables de entorno

- `DATABASE_URL` — connection string de Supabase **con pooler** (puerto 6543,
  `?pgbouncer=true`). La usa la app en runtime (`src/lib/db.ts`).
- `DIRECT_URL` — connection string **directa** de Supabase (puerto 5432, sin pooler). La usa
  el CLI de Prisma para migraciones (`prisma.config.ts`).
- Ambas salen de Supabase → Project Settings → Database → Connection string. Detalle y guía
  de deploy completa en `README.md`.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth (ver
  sección Autenticación). Salen de Supabase → Project Settings → API.

---

## Escalabilidad futura

El sistema está pensado para incorporar, en el futuro y **no ahora**:

- Facturación electrónica
- Aplicación móvil
- Inteligencia artificial
- Automatizaciones e integraciones (incluida la parte de Mercado)
- Reportes avanzados

No empezar a construir nada de esto sin que haya una necesidad concreta y validada.

---

## Reglas para colaborar

Antes de modificar código:

1. Analizar el impacto — ¿qué otras pantallas o flujos usan esto?
2. Evitar romper funcionalidad existente.
3. No duplicar componentes ni servicios.
4. No generar deuda técnica ni dejar implementaciones a medio terminar.
5. Mantener TypeScript estricto.

Antes de dar por terminado cualquier cambio, correr:

```
npx tsc --noEmit
npm run lint
npm run build
```

---

## Objetivo final

Construir uno de los mejores CRM para pequeñas empresas: simple, moderno, escalable, muy
rápido, con una experiencia comparable a la de un SaaS internacional.
