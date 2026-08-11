import { NextResponse } from "next/server";
import { quoteService } from "@/services/quote.service";
import { pdfService } from "@/services/pdf.service";
import { companySettingsRepository } from "@/repositories/company-settings.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quote = await quoteService.getById(id);

  if (!quote) {
    return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
  }

  const companySettings = await companySettingsRepository.toConfig();
  const pdfBytes = await pdfService.generateQuotePdf(quote, companySettings);

  const baseFilename = `Presupuesto N° ${quote.number} - ${quote.client.name}`;
  const asciiFilename =
    baseFilename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/º/g, "o")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, " ")
      .trim() || "presupuesto";

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asciiFilename}.pdf"; filename*=UTF-8''${encodeURIComponent(`${baseFilename}.pdf`)}`,
    },
  });
}
