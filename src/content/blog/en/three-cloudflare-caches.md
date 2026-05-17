---
title: "Three caches before you see a byte"
description: "I spent an afternoon trying to invalidate the Cloudflare cache and was hitting the wrong layer the entire time. There are at least three of them."
pubDate: 2026-04-02
updatedDate: 2026-05-17
tags: ["cloudflare", "edge", "performans"]
translationKey: "three-edge-caches"
---

Updated a piece of content on a Wednesday afternoon. Deployed. Visited the page. Old content. Hit the purge button in the Cloudflare dashboard. Old. "Purge Everything." Old. Different network, different browser, incognito. Still old.

Three things sat between my origin and my eyeballs. I was purging one of them.

Cloudflare's caching surface is wider than the word "cache" suggests. There's the CDN edge cache, which is what most people mean. There's the Cache API inside a Worker, available as `caches.default`. There's Cache Rules in the dashboard, sitting above the edge cache, deciding what's cacheable and for how long. They sound alike. They cache things in different places, are invalidated through different mechanisms, and have different TTL semantics. If you have a Worker in front of static assets, all three are in play at once.

The CDN edge cache is what `cf-cache-status` is talking about. `HIT` means edge served from cache. `MISS` means it went to origin. `BYPASS` means a rule or a `no-store` header told the edge not to cache. The "Purge Everything" button purges this one. It's the one most blog posts talk about. It's also the one I'd been purging all afternoon.

The Cache API is a separate animal. Inside a Worker:

```ts
const cache = caches.default;
const cached = await cache.match(request);
if (cached) return cached;
const fresh = await fetch(originUrl);
await cache.put(request, fresh.clone());
return fresh;
```

This puts the response into a cache that lives in one data center, keyed on the request URL. It is *not* the CDN edge cache. The "Purge Everything" button does not touch it. There is no dashboard view of what's in it. And `cache.delete(request)` only clears the entry in the colo the Worker happened to run in — other colos are still holding their own copy. The practical way to evict everywhere is to wait out the TTL in each colo, or hook into a global purge channel like Cache Tags. I'd been treating Cache API entries as part of the CDN cache for months. They aren't.

Cache Rules sit above both. They let you override behavior for a URL pattern: longer TTL, bypass, separate edge and browser TTLs. The interaction is the part that catches you. Rules run first, and they can decide a response is cacheable when origin said it wasn't. So if origin sends `no-store` but a rule says "cache this path for an hour," the edge caches for an hour. I had a rule from months earlier that put a one-hour edge TTL on the path I was trying to update. Purge cleared the cache, the next request hit the rule again, re-fetched, re-cached for an hour.

What was actually happening that afternoon: a Worker in front of an origin. The Worker memoized JSON responses in `caches.default` for five minutes. A Cache Rule put one hour of edge TTL on the same path. The CDN edge cached for whichever was longer. When I clicked Purge Everything, the edge cache cleared. The next request walked into the Worker, hit `caches.default` (still warm, the purge hadn't touched it), got the stale response, returned it. The edge then re-cached the stale response for an hour.

A three-layer staircase, each layer refilling from the one below with the wrong content.

The fix wasn't to learn one layer better. It was to know which layer was actually the source of the staleness for a given request and act on that. Diagnosis runs through the response headers first. If the Worker is in path, `cf-cache-status` reads `DYNAMIC` and the Worker may be serving from `caches.default` with no header to tell you. A debug header like `x-cache-layer: worker-hit` on Worker-cached responses is worth a few lines:

```ts
const cached = await cache.match(request);
if (cached) {
  const headers = new Headers(cached.headers);
  headers.set("x-cache-layer", "worker-hit");
  return new Response(cached.body, { ...cached, headers });
}
// ... fetch + cache.put as normal, no x-cache-layer set on the miss path.
```

The layers don't share an invalidation channel. If you want them coherent, you have to invalidate each one yourself, in the right order, from origin outward. Or set TTLs short enough that you don't care, and accept the staleness window.
