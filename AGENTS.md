<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Current project state

See `CLAUDE.md` for the full project context (stack, Next.js 16.3.0 + Prisma 7 with `@prisma/adapter-pg` on PostgreSQL/Supabase, modular architecture actions → services → repositories, sequential quote numbering, edit-as-new-copy, design system, commands, conventions).

Last session completed: full UI redesign (design system, AppShell, dashboard, clientes, productos, presupuestos, competencia), quote detail with "Generar PDF", CLAUDE.md/AGENTS.md context. Verification passed: `npx tsc --noEmit` (clean), `npm run lint` (0 errors, 3 known warnings), `npm run build` (OK), smoke tests of all routes + PDF endpoint (200). Remaining warning: TanStack Table `useReactTable` incompatible-library (expected).

Session after that: migrated the DB layer from SQLite (`@prisma/adapter-better-sqlite3`) to PostgreSQL (`@prisma/adapter-pg`) to prepare for Supabase + Vercel deploy — `prisma/schema.prisma` provider, `prisma.config.ts` (now reads `DIRECT_URL` for the CLI), `src/lib/db.ts` (reads `DATABASE_URL` for the app), `package.json` deps, `.env`/`.env.example` (dual `DATABASE_URL`/`DIRECT_URL` pattern for Supabase's pooler vs. direct connection), `.gitignore` fix (`.env.example` was being excluded by `.env*`). Old SQLite migrations archived to `prisma/migrations.sqlite-archive/`; `prisma/migrations/` is empty and needs a fresh `prisma migrate dev --name init` once a real Supabase `DATABASE_URL`/`DIRECT_URL` is set — this was NOT run (no live Supabase project was created this session, code-only prep by user request). `npx tsc --noEmit` and `prisma generate` verified clean. README.md and CLAUDE.md updated with the new stack, env vars, and a full "Deploy en Vercel" walkthrough. Still pending before an actual deploy: create the Supabase project, run `prisma migrate deploy` against it, and init a standalone git repo for this directory (currently untracked, nested inside the home-level git repo).