import { notFound } from "next/navigation";
import { QuoteBuilderClient } from "@/components/quotes/quote-builder-client";
import { quoteService } from "@/services/quote.service";
import { clientService } from "@/services/client.service";
import { productService } from "@/services/product.service";

export default async function EditarPresupuestoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, clients, products] = await Promise.all([
    quoteService.getById(id),
    clientService.list(),
    productService.list(),
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <QuoteBuilderClient
      clients={clients}
      products={products}
      initialQuote={{
        originalNumber: quote.number,
        clientId: quote.clientId,
        notes: quote.notes,
        items: quote.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }}
    />
  );
}