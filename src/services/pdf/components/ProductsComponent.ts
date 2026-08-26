import type { LayoutContext, Component, ProductRow } from "../pdf.types";
import {
  drawText,
  drawLine,
  drawRect,
  measureText,
  truncateText,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  formatCurrency,
} from "../pdf.utils";

const ROW_HEIGHT = 30;
const DESCRIPTION_EXTRA = 13;
const HEADER_BLOCK = 66;

export class ProductsComponent implements Component {
  private rows: ProductRow[] = [];

  setRows(rows: ProductRow[]): this {
    this.rows = rows;
    return this;
  }

  estimateHeight(): number {
    return (
      HEADER_BLOCK +
      this.rows.reduce(
        (total, row) => total + ROW_HEIGHT + (row.description ? DESCRIPTION_EXTRA : 0),
        0,
      )
    );
  }

  async render(ctx: LayoutContext): Promise<number> {
    const { margin, contentWidth, colors, y: startY } = ctx;
    let y = startY - SPACING.lg;

    await drawText(ctx, "PRODUCTOS Y SERVICIOS", {
      x: margin,
      y,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "bold",
    });
    y -= SPACING.xl + SPACING.xs;

    const colGap = SPACING.md;
    const innerWidth = contentWidth - colGap * 3;

    const qtyLabel = "Cant.";
    const qtyTextWidths = await Promise.all([
      measureText(ctx, qtyLabel, FONT_SIZES.xs, "bold"),
      ...this.rows.map((r) => measureText(ctx, String(r.quantity), FONT_SIZES.sm, "regular")),
    ]);
    const priceTextWidths = await Promise.all([
      measureText(ctx, "Precio unit.", FONT_SIZES.xs, "bold"),
      ...this.rows.map((r) => measureText(ctx, formatCurrency(r.unitPrice), FONT_SIZES.sm, "regular")),
    ]);
    const subtotalTextWidths = await Promise.all([
      measureText(ctx, "Subtotal", FONT_SIZES.xs, "bold"),
      ...this.rows.map((r) => measureText(ctx, formatCurrency(r.subtotal), FONT_SIZES.sm, "bold")),
    ]);

    const cellPadding = SPACING.xs;
    const qtyWidth = Math.max(...qtyTextWidths) + cellPadding * 2;
    const priceWidth = Math.max(...priceTextWidths) + cellPadding * 2;
    const subtotalWidth = Math.max(...subtotalTextWidths) + cellPadding * 2;
    const productWidth = Math.max(innerWidth - qtyWidth - priceWidth - subtotalWidth, innerWidth * 0.3);

    const colWidths = { product: productWidth, qty: qtyWidth, price: priceWidth, subtotal: subtotalWidth };
    const colX = {
      product: margin,
      qty: margin + productWidth + colGap,
      price: margin + productWidth + colGap + qtyWidth + colGap,
      subtotal: margin + productWidth + colGap + qtyWidth + colGap + priceWidth + colGap,
    };

    const headerRowHeight = 26;
    const bandTop = y + headerRowHeight * 0.65;
    await drawRect(ctx, {
      x: margin,
      y: bandTop,
      width: contentWidth,
      height: headerRowHeight,
      color: colors.surface,
      borderRadius: BORDER_RADIUS.sm,
    });

    await drawText(ctx, "Producto", { x: colX.product, y, size: FONT_SIZES.xs - 1, color: colors.textMuted, font: "bold" });
    await drawText(ctx, qtyLabel, {
      x: colX.qty + colWidths.qty / 2,
      y,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "bold",
      align: "center",
    });
    await drawText(ctx, "Precio unit.", {
      x: colX.price + colWidths.price - SPACING.xs,
      y,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "bold",
      align: "right",
    });
    await drawText(ctx, "Subtotal", {
      x: colX.subtotal + colWidths.subtotal - SPACING.xs,
      y,
      size: FONT_SIZES.xs - 1,
      color: colors.textMuted,
      font: "bold",
      align: "right",
    });

    y = bandTop - headerRowHeight - SPACING.xs;

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      const rowHeight = ROW_HEIGHT + (row.description ? DESCRIPTION_EXTRA : 0);
      y -= rowHeight;
      const textY = row.description
        ? y + rowHeight - FONT_SIZES.sm * 1.55
        : y + rowHeight / 2 - FONT_SIZES.sm / 2.8;

      const productName = await truncateText(ctx, row.name, FONT_SIZES.sm, "bold", colWidths.product - SPACING.xs);
      await drawText(ctx, productName, { x: colX.product, y: textY, size: FONT_SIZES.sm, color: colors.textPrimary, font: "bold" });

      if (row.description) {
        const description = await truncateText(
          ctx,
          row.description,
          FONT_SIZES.xs - 1,
          "regular",
          colWidths.product - SPACING.xs,
        );
        await drawText(ctx, description, {
          x: colX.product,
          y: textY - DESCRIPTION_EXTRA,
          size: FONT_SIZES.xs - 1,
          color: colors.textMuted,
          font: "regular",
        });
      }
      await drawText(ctx, String(row.quantity), {
        x: colX.qty + colWidths.qty / 2,
        y: textY,
        size: FONT_SIZES.sm,
        color: colors.textSecondary,
        font: "regular",
        align: "center",
      });
      await drawText(ctx, formatCurrency(row.unitPrice), {
        x: colX.price + colWidths.price - SPACING.xs,
        y: textY,
        size: FONT_SIZES.sm,
        color: colors.textSecondary,
        font: "regular",
        align: "right",
      });
      await drawText(ctx, formatCurrency(row.subtotal), {
        x: colX.subtotal + colWidths.subtotal - SPACING.xs,
        y: textY,
        size: FONT_SIZES.sm,
        color: colors.textPrimary,
        font: "bold",
        align: "right",
      });

      await drawLine(ctx, { x1: margin, y1: y, x2: margin + contentWidth, y2: y, color: colors.borderLight, thickness: 0.75 });
    }

    return y;
  }
}
