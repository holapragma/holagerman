"use server";

import { revalidatePath } from "next/cache";
import { costSettingsRepository } from "@/repositories/cost-settings.repository";
import { costSettingsSchema } from "@/lib/validations";

export async function getCostSettings() {
  return costSettingsRepository.toConfig();
}

export async function updateCostSettingsAction(formData: unknown) {
  const parsed = costSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await costSettingsRepository.update(parsed.data);
    revalidatePath("/configuracion");
    revalidatePath("/proveedores");
    revalidatePath("/proveedores/[id]", "page");
    revalidatePath("/proveedores/comparador", "page");
    revalidatePath("/productos/[id]", "page");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo actualizar la configuración"] } };
  }
}