/**
 * Site-wide metadata that is language-neutral.
 * Strings shown to readers live in `src/i18n/{tr,en}.ts`.
 */
export const SITE = {
  url: "https://mert.gg",
  title: "mert.gg — Mertcan Dinler",
  author: {
    name: "Mertcan Dinler",
    email: "hi@mert.gg",
    handle: "@MertcanDinler0",
    twitter: "https://twitter.com/MertcanDinler0",
    github: "https://github.com/artisanxl",
    linkedin: "https://tr.linkedin.com/in/mertcandinler",
    avatar: "/avatar.svg",
    initials: "MD",
  },
  sourceRepo: "https://github.com/ArtisanXL/astro-blog",
  themeColor: "#ff5c1f",
  ogImage: "/og-default.png",
  social: [
    { label: "GitHub", href: "https://github.com/artisanxl" },
    { label: "Twitter", href: "https://twitter.com/MertcanDinler0" },
    { label: "LinkedIn", href: "https://tr.linkedin.com/in/mertcandinler" },
  ],
} as const;

export type SiteConfig = typeof SITE;

/** Bare host name — "mert.gg". For title suffixes. */
export const BRAND = new URL(SITE.url).host;

import type { Locale } from "~/i18n";

/** Tag slugs → display labels. Tags are slugs in content; labels are per-locale. */
const TAG_LABELS: Record<Locale, Record<string, string>> = {
  tr: {
    laravel: "Laravel",
    php: "PHP",
    livewire: "Livewire",
    react: "React",
    edge: "Edge Computing",
    paket: "Paket Geliştirme",
    performans: "Performans",
    mimari: "Mimari",
    filament: "Filament",
    queue: "Queue & Jobs",
    veritabani: "Veritabanı",
    devops: "DevOps",
    meta: "Meta",
    yazılım: "Yazılım",
    astro: "Astro",
    cloudflare: "Cloudflare",
  },
  en: {
    laravel: "Laravel",
    php: "PHP",
    livewire: "Livewire",
    react: "React",
    edge: "Edge Computing",
    paket: "Package Development",
    performans: "Performance",
    mimari: "Architecture",
    filament: "Filament",
    queue: "Queue & Jobs",
    veritabani: "Databases",
    devops: "DevOps",
    meta: "Meta",
    yazılım: "Software",
    astro: "Astro",
    cloudflare: "Cloudflare",
  },
};

export const tagLabel = (slug: string, locale: Locale): string =>
  TAG_LABELS[locale][slug] ?? slug;

/** Nav entries are slug-keyed; labels resolve through `useTranslations(locale).nav`. */
export const NAV_KEYS = [
  "home",
  "blog",
  "topics",
  "tags",
  "about",
  "cv",
  "colophon",
] as const;
export type NavKey = (typeof NAV_KEYS)[number];

/** Path each nav key resolves to within a locale (prepend `/${locale}`). */
export const NAV_PATHS: Record<NavKey, string> = {
  home: "/",
  blog: "/blog",
  topics: "/topics",
  tags: "/tags",
  about: "/about",
  cv: "/cv",
  colophon: "/colophon",
};
