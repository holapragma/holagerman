import type { LayoutContext, Component } from "../pdf.types";
import { drawText, countWrappedLines, SPACING, FONT_SIZES } from "../pdf.utils";

export class ObservationsComponent implements Component {
  private notes: string = "";

  setNotes(notes: string): this {
    this.notes = notes;
    return this;
  }

  async render(ctx: LayoutContext): Promise<number> {
    if (!this.notes || this.notes.trim() === "") {
      return ctx.y;
    }

    const { margin, contentWidth, colors, y: startY } = ctx;
    let y = startY - SPACING.lg;

    await drawText(ctx, "OBSERVACIONES", { x: margin, y, size: FONT_SIZES.xs - 1, color: colors.textMuted, font: "bold" });
    y -= SPACING.md;

    const paragraphs = this.notes.split("\n\n").filter((p) => p.trim() !== "");
    const lineHeight = FONT_SIZES.sm * 1.5;

    for (const paragraph of paragraphs) {
      const lines = await countWrappedLines(ctx, paragraph.trim(), FONT_SIZES.sm, "regular", contentWidth);
      await drawText(ctx, paragraph.trim(), {
        x: margin,
        y,
        size: FONT_SIZES.sm,
        color: colors.textSecondary,
        font: "regular",
        maxWidth: contentWidth,
        lineHeight: 1.5,
      });
      y -= lines * lineHeight + SPACING.xs;
    }

    return y;
  }
}
