import type { APIContext } from "astro";
import { LOCALES, type Locale } from "~/i18n";
import { getPublishedPosts, getPostSlug, type Post } from "~/lib/posts";
import { renderOgPng } from "~/lib/og-image";

export const prerender = true;

/**
 * One OG endpoint per published post — `getStaticPaths` enumerates every
 * locale × slug combo so Astro materialises a `.png` next to each post in
 * `dist/[lang]/blog/<slug>/og.png`. Schema's `postOgImageUrl()` points here.
 */
export async function getStaticPaths() {
  const out: Array<{ params: { lang: Locale; slug: string }; props: { post: Post } }> =
    [];
  for (const lang of LOCALES) {
    const posts = await getPublishedPosts(lang);
    for (const post of posts) {
      out.push({
        params: { lang, slug: getPostSlug(post) },
        props: { post },
      });
    }
  }
  return out;
}

export async function GET({ props }: APIContext) {
  const { post } = props as { post: Post };
  const png = await renderOgPng({
    title: post.data.title,
    tags: post.data.tags,
    locale: post.id.split("/")[0] as Locale,
  });
  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
