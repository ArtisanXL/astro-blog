---
title: "SEO essentials for a modern blog in 2026"
description: "A pragmatic checklist for technical SEO that actually moves the needle — what to ship on day one, what to skip, and what to verify after launch."
pubDate: 2026-05-15
updatedDate: 2026-05-15
tags: ["seo", "performance", "web-vitals"]
featured: false
---

The SEO market is loud and most of the advice is noise. This is the short list I
actually use when I bring a new blog or marketing site online — focused on the bits
that compound over time.

## The non-negotiables

These should be in place before the first post goes live.

### 1. Server-rendered HTML

Crawlers in 2026 execute JavaScript well enough, but they don't always do it on the
first pass, and rendering is the most expensive thing Google does. If your content
isn't in the initial HTML response, your indexing latency goes from hours to days.

For an Astro site, this is the default — every page in this blog is prerendered to
static HTML at build time.

### 2. A canonical URL on every page

One canonical URL per piece of content. If you serve the same article at `/blog/foo`
and `/blog/foo/`, pick one and `<link rel="canonical">` to it. Trailing-slash drift is
the #1 cause of duplicate-content penalties on otherwise well-built sites.

### 3. Real Open Graph + Twitter Card metadata

Not just `og:title` and `og:description` — also:

- `og:type` (`website` for the home page, `article` for posts)
- `og:image` with explicit `og:image:width` and `og:image:height`
- `article:published_time` and `article:modified_time` for posts
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

Share previews are the modern equivalent of a thumbnail in a search result. They
double click-through rates on social.

### 4. Structured data (JSON-LD)

Pick the right schema.org type and emit it as JSON-LD in the `<head>`:

- `WebSite` on every page (enables sitelinks searchbox)
- `Person` or `Organization` (publisher info)
- `BlogPosting` (or `Article`) on individual posts
- `BreadcrumbList` for breadcrumb trails

Validate with the [Rich Results Test](https://search.google.com/test/rich-results).

### 5. A sitemap and a robots.txt

Astro's [sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
generates `/sitemap-index.xml` automatically. Reference it from `/robots.txt` and
submit it once to Google Search Console.

### 6. Core Web Vitals in the green

In 2026 the Vitals are LCP, INP, and CLS. Targets:

- **LCP** < 2.5 s — usually a hero image; preload it and serve it from the edge
- **INP** < 200 ms — keep main-thread work short, avoid heavy hydration
- **CLS** < 0.1 — set `width` and `height` on every image, reserve space for ads/embeds

Astro's zero-JS default gets you most of the way there for free.

## The compounding wins

These don't matter on day one, but they compound over a year.

- **Write evergreen posts.** A how-to from 2024 still drives traffic in 2026 if it stays correct. Update the `updatedDate` frontmatter when you revise.
- **Internal linking.** Every new post should link to two or three older ones. It distributes link equity and helps readers go deeper.
- **A real RSS feed.** Aggregators, newsletter platforms, and AI training pipelines all consume RSS. Don't skip it.
- **Image alt text.** Treat it as captioning for screen readers first, and Google Images second. Both audiences benefit.

## What to skip

A few things that get hyped but rarely move the needle for a personal blog:

- AMP — long dead in practice, don't bother
- Keyword density tools — write for humans, search engines have figured out semantics
- Backlink farms — at best ineffective, at worst penalised
- Excessive "schema stuffing" — only emit schema you genuinely have data for

## A 10-minute audit

After launch, run through this:

1. View source on a post — is your title, description, OG image, and JSON-LD all there?
2. Run [PageSpeed Insights](https://pagespeed.web.dev/) — green on mobile?
3. Submit your sitemap in Search Console — does it parse cleanly?
4. Test a few URLs in the Rich Results Test — any warnings?
5. Share a post URL into Slack or Twitter — does the preview look right?

If all five pass, you're in better shape than 90% of blogs out there. The rest is just
writing things people want to read.
