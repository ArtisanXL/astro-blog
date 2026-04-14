import type { Locale } from "~/i18n";

const INTL_LOCALE: Record<Locale, string> = { tr: "tr-TR", en: "en-US" };

const shortCache = new Map<Locale, Intl.DateTimeFormat>();
const longCache = new Map<Locale, Intl.DateTimeFormat>();

function shortFmt(locale: Locale): Intl.DateTimeFormat {
  let f = shortCache.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "2-digit", month: "short", year: "numeric" });
    shortCache.set(locale, f);
  }
  return f;
}

function longFmt(locale: Locale): Intl.DateTimeFormat {
  let f = longCache.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "long", year: "numeric" });
    longCache.set(locale, f);
  }
  return f;
}

export function formatDate(d: Date | string, locale: Locale): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return shortFmt(locale).format(dt);
}

export function formatDateLong(d: Date | string, locale: Locale): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return longFmt(locale).format(dt);
}
