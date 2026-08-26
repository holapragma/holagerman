import Link from "next/link";
import { Building2, Download, FileText, Pencil } from "lucide-react";
import type { QuoteWithRelations } from "@/types";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function QuoteDetail({ quote }: { quote: QuoteWithRelations }) {
  // Siempre el snapshot: el presupuesto muestra lo que se cotizó ese día.
  const companyName = quote.companyName ?? quote.company?.name ?? null;
  const companyDetails = [
    quote.companyLegalName,
    quote.companyTaxId ? `CUIT ${quote.companyTaxId}` : null,
    quote.companyAddress,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader
        title={`Presupuesto N° ${quote.number}`}
        description={`Creado el ${formatDate(quote.createdAt)} · ${quote.items.length} ítems`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/presupuestos">Volver</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/presupuestos/${quote.id}/editar`}>
                <Pencil className="size-4" />
                Editar
              </Link>
            </Button>
            <Button asChild className="h-12 rounded-full px-7">
              <a href={`/api/presupuestos/${quote.id}/pdf`} download>
                <Download className="size-4" />
                Generar PDF
              </a>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="gap-0 p-0">
          <div className="flex items-center gap-3 border-b border-border/70 px-6 py-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <FileText className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Detalle de productos
              </h2>
              <p className="text-xs text-muted-foreground">
                Líneas del presupuesto
              </p>
            </div>
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="pl-6">Producto</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="pr-6 text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6">
                      <p className="font-medium">{item.name}</p>
                      {item.description ? (
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium tabular-nums">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border/60 sm:hidden">
            {quote.items.map((item) => (
              <li key={item.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    {item.description ? (
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          {companyName ? (
            <Card>
              <CardHeader>
                <CardTitle>Empresa emisora</CardTitle>
                <CardDescription>Identidad usada en el PDF</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3 pb-6">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-border/70 bg-card">
                  {quote.companyLogoId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/empresas/logos/${quote.companyLogoId}`}
                      alt={companyName}
                      className="size-full object-contain p-1"
                    />
                  ) : (
                    <Building2 className="size-5 text-muted-foreground/60" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{companyName}</p>
                  {companyDetails ? (
                    <p className="truncate text-xs text-muted-foreground">{companyDetails}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>Datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 pb-6 text-sm">
              <p className="font-medium">{quote.client.name}</p>
              {quote.client.company ? <p>{quote.client.company}</p> : null}
              {quote.client.phone ? (
                <p className="text-muted-foreground">{quote.client.phone}</p>
              ) : null}
              {quote.client.email ? (
                <p className="text-muted-foreground">{quote.client.email}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="gap-0 p-0">
            <CardContent className="space-y-2.5 px-6 pt-6 pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.ivaPct != null ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    IVA ({formatPercent(quote.ivaPct)})
                  </span>
                  <span className="tabular-nums">
                    {formatCurrency(quote.total - quote.subtotal)}
                  </span>
                </div>
              ) : null}
              <SeparatorLine />
              <div className="flex items-end justify-between pt-1">
                <span className="text-[15px] font-semibold">Total</span>
                <span className="text-[28px] leading-none font-semibold tracking-tight text-primary tabular-nums">
                  {formatCurrency(quote.total)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4">
              <Button asChild className="h-12 w-full rounded-full text-[15px]">
                <a href={`/api/presupuestos/${quote.id}/pdf`} download>
                  <Download className="size-4" />
                  Generar PDF
                </a>
              </Button>
            </CardFooter>
          </Card>

          {quote.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
                <CardDescription>Notas del presupuesto</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}

function SeparatorLine() {
  return <div className="h-px w-full bg-border/70" />;
}