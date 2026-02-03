# astro-blog

An edge-native, SEO-first personal blog built on **Astro 6** and deployed to
**Cloudflare Workers** (Static Assets). Every page is prerendered at build
time, served from 320+ Cloudflare data centers — zero JS shipped by default,
zero cold-start, zero origin.

## Why this stack

| Concern              | Choice                              | Why                                                              |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Framework            | Astro 6 + content collections       | Zero-JS by default, typed frontmatter, MDX, fastest SSG          |
| Hosting              | Cloudflare Workers (Static Assets)  | Sub-50 ms TTFB globally, no cold-start, room to grow into SSR    |
| Styling              | Tailwind CSS v4 (PostCSS)           | CSS-first config, dark mode, no runtime                          |
| Search               | Pagefind                            | Build-time WASM index, lazy-loaded, no server dependency         |
| SEO                  | Sitemap + RSS + JSON-LD + OG/TC     | Every signal Google + social platforms expect, baked into BaseHead |
| Type safety          | Astro + Zod schemas + strict TS     | Frontmatter, props, and SEO inputs all type-checked              |

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

## Project layout

```
src/
├── components/      Reusable UI (BaseHead, Header, Footer, PostCard, …)
├── content/blog/    Markdown + MDX posts (typed via content.config.ts)
├── content.config.ts  Zod schemas for collections
├── layouts/         BaseLayout (everything) + PostLayout (article pages)
├── lib/             seo.ts (meta + JSON-LD), posts.ts (queries)
├── pages/           File-based routing — every page has `export const prerender = true`
├── styles/global.css  Tailwind v4 + dark mode + prose
└── consts.ts        Site-wide config (title, author, nav, social) — edit this first
public/              Static files (favicon, OG default, avatar, …)
astro.config.mjs     Astro + Cloudflare adapter + integrations
wrangler.jsonc       Cloudflare Workers deployment config
```

## Daily commands

| Command              | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Astro dev server with HMR (port 4321)                     |
| `npm run build`      | Build the site **and** generate the Pagefind search index |
| `npm run preview`    | Serve `dist/` via Wrangler — same runtime as production   |
| `npm run deploy`     | Build then `wrangler deploy` to Cloudflare                |
| `npm run check`      | Type-check Astro + TS files (0 errors required)           |
| `npm run format`     | Prettier (with Astro + Tailwind plugins)                  |
| `npm run cf-typegen` | Regenerate Cloudflare binding types after wrangler edits  |

## Writing a post

Drop a Markdown or MDX file under `src/content/blog/`. Frontmatter is type-checked
against `src/content.config.ts`:

```md
---
title: "A new post"
description: "Short summary used in cards, RSS, and OG/Twitter previews."
pubDate: 2026-05-20
updatedDate: 2026-05-21    # optional
tags: ["edge", "performance"]
featured: false            # surfaces on the homepage
draft: false               # drafts only render in `npm run dev`
heroImage: "./hero.png"    # optional, relative to the post file
heroImageAlt: "Diagram of…"
canonicalURL: "https://other-site.com/post"  # optional, for cross-posts
---

Your content here.
```

The slug comes from the file name (e.g. `welcome-to-the-blog.md` → `/blog/welcome-to-the-blog`).

## SEO features that ship out of the box

- **Per-page metadata** — title, description, canonical, robots, theme-color
- **Open Graph + Twitter Cards** — including `article:*` fields for posts
- **JSON-LD `@graph`** — `WebSite` (with `SearchAction`), `Person`, `BreadcrumbList`, `BlogPosting` on posts
- **`sitemap-index.xml`** — generated automatically by `@astrojs/sitemap`
- **`/rss.xml`** — full RSS 2.0 with `<atom:link rel="self">`
- **`/robots.txt`** — references the sitemap, disallows `/search`
- **`/manifest.webmanifest`** — installable PWA shell
- **View transitions** — for instant-feeling navigation, with reduced-motion respect
- **Dual-theme syntax highlighting** — Shiki light/dark with the site theme

After deploying, run through the 10-minute audit in
[`/blog/seo-essentials-for-2026`](./src/content/blog/seo-essentials-for-2026.md).

## Deploying to Cloudflare

1. Install Wrangler globally or use the local one: `npx wrangler login`
2. Update `wrangler.jsonc`:
   - Set `name` to your Worker name (becomes `<name>.<account>.workers.dev`)
   - Add a `routes` block or custom domain when you have one
3. Update `src/consts.ts` — at minimum the `url`, `title`, and `author` fields
4. `npm run deploy`

That's it. Builds are reproducible — the same git SHA always produces the same `dist/`.

### Adding bindings (KV, D1, R2, …) or server endpoints

The current setup is **assets-only** — no Worker code, just Cloudflare serving the
prerendered HTML/CSS/JS. To add server logic:

1. `npm install @astrojs/cloudflare`
2. Re-add the adapter to `astro.config.mjs`:
   ```js
   import cloudflare from "@astrojs/cloudflare";
   adapter: cloudflare({ imageService: "compile" }),
   output: "server",
   ```
3. Add `"main": "./node_modules/@astrojs/cloudflare/dist/entrypoints/server.js"` to `wrangler.jsonc`
4. Add your binding to `wrangler.jsonc` and run `npm run cf-typegen`
5. Access via `Astro.locals.runtime.env.MY_BINDING` in any page or endpoint
6. Keep `export const prerender = true` on every page that doesn't need SSR
   so you stay fast-by-default

## Customising

- **Brand colours** — change `--color-brand-*` in `src/styles/global.css` and `SITE.themeColor` in `src/consts.ts`
- **Navigation & social** — edit `SITE.navLinks` and `SITE.social` in `src/consts.ts`
- **Posts per page** — `SITE.postsPerPage` in `src/consts.ts`
- **Default OG image** — replace `public/og-default.svg`
- **Favicon** — replace `public/favicon.svg`

## License

MIT — do what you like with it.
