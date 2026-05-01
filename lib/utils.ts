import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Display a normalized RoK number in the smallest faithful form:
 *
 *   2_000_000_000   → "2B"
 *   2_200_000_000   → "2.2B"
 *   77_676_008      → "77 676 008"   (no clean abbreviation; show full)
 *   84_000_000      → "84M"
 *
 * Tries to abbreviate at the largest applicable unit (T/B/M/K) at 0, 1,
 * or 2 decimal places — accepts only when the abbreviation round-trips
 * to the original integer. Otherwise falls back to digit-grouped string
 * with regular spaces. Locale-neutral on purpose.
 *
 * Mirrors rok-admin/lib/utils.ts so server-issued raw integers can be
 * rehydrated to user-friendly form on the form too.
 */
export function formatRokNumber(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n === 0) return "0";

  const abs = Math.abs(n);
  const units: Array<readonly [string, number]> = [
    ["T", 1e12],
    ["B", 1e9],
    ["M", 1e6],
    ["K", 1e3],
  ];

  for (const [letter, unit] of units) {
    if (abs < unit) continue;
    for (const decimals of [0, 1, 2]) {
      const factor = 10 ** decimals;
      const rounded = Math.round((n / unit) * factor) / factor;
      if (Math.abs(rounded * unit - n) < 0.5) {
        const str =
          decimals === 0
            ? String(rounded)
            : rounded.toFixed(decimals).replace(/\.?0+$/, "");
        return `${str}${letter}`;
      }
    }
    break;
  }

  const sign = n < 0 ? "-" : "";
  const grouped = Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + grouped;
}

/**
 * Try to coerce an OCR-returned raw-integer string ("77676008") to a
 * displayable form ("77 676 008" or "77M"). If the input doesn't look
 * like a plain integer string we return it unchanged — the caller may
 * have passed a date / nickname / ID that shouldn't be reformatted.
 */
export function formatOcrNumeric(raw: string): string {
  if (!/^-?\d+$/.test(raw.trim())) return raw;
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return formatRokNumber(n);
}
