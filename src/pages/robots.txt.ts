import type { APIContext } from "astro";
import { SITE } from "~/consts";

export const prerender = true;

export async function GET(context: APIContext) {
  const site = context.site ?? new URL(SITE.url);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /search",
    "",
    `Sitemap: ${new URL("/sitemap-index.xml", site)}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
