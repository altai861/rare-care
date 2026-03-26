import type { Locale } from "@/lib/data/types";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";

export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
