"use server";

import { revalidatePath } from "next/cache";
import { supplierService } from "@/services/supplier.service";
import { supplierSchema, supplierQuoteSchema } from "@/lib/validations";

export async function getSuppliers(search?: string) {
  return supplierService.list(search);
}

export async function getSupplierById(id: string) {
  return supplierService.getById(id);
}

export async function getSupplierQuotesBySupplier(supplierId: string) {
  return supplierService.getLatestQuotesBySupplier(supplierId);
}

export async function getSupplierEffectiveConfig(supplierId: string) {
  const supplier = await supplierService.getById(supplierId);
  if (!supplier) return null;
  return supplierService.getEffectiveConfig(supplier);
}

export async function getComparatorData(productId: string, salePrice: number) {
  return supplierService.getComparatorData(productId, salePrice);
}

export async function createSupplierAction(formData: unknown) {
  const parsed = supplierSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await supplierService.create(parsed.data);
    revalidatePath("/proveedores");
    revalidatePath("/proveedores/[id]", "page");
    revalidatePath("/proveedores/comparador", "page");
    revalidatePath("/configuracion", "page");
    revalidatePath("/productos/[id]", "page");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo crear el proveedor"] } };
  }
}

export async function updateSupplierAction(id: string, formData: unknown) {
  const parsed = supplierSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await supplierService.update(id, parsed.data);
    revalidatePath("/proveedores");
    revalidatePath(`/proveedores/${id}`);
    revalidatePath("/proveedores/[id]", "page");
    revalidatePath("/proveedores/comparador", "page");
    revalidatePath("/configuracion", "page");
    revalidatePath("/productos/[id]", "page");
    return { success: true as const };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo actualizar el proveedor"] } };
  }
}

export async function deleteSupplierAction(id: string) {
  try {
    await supplierService.remove(id);
    revalidatePath("/proveedores");
    revalidatePath("/proveedores/[id]", "page");
    revalidatePath("/proveedores/comparador", "page");
    revalidatePath("/productos/[id]", "page");
    return { success: true as const };
  } catch (e: unknown) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "No se pudo eliminar el proveedor.",
    };
  }
}

export async function createSupplierQuoteAction(formData: unknown) {
  const parsed = supplierQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const result = await supplierService.registerQuote(parsed.data);
    revalidatePath("/proveedores");
    revalidatePath("/proveedores/[id]", "page");
    revalidatePath("/proveedores/comparador", "page");
    revalidatePath("/productos/[id]", "page");
    return { success: true as const, id: result.id };
  } catch {
    return { success: false as const, error: { _form: ["No se pudo registrar la cotización"] } };
  }
}

export async function deleteSupplierQuoteAction(id: string) {
  try {
    await supplierService.removeQuote(id);
    revalidatePath("/proveedores");
    revalidatePath("/proveedores/[id]", "page");
    revalidatePath("/proveedores/comparador", "page");
    revalidatePath("/productos/[id]", "page");
    return { success: true as const };
  } catch (e: unknown) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "No se pudo eliminar la cotización.",
    };
  }
}