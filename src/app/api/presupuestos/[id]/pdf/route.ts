import { NextResponse } from "next/server";
import { quoteService } from "@/services/quote.service";
import { pdfService } from "@/services/pdf.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await quoteService.getPdfData(id);

  if (!data) {
    return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
  }

  const { quote, companyInfo } = data;
  const pdfBytes = await pdfService.generateQuotePdf(quote, companyInfo);

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
