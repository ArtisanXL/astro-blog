import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "~/consts";
import { LOCALES, type Locale, useTranslations } from "~/i18n";
import { getPublishedPosts, getPostUrl } from "~/lib/posts";
import { postOgImageUrl } from "~/lib/schema";

export const prerender = true;

export async function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const locale = context.params.lang as Locale;
  const t = useTranslations(locale);
  const posts = await getPublishedPosts(locale);
  const origin = (context.site ?? new URL(SITE.url)).toString().replace(/\/$/, "");

  return rss({
    title: t.rss.title,
    description: t.rss.description,
    site: context.site ?? SITE.url,
    // Channel-level <image> + <language> for feed readers.
    customData: `<language>${t.intlLocale}</language>
    <image>
      <url>${origin}/icon-512.png</url>
      <title>${t.rss.title}</title>
      <link>${origin}/${locale}/</link>
    </image>
    <atom:link href="${origin}/${locale}/rss.xml" rel="self" type="application/rss+xml" />`,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    items: posts.map((post) => {
      const imageUrl = postOgImageUrl(post);
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: getPostUrl(post),
        categories: post.data.tags,
        // Per-item OG enclosure — RSS readers can preview the post thumbnail.
        enclosure: {
          url: imageUrl,
          type: "image/png",
          length: 0,
        },
      };
    }),
  });
}
