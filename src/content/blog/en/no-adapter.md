---
title: "I shipped Astro to Cloudflare without an adapter"
description: "This blog runs on Cloudflare as plain Static Assets. No adapter, no Worker code. Here's why."
pubDate: 2026-04-21
updatedDate: 2026-05-17
tags: ["edge", "mimari", "astro", "cloudflare"]
translationKey: "no-adapter"
---

Someone asked how I deployed this blog and got stuck on "wait, no adapter?" Yeah. No `main` in `wrangler.jsonc`. No adapter line in `astro.config.mjs`. The build output goes straight to the CDN as plain HTML. It works.

Most tutorials start with the SSR adapter because most apps actually want SSR. A blog doesn't. Every page compiles at build time. Since 2026-02-18 — this blog itself — and nothing's blown up.

The config is short:

```jsonc
{
  "name": "mert-gg",
  "compatibility_date": "2026-04-01",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "404-page"
  }
}
```

No `main` means no Worker. On the Astro side, every `.astro` page has `export const prerender = true` at the top, and `output: 'static'` is set explicitly. It's the default but I want it visible. After build, `dist/` contains the HTML, CSS, fonts, and the tiny view transitions runtime. Cloudflare uploads it and serves it from the CDN.

If I added `@astrojs/cloudflare`, I'd get dynamic pages, API endpoints, binding access through `Astro.locals.runtime.env`, middleware. For a SaaS, that's non-negotiable. For this blog, I don't want any of it right now.

Not on principle. Just don't need it. Comments, view counters, newsletter forms could show up someday. When they do, putting the adapter back is three or four lines. Adding it today buys complexity for no benefit. YAGNI is real.

Two quiet wins. If traffic spikes, Static Assets has effectively no cap, while the Worker tier has a daily request ceiling on the free plan. And the tooling stays simple: `astro build`, `wrangler deploy`, done. With a Worker I'd be wiring up preview deployment bindings, managing secrets across environments, keeping dev/preview/prod in parity. Real problems, just not mine today.

The path back is one diff. Comments arrive, `main` goes into `wrangler.jsonc`, and `astro.config.mjs` becomes:

```js
import cloudflare from '@astrojs/cloudflare';

adapter: cloudflare({ mode: 'directory' }),
output: 'hybrid',
```

`output: 'hybrid'` is the part that matters. Prerender by default, dynamic on demand. My existing `prerender = true` lines stay where they are.

Knowing the path back is open, I don't lose anything by not adding the adapter on day one. It's reversible. The kind of decision you can undo without an apology.

Honestly, not sure what I'll say next time someone tells me Astro on Cloudflare requires the adapter. Probably nothing.
