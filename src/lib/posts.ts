import { getCollection, type CollectionEntry } from "astro:content";
import { type Locale, isLocale, DEFAULT_LOCALE } from "~/i18n";

export type Post = CollectionEntry<"blog">;

/** Posts are stored as `tr/<slug>.md` or `en/<slug>.md`. */
export function getPostLang(post: Post): Locale {
  const first = post.id.split("/")[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** Slug without the locale prefix. */
export function getPostSlug(post: Post): string {
  return post.id.split("/").slice(1).join("/");
}

export function getPostUrl(post: Post): string {
  return `/${getPostLang(post)}/blog/${getPostSlug(post)}/`;
}

export async function getPublishedPosts(locale?: Locale): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const filtered = locale ? posts.filter((p) => getPostLang(p) === locale) : posts;
  return filtered.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getFeaturedPosts(locale: Locale): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts.filter((p) => p.data.featured);
}

export async function getAllTags(locale: Locale): Promise<Map<string, number>> {
  const posts = await getPublishedPosts(locale);
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

export async function getPostsByTag(tag: string, locale: Locale): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts.filter((p) => p.data.tags.includes(tag));
}

export function estimateReadingTime(body: string | undefined): { minutes: number } {
  const words = (body ?? "").trim().split(/\s+/).length;
  return { minutes: Math.max(1, Math.round(words / 200)) };
}
