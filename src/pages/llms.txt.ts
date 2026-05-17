export const prerender = true;

import { getPublishedPosts, getPostUrl } from "~/lib/posts";
import { SITE } from "~/consts";
import { TOPIC_SLUGS } from "~/lib/topics";
import { useTranslations } from "~/i18n";

export async function GET() {
  const t = useTranslations("en");
  const enPosts = await getPublishedPosts("en");
  const trPosts = await getPublishedPosts("tr");

  const lines: string[] = [];

  lines.push(`# ${SITE.title}`);
  lines.push("");
  lines.push(
    `> Field notes from a Laravel developer working at the Cloudflare edge — what broke, why, how it got fixed. Bilingual: Turkish and English.`,
  );
  lines.push("");

  lines.push("## About");
  lines.push(`- [About Mertcan](${SITE.url}/en/about/): Personal background, how the blog started, and how to get in touch.`);
  lines.push(`- [CV](${SITE.url}/en/cv/): Education, projects, and awards — the short version.`);
  lines.push(`- [Colophon](${SITE.url}/en/colophon/): How this site is built — Astro 6, Cloudflare Workers Static Assets, no adapter.`);
  lines.push("");

  lines.push("## Topics");
  for (const slug of TOPIC_SLUGS) {
    const topic = t.topics[slug];
    lines.push(`- [${topic.title}](${SITE.url}/en/topics/${slug}/): ${topic.descriptionMeta}`);
  }
  lines.push("");

  lines.push("## Posts (English)");
  for (const post of enPosts) {
    const url = new URL(getPostUrl(post), SITE.url).toString();
    lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
  }
  lines.push("");

  lines.push("## Posts (Turkish)");
  for (const post of trPosts) {
    const url = new URL(getPostUrl(post), SITE.url).toString();
    lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
  }
  lines.push("");

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
