import type { Locale } from "@/lib/data/types";

export const locales: Locale[] = ["mn", "en"];
export const defaultLocale: Locale = "mn";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
