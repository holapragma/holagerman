import { QuoteBuilderClient } from "@/components/quotes/quote-builder-client";
import { clientService } from "@/services/client.service";
import { productService } from "@/services/product.service";

export default async function NuevoPresupuestoPage() {
  const [clients, products] = await Promise.all([
    clientService.list(),
    productService.list(),
  ]);

  return <QuoteBuilderClient clients={clients} products={products} />;
}
