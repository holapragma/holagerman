import { notFound } from "next/navigation";
import {
  getSupplierById,
  getSupplierQuotesBySupplier,
  getSupplierEffectiveConfig,
} from "@/app/actions/suppliers";
import { SupplierDetail } from "@/components/suppliers/supplier-detail";

export default async function ProveedorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplierById(id);
  if (!supplier) {
    notFound();
  }

  const [quotes, effectiveConfig] = await Promise.all([
    getSupplierQuotesBySupplier(id),
    getSupplierEffectiveConfig(id),
  ]);

  return (
    <SupplierDetail
      supplier={JSON.parse(JSON.stringify(supplier))}
      quotes={JSON.parse(JSON.stringify(quotes))}
      effectiveConfig={JSON.parse(JSON.stringify(effectiveConfig))}
    />
  );
}