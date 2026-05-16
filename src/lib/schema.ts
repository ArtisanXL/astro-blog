/**
 * JSON-LD `schema.org` entity builders. Every helper returns a plain object
 * with a stable `@id` so other entities can reference it inside a single
 * `@graph` (e.g. BlogPosting.author → Person, mainEntityOfPage → WebPage).
 *
 * Everything renders through `BaseHead.astro`, which always emits WebSite +
 * Person and merges any page-specific entities passed via the `jsonLd` prop.
 */

import { SITE } from "~/consts";
import { type Locale, useTranslations } from "~/i18n";
import { type Post, estimateReadingTime, getPostLang, getPostSlug } from "~/lib/posts";

/** Stable `@id` URIs — anchored fragments off SITE.url. Pure URL strings. */
export const entityIds = {
  website: `${SITE.url}#website`,
  person: `${SITE.url}#person`,
  organization: `${SITE.url}#organization`,
  webpage: (canonicalUrl: string) => `${canonicalUrl}#webpage`,
  breadcrumb: (canonicalUrl: string) => `${canonicalUrl}#breadcrumb`,
  blogPosting: (canonicalUrl: string) => `${canonicalUrl}#blogposting`,
  collectionPage: (canonicalUrl: string) => `${canonicalUrl}#collectionpage`,
  itemList: (canonicalUrl: string) => `${canonicalUrl}#itemlist`,
};

const intlLanguage = (locale: Locale): string =>
  useTranslations(locale).intlLocale; // "tr-TR" | "en-US"

const abs = (path: string): string =>
  path.startsWith("http") ? path : new URL(path, SITE.url).toString();

/* ------------------------------------------------------------------ */
/* Global entities — always emitted by BaseHead                       */
/* ------------------------------------------------------------------ */

export function buildPersonEntity(): object {
  return {
    "@type": "Person",
    "@id": entityIds.person,
    name: SITE.author.name,
    url: SITE.url,
    email: `mailto:${SITE.author.email}`,
    image: abs(SITE.author.avatar),
    sameAs: SITE.social.map((s) => s.href),
  };
}

export function buildWebSiteEntity(locale: Locale): object {
  return {
    "@type": "WebSite",
    "@id": entityIds.website,
    url: SITE.url,
    name: SITE.title,
    description: useTranslations(locale).rss.description,
    inLanguage: intlLanguage(locale),
    publisher: { "@id": entityIds.person },
    author: { "@id": entityIds.person },
  };
}

/* ------------------------------------------------------------------ */
/* Page-level entities                                                */
/* ------------------------------------------------------------------ */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbEntity(
  items: BreadcrumbItem[],
  canonicalUrl: string,
): object {
  return {
    "@type": "BreadcrumbList",
    "@id": entityIds.breadcrumb(canonicalUrl),
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}

export interface BlogPostingOpts {
  /** Absolute canonical URL of the post page. */
  canonicalUrl: string;
  /** Absolute OG image URL. */
  imageUrl: string;
  /** Path (no locale prefix) used for hreflang resolution by callers. */
  locale: Locale;
}

export function buildBlogPostingEntity(
  post: Post,
  opts: BlogPostingOpts,
): object {
  const { canonicalUrl, imageUrl, locale } = opts;
  const wordCount = (post.body ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const reading = estimateReadingTime(post.body);

  return {
    "@type": "BlogPosting",
    "@id": entityIds.blogPosting(canonicalUrl),
    mainEntityOfPage: { "@id": entityIds.webpage(canonicalUrl) },
    headline: post.data.title,
    description: post.data.description,
    inLanguage: intlLanguage(locale),
    datePublished: post.data.pubDate.toISOString(),
    dateModified: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
    image: imageUrl,
    keywords: post.data.tags,
    wordCount,
    timeRequired: `PT${reading.minutes}M`,
    url: canonicalUrl,
    author: { "@id": entityIds.person },
    publisher: { "@id": entityIds.person },
    isPartOf: { "@id": entityIds.website },
  };
}

/** Wrapper for a blog post's surrounding WebPage (lets us anchor mainEntityOfPage). */
export function buildWebPageEntity(
  canonicalUrl: string,
  locale: Locale,
  opts: { name: string; description?: string; breadcrumb?: boolean },
): object {
  const includeBreadcrumb = opts.breadcrumb ?? true;
  return {
    "@type": "WebPage",
    "@id": entityIds.webpage(canonicalUrl),
    url: canonicalUrl,
    name: opts.name,
    description: opts.description,
    inLanguage: intlLanguage(locale),
    isPartOf: { "@id": entityIds.website },
    ...(includeBreadcrumb
      ? { breadcrumb: { "@id": entityIds.breadcrumb(canonicalUrl) } }
      : {}),
  };
}

export interface ListItem {
  name: string;
  url: string;
  description?: string;
  datePublished?: string;
}

export function buildItemListEntity(
  items: ListItem[],
  canonicalUrl: string,
): object {
  return {
    "@type": "ItemList",
    "@id": entityIds.itemList(canonicalUrl),
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: abs(item.url),
      name: item.name,
    })),
  };
}

export function buildCollectionPageEntity(
  canonicalUrl: string,
  locale: Locale,
  opts: { name: string; description?: string },
): object {
  return {
    "@type": "CollectionPage",
    "@id": entityIds.collectionPage(canonicalUrl),
    url: canonicalUrl,
    name: opts.name,
    description: opts.description,
    inLanguage: intlLanguage(locale),
    isPartOf: { "@id": entityIds.website },
    breadcrumb: { "@id": entityIds.breadcrumb(canonicalUrl) },
    mainEntity: { "@id": entityIds.itemList(canonicalUrl) },
  };
}

export function buildAboutPageEntity(
  canonicalUrl: string,
  locale: Locale,
  opts: { name: string; description?: string },
): object {
  return {
    "@type": "AboutPage",
    "@id": entityIds.webpage(canonicalUrl),
    url: canonicalUrl,
    name: opts.name,
    description: opts.description,
    inLanguage: intlLanguage(locale),
    isPartOf: { "@id": entityIds.website },
    mainEntity: { "@id": entityIds.person },
  };
}

export function buildProfilePageEntity(
  canonicalUrl: string,
  locale: Locale,
  opts: { name: string; description?: string },
): object {
  return {
    "@type": "ProfilePage",
    "@id": entityIds.webpage(canonicalUrl),
    url: canonicalUrl,
    name: opts.name,
    description: opts.description,
    inLanguage: intlLanguage(locale),
    isPartOf: { "@id": entityIds.website },
    mainEntity: { "@id": entityIds.person },
  };
}

export function buildBlogEntity(
  canonicalUrl: string,
  locale: Locale,
  opts: { name: string; description?: string },
): object {
  return {
    "@type": "Blog",
    "@id": `${canonicalUrl}#blog`,
    url: canonicalUrl,
    name: opts.name,
    description: opts.description,
    inLanguage: intlLanguage(locale),
    publisher: { "@id": entityIds.person },
    author: { "@id": entityIds.person },
    isPartOf: { "@id": entityIds.website },
  };
}

/**
 * Convenience helper used by post pages — builds the full set of entities a
 * single BlogPosting needs (Breadcrumb + WebPage + BlogPosting). Caller passes
 * the result straight to `BaseLayout.jsonLd`.
 */
export function buildPostGraph(
  post: Post,
  opts: {
    canonicalUrl: string;
    imageUrl: string;
    locale: Locale;
    breadcrumb: BreadcrumbItem[];
  },
): object[] {
  return [
    buildBreadcrumbEntity(opts.breadcrumb, opts.canonicalUrl),
    buildWebPageEntity(opts.canonicalUrl, opts.locale, {
      name: post.data.title,
      description: post.data.description,
    }),
    buildBlogPostingEntity(post, {
      canonicalUrl: opts.canonicalUrl,
      imageUrl: opts.imageUrl,
      locale: opts.locale,
    }),
  ];
}

/** Resolve the post's OG image URL — explicit override or auto-generated PNG. */
export function postOgImageUrl(post: Post): string {
  if (post.data.image) return abs(post.data.image);
  // Per-post dynamic OG endpoint shipped by src/pages/[lang]/blog/[...slug]/og.png.ts
  return abs(`/${getPostLang(post)}/blog/${getPostSlug(post)}/og.png`);
}
