---
title: "Astro view transitions ate my analytics"
description: "Shipped view transitions, watched pageviews fall by half, blamed ad blockers, was wrong. The fix is two event listeners."
pubDate: 2026-04-10
tags: ["astro", "performans"]
translationKey: "view-transitions-analytics"
---

Shipped Astro's `<ClientRouter />` on a Monday. Tuesday morning the weekly pageview count was tracking at about half what it had been the week before. Same traffic in server logs. Same RSS clicks. Just lower numbers from the analytics provider.

First instinct was the lazy one: ad blockers. Spent an hour reading their share-of-traffic posts. The math didn't work. Ad blocker rates don't double overnight, and the drop was a clean step function aligned exactly with the deploy.

The actual cause was in the head of every page:

```html
<script defer src="https://example.com/script.js" data-site="SITE"></script>
```

A normal script tag. Loads once, runs once, registers a pageview for the page it loaded on. Done.

Before view transitions, every navigation was a full page load and the script ran fresh on every page. After view transitions, the script runs on the first page you land on and then never again, because Astro swaps the body in without tearing down the document. The script is still in memory, the pageview function is still callable... nobody is calling it.

The events are `astro:page-load` and `astro:after-swap`. `page-load` fires on initial load and after every navigation completes. `after-swap` fires earlier, right after the new document replaces the old one but before scripts re-run. For analytics, `page-load` is the one you want.

The fix is to inline the snippet and hook the event:

```html
<script is:inline>
  function trackPageview() {
    if (window.plausible) {
      window.plausible('pageview');
    }
  }
  document.addEventListener('astro:page-load', trackPageview);
</script>
<script defer src="https://example.com/script.js" data-site="SITE"></script>
```

The `is:inline` matters. Astro will otherwise bundle the script, scope it, and tree-shake it in ways that interact badly with view transitions. Inline scripts pass through and survive across swaps.

The `if (window.plausible)` guard is there because on the very first page load the third-party script is still loading when `astro:page-load` fires. The first hit gets dropped, which is fine, because the script's own init registers a pageview anyway. After that, every navigation fires the event and the hit goes through.

Numbers came back the next day. Not all the way, because I'd lost a couple of days of data, but the trend line was right and the deploy-day step was gone.

While I was in there I noticed two other things view transitions break. A third-party chat widget that mounted on `DOMContentLoaded` was disappearing on navigation, because the new body didn't have the iframe it had been injecting and `DOMContentLoaded` doesn't fire again. Same fix shape: bind to `astro:page-load`, re-init. A small script that read `<meta name="theme-color">` to set a CSS variable ran once and then the variable stayed stale on pages that wanted a different color. Same fix.

So: in a view-transitions world, any code that runs "on load" has to decide whether "load" means the first one or every transition. Default is the first one. What you usually want is every transition.

If you're rolling out view transitions and you have any analytics, third-party widgets, or theme globals, walk through every `<script>` tag and ask whether it needs to re-run after a swap. For me the answer was yes most of the time, and the framework will not do it for you.
