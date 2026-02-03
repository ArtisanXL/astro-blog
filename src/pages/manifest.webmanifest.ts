import type { APIContext } from "astro";
import { SITE } from "~/consts";

export const prerender = true;

export async function GET(_ctx: APIContext) {
  const manifest = {
    name: SITE.title,
    short_name: SITE.title.split("—")[0].trim(),
    description: SITE.description,
    start_url: "/",
    display: "minimal-ui",
    background_color: "#ffffff",
    theme_color: SITE.themeColor,
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
