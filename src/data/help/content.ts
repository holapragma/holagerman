import type { LucideIcon } from "lucide-react";
import {
  Factory,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";

export interface HelpSubsection {
  title: string;
  whereToFind: string;
  actions: string[];
  steps?: string[];
  notes?: string[];
}

export interface HelpModule {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  tagline: string;
  whereToFind: string;
  actions: string[];
  steps: string[];
  notes: string[];
  subsections?: HelpSubsection[];
}

export const helpModules: HelpModule[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    tagline:
      "La pantalla de inicio: un resumen rápido de tu actividad comercial del día a día.",
    whereToFind:
      "Es la primera pantalla al entrar al sistema. Volvés en cualquier momento haciendo clic en “Dashboard” en el menú lateral.",
    actions: [
      "Ver de un vistazo cuántos clientes, productos y presupuestos tenés cargados",
      "Ver cuántos productos tienen stock bajo",
      "Ver la evolución de presupuestos generados en los últimos 6 meses",
      "Entrar directo a un presupuesto o cliente reciente",
      "Crear un presupuesto nuevo con un clic",
    ],
    steps: [
      "Entrá al Dashboard (pantalla de inicio).",
      "Revisá las métricas superiores y el gráfico de presupuestos por mes.",
      "Hacé clic en cualquier presupuesto, cliente o producto con stock bajo para ir directo a su detalle.",
    ],
    notes: [
      "El gráfico “Presupuestos por mes” muestra los últimos 6 meses.",
      "Un producto entra en “Stock bajo” cuando tiene 10 unidades o menos.",
    ],
  },
  {
    id: "clientes",
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    tagline:
      "Tu cartera de clientes y contactos comerciales: quién es, cómo contactarlo y qué notas tenés sobre él.",
    whereToFind: "Menú lateral → Clientes.",
    actions: [
      "Crear, editar y eliminar clientes",
      "Buscar por nombre, empresa, email o teléfono",
      "Ver teléfono y email de cada cliente directamente en el listado",
    ],
    steps: [
      "Entrá en Clientes.",
      "Hacé clic en “Nuevo cliente”.",
      "Completá nombre (obligatorio), empresa, teléfono, email y notas.",
      "Guardá — el cliente queda disponible para usarlo en presupuestos.",
    ],
    notes: [
      "No se puede eliminar un cliente que ya tiene presupuestos asociados: esto protege el historial comercial.",
      "El campo “Empresa” es opcional, para clientes que compran a título personal.",
    ],
  },
  {
    id: "productos",
    label: "Productos",
    href: "/productos",
    icon: Package,
    tagline:
      "El catálogo de productos que vendés, con precio, stock y el análisis de costos y mercado de cada uno.",
    whereToFind: "Menú lateral → Productos.",
    actions: [
      "Crear, editar y eliminar productos",
      "Buscar por nombre o categoría",
      "Ver de un vistazo qué productos tienen stock bajo",
      "Entrar al detalle de un producto para ver mercado y rentabilidad",
    ],
    steps: [
      "Entrá en Productos.",
      "Hacé clic en “Nuevo producto”.",
      "Completá nombre, categoría, precio, stock y, opcionalmente, una foto (URL).",
      "Guardá — el producto queda disponible para cotizaciones, presupuestos, mercado y competencia.",
    ],
    notes: [
      "Un producto puede existir en el catálogo con stock en 0 y de todas formas cotizarse o presupuestarse (ver “Producto vs. stock” en Conceptos importantes).",
      "El stock bajo se marca cuando llega a 10 unidades o menos.",
      "No se puede eliminar un producto que ya forma parte de algún presupuesto.",
    ],
    subsections: [
      {
        title: "Ficha de producto → pestaña Mercado",
        whereToFind: "Productos → (elegís un producto) → pestaña “Mercado”.",
        actions: [
          "Registrar manualmente un precio observado en el mercado (competencia, e-commerce, distribuidores, etc.)",
          "Ver precio mínimo, máximo y promedio relevado, y cuánto te separa de tu propio precio de venta",
          "Ver el historial de relevamientos con fuente, fecha, moneda y notas",
        ],
        steps: [
          "Entrá al detalle del producto y abrí la pestaña “Mercado”.",
          "Hacé clic en “Nueva observación”.",
          "Completá fuente, precio observado, moneda y notas.",
          "Guardá.",
        ],
        notes: [
          "La carga es 100% manual: hoy no hay scraping ni integraciones automáticas de precios de mercado.",
        ],
      },
      {
        title: "Ficha de producto → pestaña Análisis",
        whereToFind: "Productos → (elegís un producto) → pestaña “Análisis”.",
        actions: [
          "Ver el costo FOB y el costo nacionalizado de la última cotización de compra registrada",
          "Ver el margen estimado entre el costo nacionalizado y el precio de venta",
          "Ver qué proveedores cotizaron este producto y cuál tiene el mejor costo",
          "Ver el resumen de precios de mercado del producto",
        ],
        notes: [
          "Este análisis se arma automáticamente a partir de la última cotización de proveedor y los relevamientos de mercado cargados: no requiere carga manual adicional.",
        ],
      },
    ],
  },
  {
    id: "proveedores",
    label: "Proveedores",
    href: "/proveedores",
    icon: Factory,
    tagline:
      "Tus proveedores de compra, sus cotizaciones históricas y el comparador de costos entre ellos.",
    whereToFind: "Menú lateral → Proveedores.",
    actions: [
      "Crear, editar y eliminar proveedores",
      "Buscar por nombre, empresa, email o teléfono",
      "Ver contacto directo (email y teléfono) desde la ficha del proveedor",
    ],
    steps: [
      "Entrá en Proveedores.",
      "Hacé clic en “Nuevo proveedor”.",
      "Completá nombre, empresa, país, moneda y contacto.",
      "Si querés, definí una configuración de costos propia para ese proveedor (si no, se usa la global de Configuración).",
      "Guardá.",
    ],
    notes: [
      "No se puede eliminar un proveedor que ya tiene cotizaciones registradas.",
    ],
    subsections: [
      {
        title: "Ficha de proveedor",
        whereToFind: "Proveedores → (elegís un proveedor).",
        actions: [
          "Ver datos de contacto con acceso directo (email y teléfono)",
          "Ver y editar la configuración de costos propia del proveedor",
          "Registrar una nueva cotización de compra",
          "Ver el historial completo de cotizaciones y seleccionar cualquiera para ver su desglose de costos",
        ],
        steps: [
          "Entrá a la ficha del proveedor y hacé clic en “Nueva cotización”.",
          "Elegí el producto, la moneda y el costo FOB. Opcionalmente, cargá cantidad mínima y código del proveedor.",
          "Revisá el desglose de costos estimado — podés editarlo ahí mismo para simular escenarios antes de guardar.",
          "Guardá: la cotización queda en el historial y nunca se sobrescribe.",
        ],
        notes: [
          "Cada cotización nueva es un registro nuevo con su propia fecha: el sistema conserva el historial completo de costos en el tiempo, nunca pisa una cotización anterior.",
        ],
      },
      {
        title: "Comparador de costos",
        whereToFind: "Proveedores → pestaña “Comparador de costos” (/proveedores/comparador).",
        actions: [
          "Elegir un producto y comparar en una sola tabla el costo FOB, el costo nacionalizado, el precio de venta y el margen de cada proveedor que lo cotiza",
          "Detectar de un vistazo el proveedor con mejor costo y el de mejor margen",
        ],
        steps: [
          "Entrá en Proveedores → pestaña “Comparador de costos”.",
          "Seleccioná un producto del desplegable.",
          "Revisá la tabla: cada fila es un proveedor con su última cotización para ese producto.",
        ],
      },
    ],
  },
  {
    id: "presupuestos",
    label: "Presupuestos",
    href: "/presupuestos",
    icon: FileText,
    tagline:
      "Cotizá rápido: agregá ítems del catálogo o escribilos a mano en la misma pantalla, y generá el PDF para enviar.",
    whereToFind: "Menú lateral → Presupuestos.",
    actions: [
      "Crear presupuestos nuevos sin salir de la pantalla",
      "Agregar ítems que todavía no existen en Productos (y guardarlos en el catálogo si querés)",
      "Elegir con qué empresa se emite el presupuesto",
      "Buscar presupuestos por cliente",
      "Ver el detalle, editar (como copia nueva) o descargar el PDF de cualquier presupuesto",
      "Eliminar presupuestos",
    ],
    steps: [
      "Entrá en Presupuestos → “Nuevo presupuesto”.",
      "Seleccioná el cliente y la empresa emisora.",
      "Escribí el nombre del ítem: si existe en el catálogo elegilo de la lista y se completa el precio; si no existe, seguí escribiendo y queda como ítem manual.",
      "Ajustá cantidad, precio y descripción de cada línea. Enter en el precio agrega la fila siguiente.",
      "Si querés que un ítem manual quede en el catálogo, marcá “Guardar también como producto”.",
      "Agregá observaciones si hace falta y hacé clic en “Crear presupuesto”.",
    ],
    notes: [
      "Cada presupuesto tiene un número secuencial único (N°): es lo que ve el cliente, nunca un identificador interno.",
      "El PDF no es una factura: está pensado como una propuesta comercial que ayuda a vender.",
      "Cada línea guarda el nombre, la descripción y el precio con los que se cotizó: si después cambiás el producto en el catálogo, los presupuestos ya emitidos no se modifican.",
      "Lo mismo vale para la empresa emisora: el presupuesto conserva el logo y los datos con los que fue generado.",
    ],
    subsections: [
      {
        title: "Detalle del presupuesto y PDF",
        whereToFind: "Presupuestos → (elegís un presupuesto).",
        actions: [
          "Ver el detalle completo de productos, cliente y totales",
          "Descargar el presupuesto en PDF",
          "Editar el presupuesto",
        ],
        steps: [
          "Entrá al presupuesto desde la lista.",
          "Hacé clic en “Generar PDF” para descargarlo.",
          "El archivo se descarga como “Presupuesto N° {número} - {cliente}.pdf”.",
        ],
      },
      {
        title: "Editar un presupuesto",
        whereToFind: "Presupuestos → (elegís un presupuesto) → “Editar”.",
        actions: [
          "Modificar cliente, empresa emisora, ítems u observaciones de un presupuesto ya creado",
        ],
        notes: [
          "Editar NO modifica el presupuesto original: al guardar se crea un presupuesto nuevo (con su propio número) y el original se conserva intacto para siempre. Esto preserva el historial de qué se le propuso al cliente en cada momento.",
        ],
      },
    ],
  },
  {
    id: "competencia",
    label: "Competencia",
    href: "/competencia",
    icon: TrendingUp,
    tagline:
      "Registro simple y puntual de precios de la competencia por producto, para comparar contra tu propio precio de venta.",
    whereToFind: "Menú lateral → Competencia.",
    actions: [
      "Crear, editar y eliminar registros de precios de la competencia",
      "Ver la diferencia entre tu precio y el de la competencia con un indicador de color",
      "Buscar por producto, categoría o fuente",
    ],
    steps: [
      "Entrá en Competencia.",
      "Hacé clic en “Nuevo registro”.",
      "Elegí el producto, cargá el precio de la competencia y la fuente (por ejemplo, “Mercado Libre”).",
      "Guardá.",
    ],
    notes: [
      "La carga es manual: está preparado para automatizarse en el futuro, pero hoy no hay scraping ni integraciones.",
      "Es un registro más simple que “Mercado” (que vive dentro de la ficha de cada producto, con historial y estadísticas). Ver “Mercado vs. Competencia” en Conceptos importantes.",
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
    tagline:
      "Tus empresas emisoras, los valores por defecto de cálculo de costos y la alícuota de IVA.",
    whereToFind: "Menú lateral → Configuración (al final del menú).",
    actions: [
      "Crear, editar, activar o desactivar empresas emisoras (nombre comercial, razón social, CUIT, dirección, contacto y logo)",
      "Marcar cuál es la empresa predeterminada al crear un presupuesto",
      "Definir la validez en días y las condiciones comerciales de cada empresa (salen en el PDF)",
      "Definir los porcentajes o importes globales de nacionalización, comisión, costos financieros, envío, seguro y otros gastos",
      "Definir la alícuota de IVA",
    ],
    steps: [
      "Entrá en Configuración.",
      "En “Empresas”, creá cada empresa con la que emitís presupuestos y subí su logo (PNG o JPG, hasta 2 MB).",
      "Completá los valores de cálculo de costos (se usan cuando un proveedor no define los suyos propios).",
      "Revisá la alícuota de IVA.",
      "Guardá cada sección con su botón correspondiente.",
    ],
    notes: [
      "Clientes, productos y stock son compartidos entre todas las empresas: lo único que cambia por empresa es la identidad del presupuesto.",
      "Cambiar los datos o el logo de una empresa no modifica los presupuestos ya emitidos: cada uno conserva la identidad con la que se generó.",
      "Los costos definidos acá son el default global: si un proveedor tiene su propia configuración, esa tiene prioridad por sobre la global.",
    ],
  },
];

export interface HelpFlow {
  id: string;
  question: string;
  moduleId: string;
  steps: string[];
}

export const helpFlows: HelpFlow[] = [
  {
    id: "crear-cliente",
    question: "¿Cómo creo un cliente?",
    moduleId: "clientes",
    steps: [
      "Entrá en Clientes.",
      "Hacé clic en “Nuevo cliente”.",
      "Completá nombre, empresa, teléfono, email y notas.",
      "Guardá.",
    ],
  },
  {
    id: "agregar-producto",
    question: "¿Cómo agrego un producto al catálogo?",
    moduleId: "productos",
    steps: [
      "Entrá en Productos.",
      "Hacé clic en “Nuevo producto”.",
      "Completá nombre, categoría, precio, stock y foto (opcional).",
      "Guardá.",
    ],
  },
  {
    id: "registrar-cotizacion",
    question: "¿Cómo registro una cotización de un proveedor?",
    moduleId: "proveedores",
    steps: [
      "Entrá a la ficha del proveedor (creálo primero si no existe).",
      "Hacé clic en “Nueva cotización”.",
      "Elegí el producto, moneda y costo FOB.",
      "Revisá el desglose de costos y guardá.",
    ],
  },
  {
    id: "comparar-proveedores",
    question: "¿Cómo comparo costos entre proveedores?",
    moduleId: "proveedores",
    steps: [
      "Entrá en Proveedores → pestaña “Comparador de costos”.",
      "Seleccioná un producto.",
      "Compará costo FOB, costo nacionalizado y margen de cada proveedor.",
    ],
  },
  {
    id: "consultar-mercado",
    question: "¿Cómo consulto precios de mercado de un producto?",
    moduleId: "productos",
    steps: [
      "Entrá al detalle del producto.",
      "Abrí la pestaña “Mercado”.",
      "Revisá las estadísticas y el historial de relevamientos.",
    ],
  },
  {
    id: "ver-rentabilidad",
    question: "¿Cómo veo la rentabilidad de un producto?",
    moduleId: "productos",
    steps: [
      "Entrá al detalle del producto.",
      "Abrí la pestaña “Análisis”.",
      "Revisá el costo nacionalizado, el margen estimado y los proveedores disponibles.",
    ],
  },
  {
    id: "crear-presupuesto",
    question: "¿Cómo creo un presupuesto?",
    moduleId: "presupuestos",
    steps: [
      "Entrá en Presupuestos → “Nuevo presupuesto”.",
      "Seleccioná el cliente y la empresa emisora.",
      "Escribí cada ítem: elegilo del catálogo o cargalo a mano, y ajustá cantidad/precio.",
      "Hacé clic en “Crear presupuesto”.",
    ],
  },
  {
    id: "item-manual",
    question: "¿Cómo cotizo algo que todavía no está en Productos?",
    moduleId: "presupuestos",
    steps: [
      "En “Nuevo presupuesto”, escribí el nombre del ítem en la fila.",
      "Ignorá las sugerencias del catálogo y completá cantidad y precio.",
      "Si además querés que quede en el catálogo, marcá “Guardar también como producto”: se crea en Productos al guardar el presupuesto.",
      "Si no marcás la casilla, el ítem existe solo dentro de ese presupuesto y no ensucia el catálogo.",
    ],
  },
  {
    id: "generar-pdf",
    question: "¿Cómo genero el PDF de un presupuesto?",
    moduleId: "presupuestos",
    steps: [
      "Entrá al detalle del presupuesto.",
      "Hacé clic en “Generar PDF”.",
      "El PDF se descarga automáticamente.",
    ],
  },
  {
    id: "editar-presupuesto",
    question: "¿Cómo edito un presupuesto ya creado?",
    moduleId: "presupuestos",
    steps: [
      "Entrá al presupuesto y hacé clic en “Editar”.",
      "Modificá cliente, productos u observaciones.",
      "Al guardar se crea un presupuesto nuevo; el original se conserva intacto.",
    ],
  },
  {
    id: "consultar-stock",
    question: "¿Cómo consulto el stock de mis productos?",
    moduleId: "productos",
    steps: [
      "Entrá en Productos: cada fila muestra el stock actual, con aviso si está bajo.",
      "También podés ver un resumen de stock bajo en el Dashboard y en el ícono de notificaciones (campana) del encabezado.",
    ],
  },
  {
    id: "registrar-competencia",
    question: "¿Cómo registro un precio de la competencia?",
    moduleId: "competencia",
    steps: [
      "Entrá en Competencia → “Nuevo registro”.",
      "Elegí el producto, el precio de la competencia y la fuente.",
      "Guardá.",
    ],
  },
  {
    id: "configurar-pdf",
    question: "¿Cómo configuro los datos que aparecen en el PDF de presupuestos?",
    moduleId: "configuracion",
    steps: [
      "Entrá en Configuración → Empresas.",
      "Editá la empresa (o creá una nueva) y completá logo, datos fiscales y condiciones comerciales.",
      "Guardá — se van a usar en los presupuestos que emitas con esa empresa de ahora en más.",
    ],
  },
  {
    id: "varias-empresas",
    question: "¿Cómo trabajo con más de una empresa?",
    moduleId: "configuracion",
    steps: [
      "Entrá en Configuración → Empresas y creá cada empresa con su logo y sus datos.",
      "Al armar un presupuesto, elegí la empresa emisora en el selector de arriba.",
      "El PDF sale con el logo, los datos fiscales y las condiciones de esa empresa. No se duplican clientes ni productos: son los mismos para todas las empresas.",
    ],
  },
];

export interface HelpConcept {
  id: string;
  title: string;
  description: string;
}

export const helpConcepts: HelpConcept[] = [
  {
    id: "producto-vs-stock",
    title: "Producto vs. stock",
    description:
      "Un producto puede existir en el catálogo aunque tenga 0 unidades de stock. Eso no le impide ser cotizado a un proveedor o incluido en un presupuesto: el stock es solo un dato más del producto, no una condición para usarlo.",
  },
  {
    id: "cotizacion-vs-presupuesto",
    title: "Cotización de proveedor vs. presupuesto",
    description:
      "Una cotización de proveedor representa un costo de compra (lo que vos pagás). Un presupuesto representa una propuesta comercial enviada a un cliente (lo que le cobrás). Ambas usan productos del mismo catálogo, pero son registros completamente distintos.",
  },
  {
    id: "costo-nacionalizado-vs-precio-venta",
    title: "Costo nacionalizado vs. precio de venta",
    description:
      "El costo nacionalizado es el costo FOB de una cotización más los costos variables (nacionalización, comisión, costos financieros, envío, seguro, otros gastos). El precio de venta es el que vos definís a mano en la ficha del producto. La diferencia entre ambos es el margen que ves en Análisis y en el Comparador de proveedores.",
  },
  {
    id: "mercado-vs-competencia",
    title: "Mercado vs. Competencia",
    description:
      "Son dos formas parecidas pero distintas de registrar precios externos. “Mercado” vive dentro de la ficha de cada producto, con historial y estadísticas (mínimo, máximo, promedio). “Competencia” es un registro más simple y puntual, con su propia sección en el menú. Hoy conviven ambos.",
  },
  {
    id: "editar-es-copiar",
    title: "Editar un presupuesto = crear una copia",
    description:
      "El sistema nunca sobrescribe un presupuesto existente. “Editar” arma un presupuesto nuevo con su propio número secuencial, y el original queda intacto para siempre. Así se conserva el historial exacto de qué se le propuso a cada cliente en cada momento.",
  },
  {
    id: "config-global-vs-proveedor",
    title: "Configuración global vs. configuración por proveedor",
    description:
      "Los costos definidos en Configuración son el default que usa todo el sistema. Si un proveedor tiene su propia configuración de costos, esa reemplaza a la global solo para ese proveedor — no hace falta definir todos los campos, los que queden vacíos usan el valor global.",
  },
];

export interface QuickStartStep {
  title: string;
  description: string;
  moduleId: string;
}

export const quickStartSteps: QuickStartStep[] = [
  {
    title: "Cargá tus empresas",
    description:
      "Creá cada empresa emisora con su logo y sus datos: es la identidad que va a aparecer en el PDF.",
    moduleId: "configuracion",
  },
  {
    title: "Cargá tus productos",
    description: "Armá tu catálogo con nombre, categoría, precio y stock.",
    moduleId: "productos",
  },
  {
    title: "Cargá tus proveedores",
    description: "Registrá los proveedores a los que les comprás.",
    moduleId: "proveedores",
  },
  {
    title: "Registrá cotizaciones",
    description:
      "Cargá el costo FOB de tus productos por proveedor para tener el costo nacionalizado calculado.",
    moduleId: "proveedores",
  },
  {
    title: "Cargá precios de mercado (opcional)",
    description:
      "Sumá relevamientos manuales para comparar tu precio de venta contra el mercado.",
    moduleId: "productos",
  },
  {
    title: "Cargá tus clientes",
    description: "Registrá tu cartera de contactos comerciales.",
    moduleId: "clientes",
  },
  {
    title: "Creá tu primer presupuesto",
    description: "Elegí cliente y productos, y generá el PDF para enviar.",
    moduleId: "presupuestos",
  },
];
