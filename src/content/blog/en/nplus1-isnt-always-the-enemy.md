---
title: "N+1 isn't always your enemy"
description: "Where 'just eager load' stops working. Sometimes a few dozen cache-warm queries beat one big JOIN."
pubDate: 2026-04-29
tags: ["laravel", "performans", "veritabani"]
translationKey: "nplus1-not-always-enemy"
---

An admin screen was slow. I opened Debugbar, saw fortysomething queries, and reached for the cliché: N+1, missing eager load. Added `->with('orders.items.product')`. Query count dropped to four. The screen got slower.

That's why I'm writing this. Saying "we have an N+1" doesn't point to a problem; it points to the *possibility* of one. The interesting question is when eager loading is right and when N+1 is actually the right answer.

The textbook version is clean. `User::all()` then `$user->profile->avatar` in a loop fires a profile query per user. `with('profile')` collapses it to two queries. Right most of the time, because round-trip cost dominates database work.

The interesting case is when that balance flips. If the database is doing real work per query, reducing the count means making the per-query payload bigger, and that can cost more than it saves.

What happened on my admin screen: 100 orders, each with several items, each item with a product. Full eager load produced this as the last query:

```sql
SELECT * FROM products WHERE id IN (1, 4, 7, ... 800 different IDs);
```

The products table was wide. Legacy columns, TEXT fields. Hydrating 800 rows on the PHP side roughly doubled memory and pushed response time up about 1.4×. The per-product version was hitting warm pages in InnoDB's buffer pool for almost every PK lookup, because the products table is read constantly and barely changes. The eager-load version was pulling 800 rows in one shot, dragging colder parts of the table into the buffer pool each time.

I rolled back, eager loaded items but left product alone. `$item->product->name` fires a PK lookup per product in the view, but every product page is already warm in the buffer pool.

Three numbers. Pure N+1 around a second. Full eager load about 1.5s, the worst. Hybrid landed around 400ms.

In most examples tables are narrow, datasets are 10-100 rows, and eager load really is almost always good. Tutorials and "Laravel performance" posts inherit that assumption because it's right most of the time. Production is different: tables can be wide, datasets can be large, the DB caches, hydration isn't free.

I don't have a clean rule, just a sense. Eager load when the dataset is up to a few hundred rows, tables are narrow, the DB is far away (RDS-style network), or related data changes per request. Leave the N+1 (or partial eager) when the dataset is thousands of rows, the related table is wide or rarely changes (cache hits), the DB is close (unix socket, same host), or hydration is expensive.

If you can't decide, measure. Query count is half the truth. One query can scan for 800ms; 16 queries can total 60ms. What I watch: `EXPLAIN` on every big query, Debugbar's per-query duration (not the count), `memory_get_peak_usage(true)` before and after the request, `wrk` for p95 under real concurrency.

"Eager load is always right" is wrong. "N+1 is always wrong" is also wrong. Two ends of the same trade-off, round-trip versus work. Learning Eloquent is partly learning which verb to reach for. `with`, `withCount`, `loadMissing`, `lazy`, `chunk`, `cursor`. They all have a spot.

Next time you hit the "forty queries" alarm, watch the duration, not the count.
