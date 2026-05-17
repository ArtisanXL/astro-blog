// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";

import { SITE } from "./src/consts";

/**
 * Build a pathname → ISO-date map from blog frontmatter at config time.
 * The astrojs/sitemap serialize callback can't do async, so we parse
 * frontmatter synchronously with a lightweight regex — no extra deps.
 */
function buildLastmodMap() {
  const map = new Map();
  const base = new URL("./src/content/blog", import.meta.url).pathname;
  for (const lang of ["en", "tr"]) {
    const dir = join(base, lang);
    let files;
    try {
      files = readdirSync(dir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
    } catch {
      continue;
    }
    for (const file of files) {
      const raw = readFileSync(join(dir, file), "utf8");
      const fm = raw.match(/^---[\s\S]*?---/)?.[0] ?? "";
      const updated = fm.match(/^updatedDate:\s*(.+)$/m)?.[1]?.trim();
      const pub = fm.match(/^pubDate:\s*(.+)$/m)?.[1]?.trim();
      const date = updated || pub;
      if (!date) continue;
      const slug = basename(file, file.endsWith(".mdx") ? ".mdx" : ".md");
      const pathname = `/${lang}/blog/${slug}/`;
      try {
        map.set(pathname, new Date(date).toISOString());
      } catch {
        // malformed date — skip
      }
    }
  }
  return map;
}

const lastmodMap = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  output: "static",
  trailingSlash: "always",
  i18n: {
    defaultLocale: "tr",
    locales: ["tr", "en"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  redirects: {
    "/": "/tr/",
  },
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    mdx(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      filter: (page) => !page.includes("/404"),
      i18n: {
        defaultLocale: "tr",
        locales: { tr: "tr-TR", en: "en-US" },
      },
      serialize: (item) => {
        const pathname = new URL(item.url).pathname;
        const lm = lastmodMap.get(pathname);
        if (lm) item.lastmod = lm;
        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      wrap: true,
    },
  },
  experimental: {
    contentIntellisense: true,
  },
});
