import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "~/consts";
import { LOCALES, type Locale, useTranslations } from "~/i18n";
import { getPublishedPosts, getPostUrl } from "~/lib/posts";

export const prerender = true;

export async function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const locale = context.params.lang as Locale;
  const t = useTranslations(locale);
  const posts = await getPublishedPosts(locale);

  return rss({
    title: t.rss.title,
    description: t.rss.description,
    site: context.site ?? SITE.url,
    customData: `<language>${t.intlLocale}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: getPostUrl(post),
      categories: post.data.tags,
    })),
  });
}
