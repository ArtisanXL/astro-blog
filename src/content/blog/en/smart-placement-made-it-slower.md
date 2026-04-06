---
title: "Smart Placement made my Worker slower"
description: "Flipped Smart Placement on for a JSON API and watched p75 drift up for two days. The Worker wasn't the part of the request that needed moving."
pubDate: 2026-04-06
tags: ["cloudflare", "edge", "performans"]
translationKey: "smart-placement-slower"
---

Flipped Smart Placement on a Wednesday for a small JSON API. Read the docs paragraph, agreed with it, ticked the box, deployed. Came back Friday morning to a latency chart with a slow upward bend. Not a spike, a drift. The kind that makes you doubt the chart before you doubt the change.

The Worker did one thing. Take a request, look up a key in KV, look up a row in D1, return JSON. Boring on purpose. p50 was around 30ms, p75 around 55ms. By Friday p50 was about the same and p75 was closer to 110ms. The mean had moved more than the median, which is its own kind of clue.

The Smart Placement pitch is reasonable. Your Worker probably talks to something slow, an origin in one region or a database in one region, and the round-trip dominates. Cloudflare's scheduler watches your subrequest pattern and, if it sees one, places your Worker near the slow thing instead of near the user. You eat one trip from a far-away user, save many trips to a far-away origin.

That model assumes the slow thing is in one place.

Mine wasn't. KV is already cached at every edge. D1 has a single primary, but I had Sessions API enabled, so my reads were landing on a regional read replica (one of ENAM, WNAM, WEUR, EEUR, APAC, OC — whichever was nearest). The reads were already close enough to the user. The subrequest pattern Smart Placement was looking at, "this Worker talks to KV and D1," got read as "this Worker has expensive subrequests." It moved the Worker toward the D1 primary. The KV reads, which had been local, now carried a small trip in front of them. The D1 reads, maybe a hair faster, maybe not. And every user request now carried a colo-to-colo hop on the front end.

The placement decision panel in the dashboard had told me what was going to happen, politely. It said the Worker was being placed in a specific region, with a confidence score, listing the subrequests that contributed. Honestly, I'd read it as "Cloudflare knows what it's doing" rather than "Cloudflare is showing me what it decided so I can disagree."

Flipped it off Friday afternoon. p75 came back down over the weekend. Not instantly. The scheduler took a few hours to redistribute and the chart's smoothing dragged the visible recovery out a few more.

Where Smart Placement would have been right: a chatty origin in `us-east-1` that the Worker hit three times per request. One user-to-`us-east` trip costs less than three Worker-to-`us-east` trips. Textbook case, real case. I didn't have it.

The thing I changed in my head: subrequests are not equal. Smart Placement counts them and knows which colo answered, but the cost model is necessarily coarse. A KV read that resolves locally is a subrequest. A `fetch` to a single-region origin is a subrequest. Same in the metric, not the same in behavior. Before flipping it on, ask yourself: are my subrequests location-bound, or are they at the edge already?

`wrangler tail` shows the colo each request ran in. I'd never paid attention to that field. Once I started watching, the placement story was obvious.
