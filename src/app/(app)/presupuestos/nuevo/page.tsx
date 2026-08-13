import { QuoteBuilderClient } from "@/components/quotes/quote-builder-client";
import { clientService } from "@/services/client.service";
import { productService } from "@/services/product.service";
import { companySettingsRepository } from "@/repositories/company-settings.repository";

export default async function NuevoPresupuestoPage() {
  const [clients, products, companySettings] = await Promise.all([
    clientService.list(),
    productService.list(),
    companySettingsRepository.toConfig(),
  ]);

  return (
    <QuoteBuilderClient
      clients={clients}
      products={products}
      defaultIvaPct={companySettings.ivaPct}
    />
  );
}
