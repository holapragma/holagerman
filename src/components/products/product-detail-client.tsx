"use client";

import { Package, ShoppingCart, BarChart3 } from "lucide-react";
import type { Product } from "@/types";
import { formatMoney } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MarketTab } from "@/components/products/market-tab";
import { AnalysisTab } from "@/components/products/analysis-tab";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Package className="size-5 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="min-w-0 text-2xl font-bold break-words">{product.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Badge variant="secondary">{product.category}</Badge>
          <Badge variant="success" className="h-7">
            Precio: {formatMoney(product.price)}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="market" className="gap-2">
            <ShoppingCart className="size-4" />
            Mercado
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <BarChart3 className="size-4" />
            Análisis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="mt-6">
          <MarketTab productId={product.id} productPrice={product.price} />
        </TabsContent>
        <TabsContent value="analysis" className="mt-6">
          <AnalysisTab productId={product.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
