"use server";

import { revalidatePath } from "next/cache";
import { companyService } from "@/services/company.service";
import { companySchema } from "@/lib/validations";

function revalidateCompanies() {
  revalidatePath("/configuracion");
  revalidatePath("/presupuestos");
  revalidatePath("/presupuestos/nuevo");
}

export async function getCompanies() {
  return companyService.list();
}

export async function getActiveCompanies() {
  return companyService.listActive();
}

export async function createCompanyAction(formData: unknown) {
  const parsed = companySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const company = await companyService.create(parsed.data);
    revalidateCompanies();
    return { success: true as const, companyId: company.id };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo crear la empresa"] } };
  }
}

export async function updateCompanyAction(id: string, formData: unknown) {
  const parsed = companySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await companyService.update(id, parsed.data);
    revalidateCompanies();
    return { success: true as const, companyId: id };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo actualizar la empresa"] } };
  }
}

export async function setCompanyActiveAction(id: string, active: boolean) {
  try {
    await companyService.setActive(id, active);
    revalidateCompanies();
    return { success: true as const };
  } catch {
    return { success: false as const, error: "No se pudo cambiar el estado de la empresa." };
  }
}

export async function setDefaultCompanyAction(id: string) {
  try {
    await companyService.setDefault(id);
    revalidateCompanies();
    return { success: true as const };
  } catch {
    return { success: false as const, error: "No se pudo marcar la empresa como predeterminada." };
  }
}

export async function uploadCompanyLogoAction(formData: FormData) {
  const companyId = formData.get("companyId");
  const file = formData.get("logo");

  if (typeof companyId !== "string" || !companyId) {
    return { success: false as const, error: "Empresa inválida." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { success: false as const, error: "Elegí un archivo PNG o JPG." };
  }

  try {
    await companyService.uploadLogo(companyId, file);
    revalidateCompanies();
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "No se pudo subir el logo.",
    };
  }
}

export async function removeCompanyLogoAction(id: string) {
  try {
    await companyService.removeLogo(id);
    revalidateCompanies();
    return { success: true as const };
  } catch {
    return { success: false as const, error: "No se pudo quitar el logo." };
  }
}
