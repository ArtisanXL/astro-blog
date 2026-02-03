import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "~/consts";
import { getPublishedPosts } from "~/lib/posts";

export const prerender = true;

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: false,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>${SITE.language}</language><atom:link href="${new URL("/rss.xml", context.site ?? SITE.url)}" rel="self" type="application/rss+xml" />`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
      categories: [...post.data.tags],
      author: SITE.author.email
        ? `${SITE.author.email} (${SITE.author.name})`
        : SITE.author.name,
    })),
  });
}
