import type { LayoutContext, Component } from "../pdf.types";
import { drawText, drawRect, measureText, countWrappedLines, SPACING, FONT_SIZES, BORDER_RADIUS } from "../pdf.utils";

export class ImportantNoticeComponent implements Component {
  private text: string = "";

  setNotes(text: string): this {
    this.text = text.trim();
    return this;
  }

  hasContent(): boolean {
    return this.text.length > 0;
  }

  async render(ctx: LayoutContext): Promise<number> {
    if (!this.text) return ctx.y;

    const { margin, contentWidth, colors, y: startY } = ctx;
    const y = startY - SPACING.lg;

    const padding = SPACING.md;
    const size = FONT_SIZES.sm;
    const lineHeight = size * 1.5;
    const prefix = "Importante:";
    const prefixWidth = await measureText(ctx, prefix, size, "bold");
    const gap = SPACING.xs;
    const textMaxWidth = contentWidth - padding * 2 - prefixWidth - gap;

    const lines = await countWrappedLines(ctx, this.text, size, "regular", textMaxWidth);
    const boxHeight = padding * 2 + Math.max(lines, 1) * lineHeight - (lineHeight - size);

    await drawRect(ctx, {
      x: margin,
      y,
      width: contentWidth,
      height: boxHeight,
      color: colors.warningBackground,
      borderColor: colors.warningBorder,
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.md,
    });

    const textY = y - padding - size * 0.8;
    await drawText(ctx, prefix, { x: margin + padding, y: textY, size, color: colors.warning, font: "bold" });
    await drawText(ctx, this.text, {
      x: margin + padding + prefixWidth + gap,
      y: textY,
      size,
      color: colors.warning,
      font: "regular",
      maxWidth: textMaxWidth,
      lineHeight: 1.5,
    });

    return y - boxHeight - SPACING.xs;
  }
}
