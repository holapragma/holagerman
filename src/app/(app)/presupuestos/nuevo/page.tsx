import { QuoteBuilderClient } from "@/components/quotes/quote-builder-client";
import { clientService } from "@/services/client.service";
import { productService } from "@/services/product.service";
import { companyService } from "@/services/company.service";
import { companySettingsRepository } from "@/repositories/company-settings.repository";

export default async function NuevoPresupuestoPage() {
  const [clients, products, companies, companySettings] = await Promise.all([
    clientService.list(),
    productService.list(),
    companyService.listActive(),
    companySettingsRepository.toConfig(),
  ]);

  return (
    <QuoteBuilderClient
      clients={clients}
      products={products}
      companies={companies}
      defaultIvaPct={companySettings.ivaPct}
    />
  );
}
