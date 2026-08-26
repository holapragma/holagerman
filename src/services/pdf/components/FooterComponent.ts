import type { LayoutContext, Component, CompanyInfo } from "../pdf.types";
import { drawText, drawLine, FONT_SIZES } from "../pdf.utils";

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

export class FooterComponent implements Component {
  private companyInfo: CompanyInfo = DEFAULT_COMPANY_INFO;

  setCompanyInfo(info: CompanyInfo): this {
    this.companyInfo = info;
    return this;
  }

  async render(ctx: LayoutContext): Promise<number> {
    const { width, margin, colors, pageNumber, totalPages } = ctx;

    const lineHeight = 13;
    const footerY = margin + lineHeight + 2;

    await drawLine(ctx, {
      x1: margin,
      y1: footerY + 14,
      x2: width - margin,
      y2: footerY + 14,
      color: colors.borderLight,
      thickness: 0.75,
    });

    // Dirección y contacto ya salen en el encabezado; acá solo la firma mínima.
    await drawText(ctx, this.companyInfo.name, {
      x: margin,
      y: footerY,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "bold",
    });

    if (this.companyInfo.website) {
      await drawText(ctx, this.companyInfo.website, {
        x: margin,
        y: footerY - lineHeight,
        size: FONT_SIZES.xs - 1,
        color: colors.textMuted,
        font: "regular",
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

    return footerY - lineHeight - 10;
  }
}
