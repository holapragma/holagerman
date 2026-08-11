import type { LayoutContext, Component } from "../pdf.types";
import { drawText, drawRect, countWrappedLines, SPACING, FONT_SIZES, BORDER_RADIUS } from "../pdf.utils";

export interface ConditionPair {
  label: string;
  value: string;
}

const COLUMNS = 2;

export class ConditionsComponent implements Component {
  private conditions: ConditionPair[] = [
    { label: "Validez", value: "30 días desde la fecha de emisión" },
    { label: "Forma de pago", value: "a convenir (transferencia, cheque, efectivo)" },
    { label: "Tiempo de entrega", value: "a confirmar según disponibilidad de stock" },
    { label: "Garantía", value: "según términos del fabricante" },
  ];

  setConditions(conditions: ConditionPair[]): this {
    this.conditions = conditions;
    return this;
  }

  getConditionsCount(): number {
    return this.conditions.length;
  }

  async render(ctx: LayoutContext): Promise<number> {
    const { margin, contentWidth, colors, y: startY } = ctx;
    let y = startY - SPACING.lg;

    await drawText(ctx, "CONDICIONES COMERCIALES", {
      x: margin,
      y,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "bold",
    });
    y -= SPACING.lg;

    if (this.conditions.length === 0) {
      return y;
    }

    const colGap = SPACING.md;
    const boxWidth = (contentWidth - colGap * (COLUMNS - 1)) / COLUMNS;
    const padding = SPACING.sm;
    const labelSize = FONT_SIZES.xs;
    const valueSize = FONT_SIZES.xs;
    const valueLineHeight = valueSize * 1.4;
    const rowGap = SPACING.sm;

    for (let i = 0; i < this.conditions.length; i += COLUMNS) {
      const rowItems = this.conditions.slice(i, i + COLUMNS);
      const lineCounts = await Promise.all(
        rowItems.map((item) => countWrappedLines(ctx, item.value, valueSize, "regular", boxWidth - padding * 2)),
      );
      const maxLines = Math.max(...lineCounts, 1);
      const boxHeight = padding * 2 + labelSize * 1.3 + maxLines * valueLineHeight;

      for (let col = 0; col < rowItems.length; col++) {
        const item = rowItems[col];
        const boxX = margin + col * (boxWidth + colGap);

        await drawRect(ctx, {
          x: boxX,
          y,
          width: boxWidth,
          height: boxHeight,
          color: colors.surface,
          borderRadius: BORDER_RADIUS.md,
        });

        let textY = y - padding - labelSize * 0.8;
        await drawText(ctx, item.label.toUpperCase(), {
          x: boxX + padding,
          y: textY,
          size: labelSize,
          color: colors.textPrimary,
          font: "bold",
        });
        textY -= labelSize * 1.3;
        await drawText(ctx, item.value, {
          x: boxX + padding,
          y: textY,
          size: valueSize,
          color: colors.textSecondary,
          font: "regular",
          maxWidth: boxWidth - padding * 2,
          lineHeight: 1.4,
        });
      }

      y -= boxHeight + rowGap;
    }

    return y + rowGap;
  }
}
