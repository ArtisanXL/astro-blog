import { SITE } from "~/consts";

export type SeoPageType = "website" | "article" | "profile";

export interface SeoInput {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string | URL;
  type?: SeoPageType;
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  tags?: readonly string[];
  noindex?: boolean;
}

export interface SeoResolved {
  title: string;
  fullTitle: string;
  description: string;
  image: string;
  canonical: string;
  type: SeoPageType;
  publishedTime?: string;
  modifiedTime?: string;
  author: string;
  tags: readonly string[];
  noindex: boolean;
}

/**
 * Normalize a partial SeoInput into a fully-resolved set of strings ready
 * for direct injection into <meta> tags. Always returns absolute URLs so the
 * output works for crawlers regardless of where the page is fetched from.
 */
export function resolveSeo(input: SeoInput, currentUrl: URL): SeoResolved {
  const title = input.title?.trim() || SITE.title;
  const fullTitle = input.title && input.title !== SITE.title ? `${input.title} — ${SITE.title}` : SITE.title;
  const description = (input.description?.trim() || SITE.description).slice(0, 300);
  const image = absoluteUrl(input.image ?? SITE.ogImage, currentUrl);
  const canonical = input.canonical ? new URL(input.canonical, SITE.url).toString() : currentUrl.toString();

  return {
    title,
    fullTitle,
    description,
    image,
    canonical,
    type: input.type ?? "website",
    publishedTime: input.publishedTime?.toISOString(),
    modifiedTime: input.modifiedTime?.toISOString(),
    author: input.author ?? SITE.author.name,
    tags: input.tags ?? [],
    noindex: input.noindex ?? false,
  };
}

export function absoluteUrl(path: string, base?: URL | string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, base ?? SITE.url).toString();
}

/**
 * JSON-LD payload for a blog post — Google's BlogPosting schema.
 */
export function articleJsonLd(seo: SeoResolved) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: seo.title,
    description: seo.description,
    image: [seo.image],
    datePublished: seo.publishedTime,
    dateModified: seo.modifiedTime ?? seo.publishedTime,
    author: {
      "@type": "Person",
      name: seo.author,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.title,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE.author.avatar),
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": seo.canonical },
    keywords: seo.tags.join(", "),
    inLanguage: SITE.language,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.title,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.language,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    author: { "@type": "Person", name: SITE.author.name },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author.name,
    url: SITE.url,
    image: absoluteUrl(SITE.author.avatar),
    description: SITE.author.bio,
    sameAs: SITE.social.filter((s) => s.href.startsWith("http")).map((s) => s.href),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
