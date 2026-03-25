---
title: "The wrangler deploy that didn't deploy"
description: "Exit 0, version ID printed, dashboard showed the new build live. Production was serving the old version. The cause was a route typo from six weeks earlier."
pubDate: 2026-03-25
tags: ["cloudflare", "edge", "devops"]
translationKey: "wrangler-deploy-noop"
---

Shipped a fix late on a Tuesday. `wrangler deploy`, exit 0, new version ID in the output, dashboard showed it live. Refreshed prod. The bug was still there. Cache bypass, still there. Different network, still there.

Forty minutes later I figured out my Worker had been a no-op for six weeks.

First ten minutes were the usual checklist. Browser cache, hard reload, incognito. `curl -H "Cache-Control: no-cache"`. The response had a field with a hardcoded string nobody else would put there, added for exactly this purpose. The string wasn't in the response. The response wasn't coming from my code.

`wrangler deployments list`. New version at the top, marked current, right timestamp. The one below it was the previous "successful deploy" from six weeks ago. Both said deployed, both said active.

Then I looked at routes. The Worker had two: `api.example.com/*` and `example.com/api/*`. The bug lived under `example.com/api/*`. I `curl`'d that path with a header that should be added by my Worker. Header wasn't there. The request was hitting origin directly.

The route pattern in `wrangler.jsonc` was wrong:

```jsonc
"routes": [
  { "pattern": "api.example.com/*", "zone_name": "example.com" },
  { "pattern": "example.com/api/", "zone_name": "example.com" }
]
```

The trailing `*` was missing on the second route. Six weeks ago, when I'd added the api subpath, I'd typo'd the pattern. `example.com/api/` matches exactly that URL and nothing under it. Cloudflare accepted the pattern, deployed the Worker, and silently routed almost no traffic to it.

Six weeks of deploys all "succeeded." The Worker had received maybe a few hundred requests in that window, only the ones hitting `/api/` with nothing after. The rest sailed past it. The metrics dashboard showed steady invocations because the api subdomain was fine. Total request count looked reasonable. Nothing in the chart would have made me look.

Fix was one character: `example.com/api/*`.

Three things I added afterward. First, a post-deploy check in the deploy script. It hits a known route, looks for a header only my Worker sets, fails the deploy if it's missing. Twenty lines of bash and `curl`. The thing I want it to catch is exactly this: a deploy that exits zero and serves the old code.

Second, I started reading `wrangler deployments list` after every prod deploy, not only when something looks wrong. The list tells you a deploy happened. It does not tell you traffic is reaching it.

Third, `wrangler tail` for the minute after a prod deploy, filtered to my own production URL. If I'm not seeing my own traffic in tail, something is in front of me.

The general lesson: a successful deploy command means "the code is on the platform." It does not mean "the code is serving requests." Two assertions, and I'd been treating them as one for years. Anyway.
