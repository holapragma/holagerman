"use server";

import { revalidatePath } from "next/cache";
import { productService } from "@/services/product.service";
import { productSchema } from "@/lib/validations";

export async function getProducts(search?: string) {
  return productService.list(search);
}

export async function getProductById(id: string) {
  return productService.getById(id);
}

export async function createProductAction(formData: unknown) {
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await productService.create(parsed.data);
    revalidatePath("/productos");
    revalidatePath("/");
    revalidatePath("/competencia");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo crear el producto"] } };
  }
}

export async function updateProductAction(id: string, formData: unknown) {
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await productService.update(id, parsed.data);
    revalidatePath("/productos");
    revalidatePath("/competencia");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo actualizar el producto"] } };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await productService.remove(id);
    revalidatePath("/productos");
    revalidatePath("/");
    revalidatePath("/competencia");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "No se pudo eliminar el producto." };
  }
}
