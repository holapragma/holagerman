import { QuotesPageClient } from "@/components/quotes/quotes-page-client";
import { quoteService } from "@/services/quote.service";

export default async function PresupuestosPage() {
  const quotes = await quoteService.list();

  return <QuotesPageClient quotes={quotes} />;
}
