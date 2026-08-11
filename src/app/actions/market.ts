"use server";

import { revalidatePath } from "next/cache";
import { productAnalysisService } from "@/services/product-analysis.service";
import { marketService } from "@/services/market.service";
import { marketObservationSchema } from "@/lib/validations";

export async function getMarketObservations(productId: string) {
  return marketService.getObservations(productId);
}

export async function getMarketStats(productId: string, myPrice: number) {
  return marketService.getStats(productId, myPrice);
}

export async function getProductAnalysis(productId: string) {
  return productAnalysisService.getAnalysis(productId);
}

export async function createMarketObservationAction(formData: unknown) {
  const parsed = marketObservationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await marketService.registerObservation(parsed.data);
    revalidatePath("/productos/[id]", "page");
    revalidatePath("/proveedores/comparador", "page");
    return { success: true as const, id: result.id };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo registrar la observación"] } };
  }
}