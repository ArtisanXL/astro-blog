/**
 * Topic clusters (pillar pages). Each cluster has a slug, a predicate that
 * picks matching posts from the blog collection, and i18n keys that resolve
 * to a per-locale title + intro paragraph in `src/i18n/{tr,en}.ts`.
 *
 * Topics are an SEO authority signal — they let Google see that this blog
 * has depth in 4-5 specific niches rather than a long flat list.
 */

import { type Post } from "~/lib/posts";

export const TOPIC_SLUGS = [
  "laravel-meets-edge",
  "cloudflare-workers",
  "eloquent-performance",
  "astro-on-cloudflare",
  "php-runtime",
] as const;

export type TopicSlug = (typeof TOPIC_SLUGS)[number];

/** A post matches the topic if its `tags` satisfy the predicate. */
export interface TopicDef {
  slug: TopicSlug;
  /** Whether a post belongs to this topic, based on its tag set. */
  match: (tags: string[]) => boolean;
}

const has = (tags: string[], slug: string) => tags.includes(slug);
const hasAny = (tags: string[], slugs: string[]) => slugs.some((s) => tags.includes(s));

export const TOPICS: TopicDef[] = [
  {
    // Laravel doesn't run on V8 isolates — this topic is "a Laravel dev tries
    // edge primitives next door" (D1, Queues, Workers as sidecar). Posts that
    // sit at the meeting point of the Laravel stack and the edge stack.
    slug: "laravel-meets-edge",
    match: (tags) => has(tags, "laravel") && hasAny(tags, ["edge", "cloudflare", "queue"]),
  },
  {
    slug: "cloudflare-workers",
    match: (tags) => has(tags, "cloudflare") && has(tags, "edge"),
  },
  {
    slug: "eloquent-performance",
    match: (tags) => has(tags, "laravel") && has(tags, "veritabani"),
  },
  {
    slug: "astro-on-cloudflare",
    match: (tags) => has(tags, "astro"),
  },
  {
    slug: "php-runtime",
    match: (tags) => has(tags, "php"),
  },
];

/** Filter a post list down to a topic's matching members. Order preserved. */
export function getPostsInTopic(slug: TopicSlug, allPosts: Post[]): Post[] {
  const topic = TOPICS.find((t) => t.slug === slug);
  if (!topic) return [];
  return allPosts.filter((p) => topic.match(p.data.tags));
}

/** Topics that a single post belongs to — used by post page "Part of" rosette. */
export function getTopicsForPost(post: Post): TopicSlug[] {
  return TOPICS.filter((t) => t.match(post.data.tags)).map((t) => t.slug);
}
