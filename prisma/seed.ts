import "dotenv/config";
import { createPrismaClient } from "../src/lib/db";

const prisma = createPrismaClient();

async function main() {
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.competitionEntry.deleteMany();
  await prisma.marketObservation.deleteMany();
  await prisma.supplierQuote.deleteMany();
  await prisma.supplierCostConfig.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.costSettings.deleteMany();
  await prisma.companySettings.deleteMany();
  await prisma.company.deleteMany();
  await prisma.companyLogo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "María González",
        company: "Distribuidora Sur",
        phone: "+54 11 4567-8901",
        email: "maria@distribuidorasur.com",
        notes: "Cliente preferencial, pago a 30 días.",
      },
    }),
    prisma.client.create({
      data: {
        name: "Carlos Ruiz",
        company: "Tech Solutions SA",
        phone: "+54 11 2345-6789",
        email: "carlos@techsolutions.com",
      },
    }),
    prisma.client.create({
      data: {
        name: "Ana Martínez",
        phone: "+54 351 555-1234",
        email: "ana.martinez@gmail.com",
        notes: "Consultora independiente.",
      },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Notebook Pro 14",
        category: "Electrónica",
        price: 899999,
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        name: "Monitor 27 4K",
        category: "Electrónica",
        price: 349999,
        stock: 8,
      },
    }),
    prisma.product.create({
      data: {
        name: "Teclado Mecánico RGB",
        category: "Accesorios",
        price: 89999,
        stock: 45,
      },
    }),
    prisma.product.create({
      data: {
        name: "Mouse Ergonómico",
        category: "Accesorios",
        price: 45999,
        stock: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: "Webcam HD Pro",
        category: "Electrónica",
        price: 129999,
        stock: 15,
      },
    }),
  ]);

  await prisma.competitionEntry.createMany({
    data: [
      {
        productId: products[0].id,
        competitorPrice: 929999,
        source: "Competidor A - Web",
      },
      {
        productId: products[1].id,
        competitorPrice: 329999,
        source: "Competidor B - Catálogo",
      },
      {
        productId: products[3].id,
        competitorPrice: 42999,
        source: "Competidor C - Tienda física",
      },
    ],
  });

  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "Juan Pérez",
        company: "Importadora Tech SA",
        country: "China",
        currency: "USD",
        contact: "Juan Pérez",
        email: "juan@importadoratech.com",
        phone: "+54 11 4444-5555",
        website: "https://importadoratech.com",
        notes: "Proveedor principal notebooks y monitores. Envío marítimo 30 días.",
        costConfig: {
          create: {
            nacionalizacionPct: 25,
            comisionPct: 3,
            costosFinancierosPct: 2,
            envio: 150,
            seguro: 50,
            otrosGastos: 30,
          },
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Roberto Gómez",
        company: "Distribuidora Local",
        country: "Argentina",
        currency: "ARS",
        contact: "Roberto Gómez",
        email: "roberto@distribuidoralocal.com.ar",
        phone: "+54 11 3333-4444",
        notes: "Stock local, entrega inmediata. Precios en ARS.",
        costConfig: {
          create: {
            nacionalizacionPct: 0,
            comisionPct: 5,
            costosFinancierosPct: 1,
            envio: 5000,
            seguro: 0,
            otrosGastos: 2000,
          },
        },
      },
    }),
    prisma.supplier.create({
      data: {
        name: "TechCorp Chile",
        company: "TechCorp SpA",
        country: "Chile",
        currency: "USD",
        contact: "Carlos Mendoza",
        email: "carlos@techcorp.cl",
        phone: "+56 2 2555-6666",
        website: "https://techcorp.cl",
        notes: "Distribuidor oficial accesorios. Envío aéreo 5 días.",
        costConfig: {
          create: {
            nacionalizacionPct: 18,
            comisionPct: 2,
            costosFinancierosPct: 1.5,
            envio: 80,
            seguro: 25,
            otrosGastos: 15,
          },
        },
      },
    }),
  ]);

  await prisma.costSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      nacionalizacionPct: 20,
      comisionPct: 4,
      costosFinancierosPct: 2,
      envio: 10000,
      seguro: 2000,
      otrosGastos: 5000,
    },
  });

  await prisma.companySettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", ivaPct: 21 },
  });

  const CONDITIONS = [
    "Validez del presupuesto: 30 días desde la fecha de emisión",
    "Forma de pago: a convenir (transferencia, cheque, efectivo)",
    "Tiempo de entrega: a confirmar según disponibilidad de stock",
    "Garantía: según términos del fabricante",
    "Disponibilidad sujeta a stock al momento de la confirmación",
  ].join("\n");

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "AGRES",
        legalName: "AGRES S.A.",
        taxId: "30-71234567-8",
        email: "ventas@agres.com",
        phone: "+54 11 1234-5678",
        address: "Av. Corrientes 1234, CABA, Argentina",
        website: "https://www.agres.com",
        quoteValidityDays: 30,
        conditions: CONDITIONS,
        isDefault: true,
      },
    }),
    prisma.company.create({
      data: {
        name: "FIG Construcciones",
        legalName: "FIG Construcciones S.R.L.",
        taxId: "30-70987654-3",
        email: "obras@figconstrucciones.com",
        phone: "+54 11 8765-4321",
        address: "Av. Rivadavia 5678, CABA, Argentina",
        quoteValidityDays: 15,
        conditions: CONDITIONS,
      },
    }),
  ]);

  const today = new Date();
  const date1 = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const date2 = new Date(today.getFullYear(), today.getMonth() - 1, 15);
  const date3 = new Date(today.getFullYear(), today.getMonth(), 1);

  await prisma.supplierQuote.createMany({
    data: [
      {
        supplierId: suppliers[0].id,
        productId: products[0].id,
        supplierCode: "NB-PRO14-001",
        fobCost: 650,
        currency: "USD",
        date: date1,
        notes: "Cotización inicial",
      },
      {
        supplierId: suppliers[0].id,
        productId: products[0].id,
        supplierCode: "NB-PRO14-001",
        fobCost: 630,
        currency: "USD",
        date: date2,
        notes: "Ajuste por volumen",
      },
      {
        supplierId: suppliers[0].id,
        productId: products[0].id,
        supplierCode: "NB-PRO14-001",
        fobCost: 620,
        currency: "USD",
        date: date3,
        notes: "Precio actual",
      },
      {
        supplierId: suppliers[1].id,
        productId: products[0].id,
        supplierCode: "NB-LOCAL-14",
        fobCost: 680000,
        currency: "ARS",
        date: date1,
        notes: "Stock disponible",
      },
      {
        supplierId: suppliers[1].id,
        productId: products[0].id,
        supplierCode: "NB-LOCAL-14",
        fobCost: 650000,
        currency: "ARS",
        date: date3,
        notes: "Nueva lista de precios",
      },
      {
        supplierId: suppliers[0].id,
        productId: products[1].id,
        supplierCode: "MON-27-4K",
        fobCost: 280,
        currency: "USD",
        date: date2,
        notes: "Monitor 27\"",
      },
      {
        supplierId: suppliers[2].id,
        productId: products[2].id,
        supplierCode: "KB-RGB-01",
        fobCost: 45,
        currency: "USD",
        date: date3,
        notes: "Teclado mecánico",
      },
      {
        supplierId: suppliers[2].id,
        productId: products[3].id,
        supplierCode: "MS-ERGO-01",
        fobCost: 22,
        currency: "USD",
        date: date1,
        notes: "Mouse ergonómico",
      },
      {
        supplierId: suppliers[0].id,
        productId: products[4].id,
        supplierCode: "CAM-HD-PRO",
        fobCost: 85,
        currency: "USD",
        date: date3,
        notes: "Webcam HD",
      },
    ],
  });

  await prisma.marketObservation.createMany({
    data: [
      {
        productId: products[0].id,
        source: "Mercado Libre",
        store: "Tienda Oficial TechStore",
        url: "https://mercadolibre.com.ar/notebook-pro14",
        observedPrice: 949999,
        currency: "ARS",
        date: new Date(today.getFullYear(), today.getMonth() - 1, 10),
        notes: "Envío gratis, 12 cuotas sin interés",
      },
      {
        productId: products[0].id,
        source: "Apple",
        store: "Apple Store Online",
        url: "https://apple.com/ar/shop",
        observedPrice: 1299999,
        currency: "ARS",
        date: new Date(today.getFullYear(), today.getMonth() - 1, 20),
        notes: "Modelo equivalente Apple",
      },
      {
        productId: products[0].id,
        source: "MacStation",
        store: "MacStation Local",
        url: "https://macstation.com.ar",
        observedPrice: 899999,
        currency: "ARS",
        date: date3,
        notes: "Precio lista, entrega inmediata",
      },
      {
        productId: products[1].id,
        source: "Mercado Libre",
        store: "MonitorWorld",
        url: "https://mercadolibre.com.ar/monitor-27-4k",
        observedPrice: 359999,
        currency: "ARS",
        date: new Date(today.getFullYear(), today.getMonth() - 1, 5),
        notes: "Oferta 10% off",
      },
      {
        productId: products[2].id,
        source: "Tienda Física",
        store: "GamerZone Palermo",
        observedPrice: 95999,
        currency: "ARS",
        date: date3,
        notes: "Stock disponible en tienda",
      },
      {
        productId: products[3].id,
        source: "Distribuidor",
        store: "AccesoriosYa",
        observedPrice: 48999,
        currency: "ARS",
        date: new Date(today.getFullYear(), today.getMonth() - 1, 28),
        notes: "Precio mayorista + IVA",
      },
      {
        productId: products[4].id,
        source: "Mercado Libre",
        store: "CámaraPro",
        url: "https://mercadolibre.com.ar/webcam-hd-pro",
        observedPrice: 139999,
        currency: "ARS",
        date: date3,
        notes: "Incluye trípode",
      },
    ],
  });

  const issuer = companies[0];

  const quote = await prisma.quote.create({
    data: {
      number: 1,
      clientId: clients[0].id,
      notes: "Precios válidos por 15 días. Incluye garantía oficial.",
      subtotal: 1489997,
      total: 1489997,
      companyId: issuer.id,
      companyName: issuer.name,
      companyLegalName: issuer.legalName,
      companyTaxId: issuer.taxId,
      companyAddress: issuer.address,
      companyPhone: issuer.phone,
      companyEmail: issuer.email,
      companyWebsite: issuer.website,
      companyConditions: issuer.conditions,
      companyValidityDays: issuer.quoteValidityDays,
      items: {
        create: [
          {
            productId: products[0].id,
            name: products[0].name,
            position: 0,
            quantity: 1,
            unitPrice: 899999,
            subtotal: 899999,
          },
          {
            productId: products[1].id,
            name: products[1].name,
            position: 1,
            quantity: 1,
            unitPrice: 349999,
            subtotal: 349999,
          },
          {
            productId: products[2].id,
            name: products[2].name,
            position: 2,
            quantity: 1,
            unitPrice: 89999,
            subtotal: 89999,
          },
          {
            // Ítem manual: no existe en el catálogo, vive solo en este presupuesto.
            name: "Instalación y puesta en marcha",
            description: "Incluye traslado y configuración inicial en el domicilio del cliente",
            position: 3,
            quantity: 1,
            unitPrice: 150000,
            subtotal: 150000,
          },
        ],
      },
    },
  });

  console.log("Seed completado:");
  console.log(`- ${clients.length} clientes`);
  console.log(`- ${products.length} productos`);
  console.log(`- 1 presupuesto (${quote.id})`);
  console.log("- 3 registros de competencia");
  console.log(`- ${suppliers.length} proveedores`);
  console.log("- Configuración global de costos");
  console.log(`- ${companies.length} empresas emisoras (${companies.map((c) => c.name).join(", ")})`);
  console.log("- Configuración de IVA y condiciones comerciales por empresa");
  console.log("- Cotizaciones de proveedores con historial");
  console.log("- Observaciones de mercado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });