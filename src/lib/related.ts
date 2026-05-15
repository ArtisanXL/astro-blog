/**
 * Related-post discovery via tag Jaccard similarity.
 *
 * For a given post we score every other post in the same locale by
 *   intersect(tagsA, tagsB).size / union(tagsA, tagsB).size
 * which favours posts that share more of their tag surface (not just any
 * shared tag). Featured posts get a small bump so pillar content surfaces.
 *
 * Used by `src/components/RelatedPosts.astro`.
 */

import { type Post, getPostLang } from "~/lib/posts";

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  if (intersection === 0) return 0;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export interface RelatedPost {
  post: Post;
  score: number;
}

export function findRelated(
  current: Post,
  allPosts: Post[],
  limit = 3,
): RelatedPost[] {
  const lang = getPostLang(current);
  const currentTags = current.data.tags;
  if (currentTags.length === 0) return [];

  const candidates = allPosts.filter(
    (p) => p.id !== current.id && getPostLang(p) === lang,
  );

  return candidates
    .map((post) => {
      const base = jaccard(currentTags, post.data.tags);
      const featuredBoost = post.data.featured ? 0.1 : 0;
      return { post, score: base + featuredBoost };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
