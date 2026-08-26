import { notFound } from "next/navigation";
import { QuoteBuilderClient } from "@/components/quotes/quote-builder-client";
import { quoteService } from "@/services/quote.service";
import { clientService } from "@/services/client.service";
import { productService } from "@/services/product.service";
import { companyService } from "@/services/company.service";
import { companySettingsRepository } from "@/repositories/company-settings.repository";

export default async function EditarPresupuestoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, clients, products, companies, companySettings] = await Promise.all([
    quoteService.getById(id),
    clientService.list(),
    productService.list(),
    companyService.listActive(),
    companySettingsRepository.toConfig(),
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <QuoteBuilderClient
      clients={clients}
      products={products}
      companies={companies}
      defaultIvaPct={companySettings.ivaPct}
      initialQuote={{
        originalNumber: quote.number,
        clientId: quote.clientId,
        companyId: quote.companyId,
        notes: quote.notes,
        includeIva: quote.ivaPct != null,
        items: quote.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          description: item.description ?? "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          saveAsProduct: false,
        })),
      }}
    />
  );
}
