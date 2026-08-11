import { ProductsPageClient } from "@/components/products/products-page-client";
import { productService } from "@/services/product.service";

export default async function ProductosPage() {
  const products = await productService.list();

  return <ProductsPageClient products={products} />;
}
