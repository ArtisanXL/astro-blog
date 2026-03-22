/**
 * Single source of truth for site-wide metadata.
 * Edit these values to brand your blog.
 */
export const SITE = {
  url: "https://mert.gg",
  title: "mert.gg — Mertcan Dinler",
  description:
    "Edge'de Laravel, paket geliştirme ve gönderme zanaatı üzerine notlar.",
  author: {
    name: "Mertcan Dinler",
    email: "hello@mert.gg",
    handle: "@MertcanDinler0",
    twitter: "https://twitter.com/MertcanDinler0",
    github: "https://github.com/artisanxl",
    linkedin: "https://tr.linkedin.com/in/mertcandinler",
    bio: "Laravel ekosisteminde yakından çalışıyor, ara sıra mobil tarafa (Flutter) sapıyor, üç beş paket yayınladım.",
    avatar: "/avatar.svg",
    location: "Türkiye",
    initials: "MD",
  },
  locale: "tr",
  language: "tr-TR",
  themeColor: "#ff5c1f",
  ogImage: "/og-default.svg",
  navLinks: [
    { href: "/", label: "Anasayfa", key: "home" },
    { href: "/blog", label: "Yazılar", key: "blog" },
    { href: "/tags", label: "Etiketler", key: "tags" },
    { href: "/about", label: "Hakkında", key: "about" },
    { href: "/colophon", label: "Kolofon", key: "colophon" },
  ],
  social: [
    { label: "GitHub", href: "https://github.com/artisanxl" },
    { label: "Twitter", href: "https://twitter.com/MertcanDinler0" },
    { label: "LinkedIn", href: "https://tr.linkedin.com/in/mertcandinler" },
  ],
} as const;

export type SiteConfig = typeof SITE;

/** Çıplak host adı — "mert.gg". Başlık ekleri için. */
export const BRAND = new URL(SITE.url).host;

/** Etiket sluglarını insan-okur isimlerine eşle. */
export const TAG_LABELS: Record<string, string> = {
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
};

export const tagLabel = (slug: string) => TAG_LABELS[slug] ?? slug;
