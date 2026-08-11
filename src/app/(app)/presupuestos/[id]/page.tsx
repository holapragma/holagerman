import { notFound } from "next/navigation";
import { QuoteDetail } from "@/components/quotes/quote-detail";
import { quoteService } from "@/services/quote.service";

export default async function PresupuestoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await quoteService.getById(id);

  if (!quote) {
    notFound();
  }

  return <QuoteDetail quote={quote} />;
}
