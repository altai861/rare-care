import type { Locale } from "@/lib/data/types";

export function formatDisplayDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "mn" ? "mn-MN" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export function formatMonthDay(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "mn" ? "mn-MN" : "en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(date));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
