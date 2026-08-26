import { NextResponse } from "next/server";
import { companyService } from "@/services/company.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const logo = await companyService.getLogo(id);

  if (!logo) {
    return NextResponse.json({ error: "Logo no encontrado" }, { status: 404 });
  }

  // Los logos son inmutables: cada carga genera un id nuevo.
  return new NextResponse(Buffer.from(logo.data), {
    headers: {
      "Content-Type": logo.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
