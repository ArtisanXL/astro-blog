---
title: "Eloquent collection vs LazyCollection, when memory matters"
description: "The day I pulled 100k rows into memory and accepted it. Switching to cursor told me what I'd lost."
pubDate: 2026-02-22
tags: ["laravel", "performans", "veritabani"]
translationKey: "lazy-collection-memory"
---

Wrote a script to run overnight. It walked every user, backfilled a field, finished. On staging it took three seconds. In production it died with OOM three minutes in.

The code was simple:

```php
User::all()->each(function ($u) {
    $u->something = derive($u);
    $u->save();
});
```

`User::all()` pulled every row, hydrated each into an Eloquent model, stuffed them all into a Collection. 100k rows, ~10KB per model, 1 GB of RAM. The box had 512 MB. OOM was inevitable.

First instinct was chunking:

```php
User::chunk(1000, function ($users) {
    foreach ($users as $u) { ... }
});
```

It worked. But `chunk` has a trap: if you change the order of rows inside a chunk (deletes, updates that affect the sort), the next chunk's offset shifts and rows get skipped. `chunkById` fixes that but assumes the natural sort is by ID. Fine for a backfill, worth remembering for fancier work.

The satisfying answer is `lazy` / `cursor`:

```php
User::lazy()->each(function ($u) {
    $u->something = derive($u);
    $u->save();
});
```

`lazy()` returns a LazyCollection that chunks internally and behaves like a single iterator. `cursor()` is lower-level and pulls one row at a time from the DB cursor. Both keep memory flat. The same script now hovers around 30 MB no matter the row count.

The trade-off is clean. LazyCollection supports most eager Collection methods, but operations that need the full dataset, `groupBy`, `sortBy`, `chunk`, still buffer internally. `sortBy` works on a LazyCollection but pulls every row into memory. Once you sort, you've already given up the `cursor` advantage.

The rule I landed on:
- Under 1000 rows expected: `get()`, Collection, fine.
- Mid-size with order or buffering: `chunkById`.
- Stream, compute, write: `lazy()` or `cursor()`.
- Stream and then group: wrong tool. Do it in SQL with `GROUP BY`.

In PHP-FPM this mistake hurt less because each request lived inside its own budget. A cron job had its own and an OOM hit once and moved on. In Workers, each isolate's budget is tighter. The same `User::all()` blows up much sooner against a 128 MB limit. `lazy()` is the right answer in both worlds. In Workers it isn't just nice, it's required.

When I write `User::all()` now I ask myself "how many rows." If the answer is "I don't know," it's the wrong method.
