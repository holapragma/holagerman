import type { LayoutContext, Component, CompanyInfo } from "../pdf.types";
import {
  drawText,
  drawLine,
  truncateText,
  SPACING,
  FONT_SIZES,
  formatDate,
  addDays,
} from "../pdf.utils";

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "German CRM",
  legalName: null,
  taxId: null,
  email: null,
  phone: null,
  address: null,
  website: null,
  quoteValidityDays: 30,
  logo: null,
};

const LOGO_MAX_WIDTH = 150;
const LOGO_MAX_HEIGHT = 46;
const DETAIL_LINE_HEIGHT = FONT_SIZES.xs * 1.45;

export class HeaderComponent implements Component {
  private companyInfo: CompanyInfo = DEFAULT_COMPANY_INFO;

  setCompanyInfo(info: CompanyInfo): this {
    this.companyInfo = info;
    return this;
  }

  private detailLines(): string[] {
    const { legalName, name, taxId, address, phone, email } = this.companyInfo;
    const lines: string[] = [];

    if (legalName && legalName !== name) lines.push(legalName);
    if (taxId) lines.push(`CUIT ${taxId}`);
    if (address) lines.push(address);

    const contact = [phone, email].filter(Boolean).join("  ·  ");
    if (contact) lines.push(contact);

    return lines;
  }

  estimateHeight(): number {
    const logoHeight = this.companyInfo.logo ? LOGO_MAX_HEIGHT + SPACING.sm : 0;
    const nameBlock = FONT_SIZES["2xl"] * 1.4 + FONT_SIZES.sm * 1.4;
    const details = this.detailLines().length * DETAIL_LINE_HEIGHT;
    return logoHeight + nameBlock + details + SPACING.md + 12;
  }

  private async drawLogo(ctx: LayoutContext, topY: number): Promise<number> {
    const logo = this.companyInfo.logo;
    if (!logo) return topY;

    try {
      const image =
        logo.mimeType === "image/png"
          ? await ctx.pdfDoc.embedPng(logo.data)
          : await ctx.pdfDoc.embedJpg(logo.data);

      const scale = Math.min(
        LOGO_MAX_WIDTH / image.width,
        LOGO_MAX_HEIGHT / image.height,
        1,
      );
      const width = image.width * scale;
      const height = image.height * scale;

      ctx.page.drawImage(image, {
        x: ctx.margin,
        y: topY - height,
        width,
        height,
      });

      return topY - height - SPACING.sm;
    } catch {
      // Un logo corrupto nunca debe romper la generación del presupuesto.
      return topY;
    }
  }

  async render(ctx: LayoutContext): Promise<number> {
    const { width, margin, colors, quote, y: startY } = ctx;

    const afterLogoY = await this.drawLogo(ctx, startY);

    const nameSize = FONT_SIZES["2xl"];
    const nameBaselineY = afterLogoY - nameSize * 0.8;
    await drawText(ctx, this.companyInfo.name, {
      x: margin,
      y: nameBaselineY,
      size: nameSize,
      color: colors.textPrimary,
      font: "bold",
    });

    const subtitleY = nameBaselineY - nameSize * 0.55;
    await drawText(ctx, "Presupuesto Comercial", {
      x: margin,
      y: subtitleY,
      size: FONT_SIZES.sm,
      color: colors.textMuted,
      font: "regular",
    });

    // Una línea por dato: el encabezado nunca debe crecer de alto de forma
    // imprevisible, así que se recorta en lugar de envolver.
    const detailMaxWidth = width * 0.5 - margin;
    let detailY = subtitleY;
    for (const line of this.detailLines()) {
      detailY -= DETAIL_LINE_HEIGHT;
      await drawText(ctx, await truncateText(ctx, line, FONT_SIZES.xs, "regular", detailMaxWidth), {
        x: margin,
        y: detailY,
        size: FONT_SIZES.xs,
        color: colors.textMuted,
        font: "regular",
      });
    }
    const leftBottom = detailY - FONT_SIZES.xs * 0.3;

    const metaX = width - margin;
    const labelSize = FONT_SIZES.xs - 1;
    const labelY = startY - labelSize * 0.8;
    await drawText(ctx, "PRESUPUESTO N°", {
      x: metaX,
      y: labelY,
      size: labelSize,
      color: colors.textMuted,
      font: "bold",
      align: "right",
    });

    const numberSize = FONT_SIZES["2xl"];
    const numberY = labelY - numberSize * 0.9;
    await drawText(ctx, String(quote.number).padStart(6, "0"), {
      x: metaX,
      y: numberY,
      size: numberSize,
      color: colors.primary,
      font: "bold",
      align: "right",
    });

    const dateStr = formatDate(quote.createdAt);
    const validityStr = formatDate(addDays(quote.createdAt, this.companyInfo.quoteValidityDays));
    const dateLine1Y = numberY - numberSize * 0.55;
    await drawText(ctx, `Emitido: ${dateStr}`, {
      x: metaX,
      y: dateLine1Y,
      size: FONT_SIZES.xs,
      color: colors.textMuted,
      font: "regular",
      align: "right",
    });

    const dateLine2Y = dateLine1Y - FONT_SIZES.xs * 1.5;
    await drawText(ctx, `Válido: ${validityStr}`, {
      x: metaX,
      y: dateLine2Y,
      size: FONT_SIZES.xs,
      color: colors.textMuted,
      font: "regular",
      align: "right",
    });
    const rightBottom = dateLine2Y - FONT_SIZES.xs * 0.3;

    const blockBottom = Math.min(leftBottom, rightBottom);
    const dividerY = blockBottom - SPACING.md;
    await drawLine(ctx, {
      x1: margin,
      y1: dividerY,
      x2: width - margin,
      y2: dividerY,
      color: colors.border,
      thickness: 1,
    });

    return dividerY;
  }
}
