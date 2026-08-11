import { CompetitionPageClient } from "@/components/competition/competition-page-client";
import { competitionService } from "@/services/competition.service";
import { productService } from "@/services/product.service";

export default async function CompetenciaPage() {
  const [entries, products] = await Promise.all([
    competitionService.list(),
    productService.list(),
  ]);

  return <CompetitionPageClient entries={entries} products={products} />;
}
