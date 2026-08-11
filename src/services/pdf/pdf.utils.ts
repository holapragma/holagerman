import { rgb } from "pdf-lib";
import type { RGB, PDFFont } from "pdf-lib";
import type { LayoutContext } from "./pdf.types";

export type IconType =
  | "phone"
  | "mail"
  | "web"
  | "pin"
  | "user"
  | "building"
  | "note"
  | "conditions";

export const COLORS = {
  primary: "#0F5132",
  secondary: "#2E7D32",
  textPrimary: "#212121",
  textSecondary: "#424242",
  textMuted: "#757575",
  textOnPrimary: "#FFFFFF",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  border: "#E0E0E0",
  borderLight: "#F5F5F5",
  accent: "#0F5132",
  accentForeground: "#FFFFFF",
  surfaceHover: "#F0F0F0",
  warning: "#92400E",
  warningBackground: "#FFFBEB",
  warningBorder: "#FDE68A",
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  "2xl": 22,
  "3xl": 26,
  "4xl": 32,
  "5xl": 38,
};

export const SPACING = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
  "5xl": 96,
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function drawText(
  ctx: LayoutContext,
  text: string,
  options: {
    x: number;
    y: number;
    size: number;
    color: string | RGB;
    font: "regular" | "medium" | "bold";
    align?: "left" | "center" | "right";
    maxWidth?: number;
    lineHeight?: number;
  }
): Promise<void> {
  const { page, fonts } = ctx;
  let pdfFont;

  switch (options.font) {
    case "bold":
      pdfFont = fonts.bold;
      break;
    case "medium":
      pdfFont = fonts.medium;
      break;
    default:
      pdfFont = fonts.regular;
  }

  let color: RGB;
  if (typeof options.color === "string") {
    color = parseColor(options.color);
  } else {
    color = options.color;
  }

  let lines = text.split("\n");
  if (options.maxWidth) {
    lines = lines.flatMap((line) => wrapText(pdfFont, line, options.size, options.maxWidth as number));
  }

  const lineHeight = options.lineHeight ? options.size * options.lineHeight : options.size * 1.2;

  let yPos = options.y;

  for (const line of lines) {
    const textWidth = pdfFont.widthOfTextAtSize(line, options.size);

    let xPos = options.x;
    if (options.align === "center") {
      xPos -= textWidth / 2;
    } else if (options.align === "right") {
      xPos -= textWidth;
    }

    page.drawText(line, {
      x: xPos,
      y: yPos,
      size: options.size,
      font: pdfFont,
      color: color,
    });

    yPos -= lineHeight;
  }
}

export async function countWrappedLines(
  ctx: LayoutContext,
  text: string,
  size: number,
  font: "regular" | "medium" | "bold",
  maxWidth: number
): Promise<number> {
  const { fonts } = ctx;
  let pdfFont;

  switch (font) {
    case "bold":
      pdfFont = fonts.bold;
      break;
    case "medium":
      pdfFont = fonts.medium;
      break;
    default:
      pdfFont = fonts.regular;
  }

  return text.split("\n").reduce((total, line) => total + wrapText(pdfFont, line, size, maxWidth).length, 0);
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

/**
 * Draws a filled (optionally bordered, optionally rounded) rectangle.
 *
 * `options.y` is the TOP edge of the box (matching how every component
 * tracks its layout cursor), the box extends downward by `options.height`.
 * pdf-lib itself anchors rectangles at the bottom-left corner, so this
 * function does the top→bottom-left conversion internally.
 */
export async function drawRect(
  ctx: LayoutContext,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string | RGB;
    borderRadius?: number;
    borderColor?: string | RGB;
    borderWidth?: number;
  }
): Promise<void> {
  const { page } = ctx;

  let color: RGB;
  if (typeof options.color === "string") {
    color = parseColor(options.color);
  } else {
    color = options.color;
  }

  let borderColor: RGB | undefined;
  if (options.borderColor) {
    if (typeof options.borderColor === "string") {
      borderColor = parseColor(options.borderColor);
    } else {
      borderColor = options.borderColor;
    }
  }

  if (options.borderRadius && options.borderRadius > 0) {
    const path = roundedRectPath(options.width, options.height, options.borderRadius);
    page.drawSvgPath(path, {
      x: options.x,
      y: options.y,
      color,
      borderColor,
      borderWidth: borderColor ? options.borderWidth || 1 : undefined,
    });
    return;
  }

  page.drawRectangle({
    x: options.x,
    y: options.y - options.height,
    width: options.width,
    height: options.height,
    color: color,
    borderColor: borderColor,
    borderWidth: borderColor ? options.borderWidth || 1 : undefined,
  });
}

function roundedRectPath(width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${r} 0`,
    `L ${width - r} 0`,
    `Q ${width} 0 ${width} ${r}`,
    `L ${width} ${height - r}`,
    `Q ${width} ${height} ${width - r} ${height}`,
    `L ${r} ${height}`,
    `Q 0 ${height} 0 ${height - r}`,
    `L 0 ${r}`,
    `Q 0 0 ${r} 0`,
    "Z",
  ].join(" ");
}

export async function drawLine(
  ctx: LayoutContext,
  options: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string | RGB;
    thickness?: number;
  }
): Promise<void> {
  const { page } = ctx;

  let color: RGB;
  if (typeof options.color === "string") {
    color = parseColor(options.color);
  } else {
    color = options.color;
  }

  page.drawLine({
    start: { x: options.x1, y: options.y1 },
    end: { x: options.x2, y: options.y2 },
    thickness: options.thickness || 1,
    color: color,
  });
}

export async function measureText(
  ctx: LayoutContext,
  text: string,
  size: number,
  font: "regular" | "medium" | "bold"
): Promise<number> {
  const { fonts } = ctx;
  let pdfFont;

  switch (font) {
    case "bold":
      pdfFont = fonts.bold;
      break;
    case "medium":
      pdfFont = fonts.medium;
      break;
    default:
      pdfFont = fonts.regular;
  }

  return pdfFont.widthOfTextAtSize(text, size);
}

/** Truncates text with an ellipsis so it fits on a single line within maxWidth. */
export async function truncateText(
  ctx: LayoutContext,
  text: string,
  size: number,
  font: "regular" | "medium" | "bold",
  maxWidth: number
): Promise<string> {
  const { fonts } = ctx;
  const pdfFont = font === "bold" ? fonts.bold : font === "medium" ? fonts.medium : fonts.regular;

  if (pdfFont.widthOfTextAtSize(text, size) <= maxWidth) {
    return text;
  }

  const ellipsis = "…";
  let truncated = text;
  while (truncated.length > 0 && pdfFont.widthOfTextAtSize(truncated + ellipsis, size) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + ellipsis;
}

function parseColor(color: string): RGB {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

export async function drawIcon(
  ctx: LayoutContext,
  options: {
    type: IconType;
    x: number;
    y: number;
    size?: number;
    color?: string;
    bgColor?: string;
  }
): Promise<void> {
  const { page } = ctx;
  const size = options.size || 18;
  const bgColor = options.bgColor || COLORS.primary;
  const color = options.color || COLORS.textOnPrimary;

  const stroke = parseColor(color);

  await drawRect(ctx, {
    x: options.x,
    y: options.y + size,
    width: size,
    height: size,
    color: bgColor,
    borderRadius: size * 0.28,
  });

  const c = options.x + size / 2;
  const m = options.y + size / 2;
  const strokeWidth = Math.max(1, size * 0.09);
  const base = size * 0.22;

  switch (options.type) {
    case "phone":
      page.drawLine({
        start: { x: c - base * 0.4, y: m + base * 0.7 },
        end: { x: c - base * 0.4, y: m + base },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawLine({
        start: { x: c - base * 0.4, y: m + base * 0.7 },
        end: { x: c + base * 0.3, y: m - base * 0.7 },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawLine({
        start: { x: c + base * 0.3, y: m - base * 0.7 },
        end: { x: c + base * 0.4, y: m - base * 0.7 },
        thickness: strokeWidth,
        color: stroke,
      });
      break;
    case "mail":
      page.drawRectangle({
        x: options.x + size * 0.18,
        y: m - base * 0.55,
        width: size * 0.64,
        height: size * 0.5,
        borderColor: stroke,
        borderWidth: strokeWidth,
      });
      page.drawLine({
        start: { x: options.x + size * 0.18, y: m + base * 0.5 },
        end: { x: options.x + size * 0.5, y: m },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawLine({
        start: { x: options.x + size * 0.82, y: m + base * 0.5 },
        end: { x: options.x + size * 0.5, y: m },
        thickness: strokeWidth,
        color: stroke,
      });
      break;
    case "web":
      page.drawCircle({
        x: c,
        y: m,
        size: size * 0.32,
        borderColor: stroke,
        borderWidth: strokeWidth,
      });
      page.drawLine({
        start: { x: options.x + size * 0.2, y: m },
        end: { x: options.x + size * 0.8, y: m },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawLine({
        start: { x: c, y: m - size * 0.34 },
        end: { x: c, y: m + size * 0.34 },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawEllipse({
        x: c,
        y: m,
        xScale: size * 0.12,
        yScale: size * 0.34,
        borderColor: stroke,
        borderWidth: strokeWidth,
      });
      break;
    case "pin":
      page.drawCircle({
        x: c,
        y: m - size * 0.04,
        size: size * 0.17,
        color: stroke,
      });
      page.drawLine({
        start: { x: c, y: m + size * 0.1 },
        end: { x: c, y: options.y + size * 0.78 },
        thickness: strokeWidth,
        color: stroke,
      });
      break;
    case "user":
      page.drawCircle({
        x: c,
        y: m + size * 0.14,
        size: size * 0.12,
        color: stroke,
      });
      page.drawEllipse({
        x: c,
        y: m - size * 0.28,
        xScale: size * 0.2,
        yScale: size * 0.16,
        color: stroke,
      });
      break;
    case "building":
      page.drawRectangle({
        x: options.x + size * 0.28,
        y: m - size * 0.32,
        width: size * 0.44,
        height: size * 0.6,
        borderColor: stroke,
        borderWidth: strokeWidth,
      });
      for (let i = 0; i < 2; i++) {
        page.drawRectangle({
          x: options.x + size * 0.34 + i * size * 0.16,
          y: m + size * 0.06,
          width: size * 0.09,
          height: size * 0.09,
          color: stroke,
        });
      }
      break;
    case "note":
      page.drawLine({
        start: { x: options.x + size * 0.25, y: m + size * 0.24 },
        end: { x: options.x + size * 0.7, y: m + size * 0.24 },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawLine({
        start: { x: options.x + size * 0.25, y: m },
        end: { x: options.x + size * 0.7, y: m },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawLine({
        start: { x: options.x + size * 0.25, y: m - size * 0.24 },
        end: { x: options.x + size * 0.55, y: m - size * 0.24 },
        thickness: strokeWidth,
        color: stroke,
      });
      break;
    case "conditions":
      for (let i = 0; i < 2; i++) {
        page.drawLine({
          start: { x: options.x + size * 0.28 + i * size * 0.2, y: m - size * 0.25 },
          end: { x: options.x + size * 0.28 + i * size * 0.2, y: m + size * 0.25 },
          thickness: strokeWidth,
          color: stroke,
        });
      }
      page.drawLine({
        start: { x: options.x + size * 0.22, y: m - size * 0.25 },
        end: { x: options.x + size * 0.78, y: m - size * 0.25 },
        thickness: strokeWidth,
        color: stroke,
      });
      page.drawLine({
        start: { x: options.x + size * 0.22, y: m + size * 0.25 },
        end: { x: options.x + size * 0.78, y: m + size * 0.25 },
        thickness: strokeWidth,
        color: stroke,
      });
      break;
  }
}