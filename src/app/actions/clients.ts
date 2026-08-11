"use server";

import { revalidatePath } from "next/cache";
import { clientService } from "@/services/client.service";
import { clientSchema } from "@/lib/validations";

export async function getClients(search?: string) {
  return clientService.list(search);
}

export async function createClientAction(formData: unknown) {
  const parsed = clientSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await clientService.create(parsed.data);
    revalidatePath("/clientes");
    revalidatePath("/");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo crear el cliente"] } };
  }
}

export async function updateClientAction(id: string, formData: unknown) {
  const parsed = clientSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await clientService.update(id, parsed.data);
    revalidatePath("/clientes");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo actualizar el cliente"] } };
  }
}

export async function deleteClientAction(id: string) {
  try {
    await clientService.remove(id);
    revalidatePath("/clientes");
    revalidatePath("/");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "No se pudo eliminar el cliente. Puede tener presupuestos asociados." };
  }
}
