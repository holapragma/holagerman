import type { LayoutContext, Component } from "../pdf.types";
import { drawText, drawRect, SPACING, FONT_SIZES, BORDER_RADIUS } from "../pdf.utils";

export class ClientCardComponent implements Component {
  async render(ctx: LayoutContext): Promise<number> {
    const { margin, contentWidth, colors, quote, y: startY } = ctx;
    let y = startY - SPACING.lg;

    const client = quote.client;

    const labelSize = FONT_SIZES.xs - 1;
    await drawText(ctx, "PRESUPUESTADO PARA", {
      x: margin,
      y,
      size: labelSize,
      color: colors.textMuted,
      font: "bold",
    });
    y -= labelSize + SPACING.sm;

    const boxTop = y;
    const padding = SPACING.md;

    const nameSize = FONT_SIZES.base;
    const companySize = FONT_SIZES.sm;
    const nameLineHeight = nameSize * 1.3;
    const companyLineHeight = companySize * 1.4;

    const leftHeight = nameLineHeight + (client.company ? companyLineHeight : 0);

    const contactParts = [client.email, client.phone].filter(Boolean) as string[];
    const rightHeight = contactParts.length * companyLineHeight;

    const innerHeight = Math.max(leftHeight, rightHeight, nameLineHeight);
    const boxHeight = innerHeight + padding * 2;

    await drawRect(ctx, {
      x: margin,
      y: boxTop,
      width: contentWidth,
      height: boxHeight,
      color: colors.surface,
      borderRadius: BORDER_RADIUS.md,
    });

    let leftY = boxTop - padding - nameSize * 0.8;
    await drawText(ctx, client.name, {
      x: margin + padding,
      y: leftY,
      size: nameSize,
      color: colors.textPrimary,
      font: "bold",
    });

    if (client.company) {
      leftY -= nameLineHeight;
      await drawText(ctx, client.company, {
        x: margin + padding,
        y: leftY,
        size: companySize,
        color: colors.textSecondary,
        font: "regular",
      });
    }

    let rightY = boxTop - padding - companySize * 0.8;
    const rightX = margin + contentWidth - padding;
    for (const part of contactParts) {
      await drawText(ctx, part, {
        x: rightX,
        y: rightY,
        size: companySize,
        color: colors.textSecondary,
        font: "regular",
        align: "right",
      });
      rightY -= companyLineHeight;
    }

    return boxTop - boxHeight - SPACING.xs;
  }
}
