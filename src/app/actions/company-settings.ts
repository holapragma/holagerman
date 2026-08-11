"use server";

import { revalidatePath } from "next/cache";
import { companySettingsRepository } from "@/repositories/company-settings.repository";
import { companySettingsSchema } from "@/lib/validations";

export async function getCompanySettings() {
  return companySettingsRepository.toConfig();
}

export async function updateCompanySettingsAction(formData: unknown) {
  const parsed = companySettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await companySettingsRepository.update(parsed.data);
    revalidatePath("/configuracion");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo actualizar la configuración"] } };
  }
}
