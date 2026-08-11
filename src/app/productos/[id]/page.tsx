import { notFound } from "next/navigation";
import { getProductById } from "@/app/actions/products";
import { ProductDetailClient } from "@/components/products/product-detail-client";

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}