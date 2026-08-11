import type { LayoutContext, Component } from "../pdf.types";
import { drawText, drawLine, drawRect, SPACING, FONT_SIZES, BORDER_RADIUS, formatCurrency } from "../pdf.utils";

export interface SummaryData {
  subtotal: number;
  discount?: number;
  total: number;
}

const BOX_WIDTH = 220;
const BAR_HEIGHT = 40;

export class SummaryComponent implements Component {
  private data: SummaryData = { subtotal: 0, total: 0 };

  setData(data: SummaryData): this {
    this.data = data;
    return this;
  }

  async render(ctx: LayoutContext): Promise<number> {
    const { margin, contentWidth, colors, y: startY } = ctx;
    let y = startY - SPACING.md;

    const valueX = margin + contentWidth;
    const rowLabelX = valueX - BOX_WIDTH;

    await drawText(ctx, "Subtotal", { x: rowLabelX, y, size: FONT_SIZES.sm, color: colors.textMuted, font: "regular" });
    await drawText(ctx, formatCurrency(this.data.subtotal), {
      x: valueX,
      y,
      size: FONT_SIZES.sm,
      color: colors.textSecondary,
      font: "regular",
      align: "right",
    });
    y -= FONT_SIZES.sm * 1.7;

    if (this.data.discount && this.data.discount > 0) {
      await drawText(ctx, "Descuento", { x: rowLabelX, y, size: FONT_SIZES.sm, color: colors.textMuted, font: "regular" });
      await drawText(ctx, `- ${formatCurrency(this.data.discount)}`, {
        x: valueX,
        y,
        size: FONT_SIZES.sm,
        color: colors.textSecondary,
        font: "regular",
        align: "right",
      });
      y -= FONT_SIZES.sm * 1.7;
    }

    y -= SPACING.xs;
    await drawLine(ctx, { x1: rowLabelX, y1: y, x2: valueX, y2: y, color: colors.border, thickness: 1 });
    y -= SPACING.sm;

    const barTop = y;
    await drawRect(ctx, {
      x: rowLabelX,
      y: barTop,
      width: BOX_WIDTH,
      height: BAR_HEIGHT,
      color: colors.primary,
      borderRadius: BORDER_RADIUS.md,
    });

    const textY = barTop - BAR_HEIGHT / 2 - FONT_SIZES.base / 2.8;
    await drawText(ctx, "TOTAL", {
      x: rowLabelX + SPACING.md,
      y: textY,
      size: FONT_SIZES.base,
      color: colors.textOnPrimary,
      font: "bold",
    });
    await drawText(ctx, formatCurrency(this.data.total), {
      x: valueX - SPACING.md,
      y: textY,
      size: FONT_SIZES.lg,
      color: colors.textOnPrimary,
      font: "bold",
      align: "right",
    });

    y = barTop - BAR_HEIGHT - SPACING.xs;

    return y;
  }
}
