---
title: "Lazy loading, on purpose"
description: "with() isn't always the right answer. If the page shows five rows, eager loading the whole list is waste."
pubDate: 2026-03-08
tags: ["laravel", "veritabani", "performans"]
translationKey: "eloquent-lazy-on-purpose"
---

Refactoring a dashboard, I found an N+1. Classic: a list, one relation per row. I added eager loading, `with(['user', 'project', 'team', 'permissions'])`. Query count dropped from 80 to 4. Happy.

Page timing didn't improve. Slightly worse, actually.

Reason: the dashboard showed 5 paginated rows. I was applying eager loading to the whole collection because a condition in the Blade template made the loop pretend it iterated the full list. 100 rows × 4 relations = 400 extra row reads, of which 5 made it to the page. The other 395 sat in PHP's memory, unused.

Lazy loading's downside is obvious: one query per call. Eager loading's downside isn't: memory and pointless data transfer. The second one is silent. It doesn't show up in slowlogs. The profiler reports a low query count and a slow page.

Now I think about it this way:

- Page renders N rows and really N rows: eager loading.
- Conditional render (admins see this relation, regular users don't): lazy or `loadMissing` at the point of need.
- Single-record page: prefetch the relation, no lazy needed.
- List API endpoint: eager plus `select`, pull only the columns you'll serialize.

Eloquent's `loadMissing` exists for exactly this. You defer the eager-loading decision without falling back into per-call queries. Controller or view side: "if this row is for an admin, batch-load the relation."

"Eager loading is always right" isn't a rule. The actual rule: decide what you're going to show, then decide what to load. Order matters. Load first, throw away later. Load after, load only what's needed.

"N+1 is the enemy" is half right. The other half: pointless JOINs and pointless memory are also enemies, just quieter.
