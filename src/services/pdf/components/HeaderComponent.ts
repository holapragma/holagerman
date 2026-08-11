import type { LayoutContext, Component, CompanyInfo } from "../pdf.types";
import {
  drawText,
  drawLine,
  SPACING,
  FONT_SIZES,
  formatDate,
  addDays,
} from "../pdf.utils";

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "German CRM",
  email: null,
  phone: null,
  address: null,
  website: null,
  quoteValidityDays: 30,
};

export class HeaderComponent implements Component {
  private companyInfo: CompanyInfo = DEFAULT_COMPANY_INFO;

  setCompanyInfo(info: CompanyInfo): this {
    this.companyInfo = info;
    return this;
  }

  async render(ctx: LayoutContext): Promise<number> {
    const { width, margin, colors, quote, y: startY } = ctx;

    const nameSize = FONT_SIZES["2xl"];
    const nameBaselineY = startY - nameSize * 0.8;
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
    const leftBottom = subtitleY - FONT_SIZES.sm * 0.3;

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
