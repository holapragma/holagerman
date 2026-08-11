import { ClientsPageClient } from "@/components/clients/clients-page-client";
import { clientService } from "@/services/client.service";

export default async function ClientesPage() {
  const clients = await clientService.list();

  return <ClientsPageClient clients={clients} />;
}
