"use server";

import { revalidatePath } from "next/cache";
import { quoteService } from "@/services/quote.service";
import { quoteSchema } from "@/lib/validations";

export async function getQuotes() {
  return quoteService.list();
}

export async function getQuoteById(id: string) {
  return quoteService.getById(id);
}

export async function createQuoteAction(formData: unknown) {
  const parsed = quoteSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const quote = await quoteService.create(parsed.data);
    revalidatePath("/presupuestos");
    revalidatePath("/");
    return { success: true as const, quoteId: quote.id };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo crear el presupuesto"] } };
  }
}

export async function deleteQuoteAction(id: string) {
  try {
    await quoteService.remove(id);
    revalidatePath("/presupuestos");
    revalidatePath("/");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "No se pudo eliminar el presupuesto." };
  }
}
