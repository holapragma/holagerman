import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { QuoteWithRelations } from "@/types";
import type { LayoutContext, Component, Fonts, CompanyInfo } from "./pdf.types";
import { COLORS, SPACING } from "./pdf.utils";
import { HeaderComponent } from "./components/HeaderComponent";
import { ClientCardComponent } from "./components/ClientCardComponent";
import { ProductsComponent } from "./components/ProductsComponent";
import { SummaryComponent } from "./components/SummaryComponent";
import { ObservationsComponent } from "./components/ObservationsComponent";
import { ConditionsComponent } from "./components/ConditionsComponent";
import { ImportantNoticeComponent } from "./components/ImportantNoticeComponent";
import { FooterComponent } from "./components/FooterComponent";

const PAGE_SIZE: [number, number] = [595.28, 841.89];
const FOOTER_RESERVED = 75;
const MAX_TOP_PADDING = 115;

export class PdfService {
  private headerComponent: HeaderComponent;
  private clientCardComponent: ClientCardComponent;
  private productsComponent: ProductsComponent;
  private summaryComponent: SummaryComponent;
  private observationsComponent: ObservationsComponent;
  private conditionsComponent: ConditionsComponent;
  private importantNoticeComponent: ImportantNoticeComponent;
  private footerComponent: FooterComponent;

  constructor() {
    this.headerComponent = new HeaderComponent();
    this.clientCardComponent = new ClientCardComponent();
    this.productsComponent = new ProductsComponent();
    this.summaryComponent = new SummaryComponent();
    this.observationsComponent = new ObservationsComponent();
    this.conditionsComponent = new ConditionsComponent();
    this.importantNoticeComponent = new ImportantNoticeComponent();
    this.footerComponent = new FooterComponent();
  }

  async generateQuotePdf(
    quote: QuoteWithRelations,
    companyInfo: CompanyInfo & { conditions: string },
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontsDir = path.join(process.cwd(), "src/assets/fonts");
    const fontRegularBytes = fs.readFileSync(path.join(fontsDir, "Inter-Regular.ttf"));
    const fontBoldBytes = fs.readFileSync(path.join(fontsDir, "Inter-Bold.ttf"));

    const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);

    const fonts: Fonts = {
      regular: fontRegular,
      medium: fontRegular,
      bold: fontBold,
    };

    const firstPage = pdfDoc.addPage(PAGE_SIZE);
    const { width, height } = firstPage.getSize();
    const margin = 60;
    const contentWidth = width - margin * 2;

    const ctx: LayoutContext = {
      page: firstPage,
      pdfDoc,
      width,
      height,
      margin,
      contentWidth,
      y: height - margin,
      pageNumber: 1,
      totalPages: 1,
      colors: COLORS,
      fonts,
      quote,
    };

    this.setupComponents(quote, companyInfo);

    const topPadding = this.computeTopPadding(ctx);
    ctx.y -= topPadding;

    await this.renderAllComponents(ctx);

    return pdfDoc.save();
  }

  private setupComponents(
    quote: QuoteWithRelations,
    companyInfo: CompanyInfo & { conditions: string },
  ): void {
    const productRows = quote.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

    this.productsComponent.setRows(productRows);
    this.summaryComponent.setData({
      subtotal: quote.subtotal,
      discount: 0,
      iva:
        quote.ivaPct != null
          ? { pct: quote.ivaPct, amount: quote.total - quote.subtotal }
          : undefined,
      total: quote.total,
    });
    this.observationsComponent.setNotes(quote.notes || "");

    this.headerComponent.setCompanyInfo(companyInfo);
    this.footerComponent.setCompanyInfo(companyInfo);

    const conditionsList = companyInfo.conditions
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const conditionPairs: { label: string; value: string }[] = [];
    const warningLines: string[] = [];
    for (const line of conditionsList) {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex > -1) {
        conditionPairs.push({
          label: line.slice(0, separatorIndex).trim(),
          value: line.slice(separatorIndex + 1).trim(),
        });
      } else {
        warningLines.push(line);
      }
    }
    this.conditionsComponent.setConditions(conditionPairs);
    this.importantNoticeComponent.setNotes(warningLines.join(" "));
  }

  /**
   * When everything fits on a single page, push the whole block down so the
   * top and bottom margins are balanced instead of the content hugging the
   * top of the page and leaving a dead gap above the footer.
   */
  private computeTopPadding(ctx: LayoutContext): number {
    const components = this.componentList();
    const gaps = SPACING.lg * (components.length - 1);
    const total = components.reduce((sum, c) => sum + this.estimateComponentHeight(c, ctx), 0) + gaps;
    const available = ctx.height - ctx.margin * 2 - FOOTER_RESERVED;

    if (total >= available) return 0;
    return Math.min((available - total) / 2, MAX_TOP_PADDING);
  }

  private componentList(): Component[] {
    return [
      this.headerComponent,
      this.clientCardComponent,
      this.productsComponent,
      this.summaryComponent,
      this.observationsComponent,
      this.importantNoticeComponent,
      this.conditionsComponent,
    ];
  }

  private async renderAllComponents(ctx: LayoutContext): Promise<void> {
    for (const component of this.componentList()) {
      const yBefore = ctx.y;
      ctx.y = await this.renderWithPageBreak(ctx, component);
      if (ctx.y !== yBefore) {
        ctx.y -= SPACING.lg;
      }
    }

    await this.renderFooterOnAllPages(ctx);
  }

  private async renderWithPageBreak(ctx: LayoutContext, component: Component): Promise<number> {
    const { pdfDoc, margin, height } = ctx;
    const neededHeight = this.estimateComponentHeight(component, ctx);

    if (this.needsNewPage(ctx, neededHeight)) {
      const newPage = pdfDoc.addPage(PAGE_SIZE);
      const { width } = newPage.getSize();

      ctx.page = newPage;
      ctx.width = width;
      ctx.height = height;
      ctx.contentWidth = width - margin * 2;
      ctx.y = height - margin;
      ctx.pageNumber++;
    }

    return component.render(ctx);
  }

  private estimateComponentHeight(component: Component, ctx: LayoutContext): number {
    const { quote } = ctx;

    if (component === this.headerComponent) return 95;
    if (component === this.clientCardComponent) return 116;
    if (component === this.productsComponent) {
      const rowHeight = 30;
      const base = 66;
      return base + quote.items.length * rowHeight;
    }
    if (component === this.summaryComponent) {
      const hasDiscount = false;
      const hasIva = quote.ivaPct != null;
      let height = 110;
      if (hasDiscount) height += 20;
      if (hasIva) height += 20;
      return height;
    }
    if (component === this.observationsComponent) {
      if (!quote.notes) return 0;
      const paragraphs = quote.notes.split("\n\n").filter((p) => p.trim());
      return 36 + paragraphs.length * 22;
    }
    if (component === this.importantNoticeComponent) {
      return this.importantNoticeComponent.hasContent() ? 76 : 0;
    }
    if (component === this.conditionsComponent) {
      const count = this.conditionsComponent.getConditionsCount();
      const rows = Math.ceil(count / 2);
      return SPACING.lg + rows * 54;
    }

    return 60;
  }

  private needsNewPage(ctx: LayoutContext, neededHeight: number): boolean {
    return ctx.y - neededHeight < ctx.margin + FOOTER_RESERVED;
  }

  private async renderFooterOnAllPages(ctx: LayoutContext): Promise<void> {
    const { pdfDoc, margin } = ctx;
    const totalPages = pdfDoc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      const footerCtx: LayoutContext = {
        ...ctx,
        page,
        pageNumber: i + 1,
        totalPages,
        y: margin + 60,
      };
      await this.footerComponent.render(footerCtx);
    }
  }
}

export const pdfService = new PdfService();
