---
title: "When Workers KV beats Redis (and when it doesn't)"
description: "I tried swapping our feature-flag store from Redis to Workers KV. Half the move was clean. The other half I rolled back the next morning."
pubDate: 2026-05-17
tags: ["cloudflare", "edge", "laravel", "veritabani"]
translationKey: "kv-vs-redis"
featured: true
---

Monday afternoon I decided to try moving our feature-flag store off Redis and onto Workers KV. Same shape: read-heavy, write-rarely, key-value. Half the move was clean. The other half I rolled back the next morning.

The clean half was the obvious one. Feature flags, A/B test copy, geo-routing overrides — stuff you write once and read many times. In Laravel I'd been doing `Cache::remember('flags:v3', 60, fn() => DB::table('flags')->get())` off a Redis cache. In KV it's `env.FLAGS.get('v3', 'json')` — globally distributed, no connection pool, no Redis box to keep warm. [Read latency is under 10ms p99 from any Cloudflare colo](https://developers.cloudflare.com/kv/concepts/how-kv-works/). For that pattern, KV is straightforwardly cheaper and faster.

The API surface is small on purpose. Put a value in, get it back, optionally expire it.

```js
await env.FLAGS.put("v3", JSON.stringify(flags), { expirationTtl: 86400 });

const flags = await env.FLAGS.get("v3", "json");
```

`expirationTtl` is seconds. The second argument to `get` is the type — `"json"` gives you the parsed value back. That's the happy path in full.

Where I hit a wall was trying to carry over Redis patterns that KV structurally can't support.

Rate limiting. I'd been doing `INCR key` + `EXPIRE key 60` in Redis for per-IP rate limits. In KV there's no atomic increment. A get-then-put is a read-modify-write with a race — two requests hitting different colos at the same time both read the same count, both write `count + 1`. You undercount. The right tool is [Durable Objects](https://developers.cloudflare.com/durable-objects/) with a single-writer counter, or Cloudflare's [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

Sessions. KV is [eventually consistent](https://developers.cloudflare.com/kv/concepts/how-kv-works/). Cloudflare's docs are clear about it: propagation to all edges can take up to 60 seconds. For cache data that's fine. For session state — write after login, read on redirect — it's a real problem. A user logs in on one colo, hits a different edge on the next request, and the session key isn't there yet.

Pub/sub, lists, sorted sets. Gone. KV is a key-value store. No channels, no LPUSH, no ZADD. If you're reaching for those, you need a different primitive.

The mapping for someone coming from a Laravel + Redis setup:

- Long-TTL cache reads → KV. Works well.
- Session storage → technically possible, practically painful due to eventual consistency.
- Atomic counters, rate limits → Durable Objects or Rate Limiting binding. Not KV.
- Queue jobs → Cloudflare Queues or DO alarms. Not KV.

What caught me on Tuesday was writing a flag update and immediately reading it back from the same Worker, but the _next_ request landed on a different colo 40ms later and got the old value. I'd assumed "globally distributed" meant "immediately consistent." It doesn't. KV makes the first promise, not the second. Read fast everywhere, write slow to everywhere — that's the contract.

I kept about half the move. Feature flags, static copy, and geo-routing overrides all live on KV now. Rate limiting stayed on Durable Objects. Sessions I left on the external store I'd had before.

KV is a read-heavy edge-pinned key-value store, not a Redis replacement. Use it as the first thing and it's excellent. Go looking for the second and the friction starts quickly.

Anyway. The feature flags are faster now. The rest I didn't touch, and I'm not sorry.
