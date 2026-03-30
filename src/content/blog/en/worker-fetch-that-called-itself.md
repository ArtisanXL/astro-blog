---
title: "The Worker fetch that called itself"
description: "A subrequest loop, a Cloudflare error code I'd never seen, and the routing model that made it inevitable."
pubDate: 2026-03-29
tags: ["cloudflare", "edge", "mimari"]
translationKey: "worker-self-fetch-loop"
---

Wrote a Worker that talked to its own origin. Tested it locally in `wrangler dev`. Deployed. First real request came back with:

```
Error 1042 Ray ID: XXXXXXXXXXXX
Internal request count exceeded
```

Never seen 1042 before. The number sounded like one of the polite "the customer did something wrong" codes Cloudflare uses to mean "your Worker recursed into itself and we stopped it."

The architecture looked blameless on paper. A Worker on `example.com/api/*` handles auth, then forwards the decorated request to my origin at `origin.example.com/api/*`. The Worker reads `env.ORIGIN_URL` and does:

```ts
const upstream = new URL(env.ORIGIN_URL + url.pathname + url.search);
const res = await fetch(upstream, {
  method: request.method,
  headers: request.headers,
  body: request.body,
});
```

`env.ORIGIN_URL` was `https://origin.example.com`. `origin.example.com` was a CNAME on Cloudflare. So far so good.

Except `origin.example.com` was also matched by my Worker's route pattern via a wildcard I hadn't thought hard about. So my Worker's fetch to `origin.example.com` went through Cloudflare's edge, hit my Worker's route, ran my Worker, which fetched `origin.example.com`, ran the Worker again. The edge let it go for a while, then 1042'd when the subrequest counter went over.

`wrangler dev` hadn't caught it. In local dev, a fetch to an external hostname goes through the local Node fetch stack and not through my Worker. The loop only existed on the real edge, where the Worker actually owned the route.

First fix attempt: set a `Host` header on the upstream request. Didn't help. Cloudflare routes on the URL hostname for Worker route matching, not on the `Host` header. The routing decision was already made when the request entered the edge.

Second attempt: a query param the Worker would recognize and pass through. Works, but ugly. Anyone hitting that URL with `?_passthrough=1` bypasses your Worker's auth. Add a shared secret and you've got a shared secret nobody documented that becomes a security finding in two years.

The real fix is a service binding. In `wrangler.jsonc`:

```jsonc
"services": [
  { "binding": "ORIGIN", "service": "origin-worker" }
]
```

And in code:

```ts
const res = await env.ORIGIN.fetch(request);
```

Service bindings route Worker-to-Worker without going through the public edge. No URL resolution, no route matching, no possibility of loop. The downside is that the thing on the other end has to also be a Worker.

If your origin is a non-Cloudflare server on a domain you control, the answer is to give it a hostname that isn't matched by your Worker's route. A subdomain like `internal-origin.example.com` with no matching Worker route does the job. Traffic still goes through the edge for DDoS protection and TLS, just without hitting a Worker on the way through.

The general shape. Workers route on hostname pattern matching. If your Worker fetches a hostname that matches its own route, you have a loop. There is no `?bypass=1` the platform recognizes. The bypass is structural: pick a hostname that doesn't match.

What I do on new Workers now is write a comment at the top listing the route patterns and the hostnames I'll fetch. Three lines, takes a minute, prevents one bad afternoon.
