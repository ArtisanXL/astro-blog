import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "{tr,en}/**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    /** Optional — when set, surfaces as `dateModified` on BlogPosting JSON-LD. */
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    /** Stable key shared between language variants of the same post. */
    translationKey: z.string().optional(),
    /** Per-post OG image override. Defaults to the auto-generated /og.png endpoint. */
    image: z.string().optional(),
    /** External canonical URL when this post is a cross-post or syndicated copy. */
    canonical: z.string().url().optional(),
    /** Mark the post as hidden from search engines (still rendered). */
    noindex: z.boolean().optional(),
  }),
});

export const collections = { blog };
