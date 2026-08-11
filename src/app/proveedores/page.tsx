import { getSuppliers } from "@/app/actions/suppliers";
import { SuppliersPageClient } from "@/components/suppliers/suppliers-page-client";

export default async function ProveedoresPage() {
  const suppliers = await getSuppliers();

  return <SuppliersPageClient suppliers={JSON.parse(JSON.stringify(suppliers))} />;
}