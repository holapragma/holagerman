"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/types";
import { deleteClientAction } from "@/app/actions/clients";
import { useDebouncedValue } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ClientsPageClient({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredClients = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query),
    );
  }, [clients, debouncedSearch]);

  const handleDelete = () => {
    if (!deletingClient) return;
    startTransition(async () => {
      const result = await deleteClientAction(deletingClient.id);
      if (result.success) {
        toast.success("Cliente eliminado");
        setDeletingClient(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gestioná tu cartera de clientes y contactos comerciales."
        action={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingClient(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="size-4" />
                Nuevo cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Editar cliente" : "Nuevo cliente"}
                </DialogTitle>
              </DialogHeader>
              <ClientForm
                client={editingClient ?? undefined}
                onSuccess={() => {
                  setDialogOpen(false);
                  setEditingClient(null);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, empresa, email..."
        />
        <p className="text-sm text-muted-foreground">
          {filteredClients.length} de {clients.length} clientes
        </p>
      </div>

      {filteredClients.length ? (
        <motion.div
          key={debouncedSearch}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <div className="hidden grid-cols-[1fr_1.2fr_1fr_48px] gap-4 border-b border-border/70 bg-secondary/40 px-6 py-3.5 md:grid">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contacto
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Teléfono
            </span>
            <span />
          </div>

          <ul className="divide-y divide-border/60">
            {filteredClients.map((client) => (
              <li key={client.id} className="group">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/40 sm:px-6 md:grid-cols-[1fr_1.2fr_1fr_48px]">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={client.name} />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium">{client.name}</p>
                      <p className="truncate text-xs text-muted-foreground md:hidden">
                        {client.company || client.email || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="hidden min-w-0 md:block">
                    {client.email ? (
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="size-3.5 shrink-0 opacity-60" />
                        <span className="truncate">{client.email}</span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">—</span>
                    )}
                    {client.company ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground/80">
                        {client.company}
                      </p>
                    ) : null}
                  </div>

                  <div className="hidden md:flex">
                    {client.phone ? (
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="size-3.5 shrink-0 opacity-60" />
                        {client.phone}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">—</span>
                    )}
                  </div>

                  <RowActionsMenu
                    actions={[
                      {
                        label: "Editar",
                        icon: Pencil,
                        onClick: () => {
                          setEditingClient(client);
                          setDialogOpen(true);
                        },
                      },
                      {
                        label: "Eliminar",
                        icon: Trash2,
                        variant: "destructive",
                        onClick: () => setDeletingClient(client),
                      },
                    ]}
                  />
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : (
        <motion.div
          key={debouncedSearch}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="rounded-(--radius-card) border border-border/70 bg-card shadow-(--shadow-card)"
        >
          <EmptyState
            icon={Users}
            title={search ? "Sin resultados" : "Todavía no tenés clientes"}
            description={
              search
                ? `No se encontraron clientes para “${debouncedSearch}”.`
                : "Registrá tu primer cliente para comenzar."
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="size-4" />
                  Nuevo cliente
                </Button>
              )
            }
          />
        </motion.div>
      )}

      <div className="mt-8 flex justify-center md:hidden">
        <Button
          className="h-12 w-full rounded-full text-[15px]"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-5" />
          Nuevo cliente
        </Button>
      </div>

      <AlertDialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará{" "}
              <strong>{deletingClient?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}