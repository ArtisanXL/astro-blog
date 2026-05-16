import { tr } from "./tr";
import { en } from "./en";

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

const dict = { tr, en } as const;

export function isLocale(value: string | undefined): value is Locale {
  return value === "tr" || value === "en";
}

export function useTranslations(locale: Locale) {
  return dict[locale];
}

/** Pull the locale from a path like `/en/blog/foo` (defaults to `tr`). */
export function getLocaleFromUrl(url: URL): Locale {
  const first = url.pathname.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** The other locale. Used by the language switcher. */
export function otherLocale(locale: Locale): Locale {
  return locale === "tr" ? "en" : "tr";
}

/** Prefix-aware link helper. `localePath("tr", "/blog")` → `/tr/blog/`. */
export function localePath(locale: Locale, path: string = "/"): string {
  if (path === "/" || path === "") return `/${locale}/`;
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  const withSlash = prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
  return `/${locale}${withSlash}`;
}
