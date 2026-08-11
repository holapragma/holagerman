"use server";

import { revalidatePath } from "next/cache";
import { competitionService } from "@/services/competition.service";
import { competitionSchema } from "@/lib/validations";

export async function getCompetitionEntries() {
  return competitionService.list();
}

export async function createCompetitionAction(formData: unknown) {
  const parsed = competitionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await competitionService.create(parsed.data);
    revalidatePath("/competencia");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo crear el registro"] } };
  }
}

export async function updateCompetitionAction(id: string, formData: unknown) {
  const parsed = competitionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await competitionService.update(id, parsed.data);
    revalidatePath("/competencia");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo actualizar el registro"] } };
  }
}

export async function deleteCompetitionAction(id: string) {
  try {
    await competitionService.remove(id);
    revalidatePath("/competencia");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "No se pudo eliminar el registro." };
  }
}
