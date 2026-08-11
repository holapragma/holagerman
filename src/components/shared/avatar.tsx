import Image from "next/image";
import { cn } from "@/lib/utils";

const AVATAR_PALETTES = [
  { bg: "#e7f0ea", fg: "#0f5132" },
  { bg: "#e9eef3", fg: "#3f5568" },
  { bg: "#f2ece0", fg: "#7a6232" },
  { bg: "#f5e9e6", fg: "#8a4a3f" },
  { bg: "#eceef1", fg: "#4d5560" },
] as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0] ?? "";
  const second = parts.length > 1 ? parts[1][0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
}

export function Avatar({
  name,
  photoUrl,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  const palette = AVATAR_PALETTES[
    name.charCodeAt(0) % AVATAR_PALETTES.length
  ] as (typeof AVATAR_PALETTES)[number];

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={40}
        height={40}
        unoptimized
        className={cn("size-10 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold select-none",
        className,
      )}
      style={{ backgroundColor: palette.bg, color: palette.fg }}
    >
      {initialsOf(name)}
    </div>
  );
}