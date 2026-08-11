import type { LayoutContext, Component, CompanyInfo } from "../pdf.types";
import { drawText, drawLine, FONT_SIZES } from "../pdf.utils";

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "German CRM",
  email: null,
  phone: null,
  address: null,
  website: null,
  quoteValidityDays: 30,
};

export class FooterComponent implements Component {
  private companyInfo: CompanyInfo = DEFAULT_COMPANY_INFO;

  setCompanyInfo(info: CompanyInfo): this {
    this.companyInfo = info;
    return this;
  }

  async render(ctx: LayoutContext): Promise<number> {
    const { width, margin, colors, pageNumber, totalPages } = ctx;

    const lineHeight = 13;
    const footerY = margin + lineHeight * 3 + 2;

    await drawLine(ctx, {
      x1: margin,
      y1: footerY + 14,
      x2: width - margin,
      y2: footerY + 14,
      color: colors.borderLight,
      thickness: 0.75,
    });

    const contactLine = [this.companyInfo.email, this.companyInfo.phone].filter(Boolean).join("  ·  ");

    await drawText(ctx, this.companyInfo.name, {
      x: margin,
      y: footerY,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "bold",
    });

    if (this.companyInfo.address) {
      await drawText(ctx, this.companyInfo.address, {
        x: margin,
        y: footerY - lineHeight,
        size: FONT_SIZES.xs - 1,
        color: colors.textMuted,
        font: "regular",
      });
    }

    if (contactLine) {
      await drawText(ctx, contactLine, {
        x: margin,
        y: footerY - lineHeight * 2,
        size: FONT_SIZES.xs - 1,
        color: colors.textMuted,
        font: "regular",
      });
    }

    if (this.companyInfo.website) {
      await drawText(ctx, this.companyInfo.website, {
        x: margin,
        y: footerY - lineHeight * 3,
        size: FONT_SIZES.xs - 1,
        color: colors.textMuted,
        font: "bold",
      });
    }

    await drawText(ctx, `Página ${pageNumber} de ${totalPages}`, {
      x: width - margin,
      y: footerY,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "regular",
      align: "right",
    });

    return footerY - lineHeight * 3 - 10;
  }
}
