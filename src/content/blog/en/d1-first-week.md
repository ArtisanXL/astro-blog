---
title: "A week with D1"
description: "A Laravel dev's first week with Cloudflare D1. Replica behavior, transaction limits, and the habits you drop."
pubDate: 2026-05-03
tags: ["veritabani", "cloudflare", "laravel", "edge"]
translationKey: "d1-first-week"
---

Started the week deciding to use D1 for a small API. One Worker, one KV bucket, one D1, low latency, low cost. I didn't finish the week with the same head I started it with. D1 is SQLite, yeah, but some things I expected from SQLite aren't there, and some things I didn't expect are.

Calling it "just SQLite" doesn't cover it. SQLite is underneath, fine. But "SQLite on edge" is actually three things stacked together: the engine is SQLite, access happens over HTTP to the Cloudflare API instead of local disk, and there's a primary plus *opt-in* read replica model. The third one threw me. By default everything goes to the primary, no surprises. But the moment you switch to the Sessions API (`env.DB.withSession(...)`), reads can land on regional read replicas. In MySQL I picked the connection (`DB::connection('read')`). D1's Sessions API uses bookmarks: "read at least as fresh as this point in time." First time I saw it, I paused: if you don't pass a bookmark and start with `first-unconstrained`, a read right after a write can hit a replica and come back stale.

```js
await db.prepare("INSERT INTO posts (slug, body) VALUES (?, ?)")
  .bind("hello", "world")
  .run();

const row = await db.prepare("SELECT * FROM posts WHERE slug = ?")
  .bind("hello")
  .first();

// row can be null
```

A few fixes. If you're not using the Sessions API you're already reading from primary, no issue. If you are, thread the bookmark the write returns into the next `withSession(bookmark)` call, or keep the write and the read inside one `db.batch([...])`. Habit shift.

On the migration side, there's no `php artisan migrate` comfort. D1 has its own thing: SQL files, ordered names, `wrangler d1 migrations apply`. Half of what you'd do in a Laravel migration isn't available. `dropColumn` was always dangerous in SQLite anyway (table recreate). No `enum`, you use a `CHECK` constraint or validate in the app. No `JSON` column type, write as TEXT and parse yourself.

I spent an hour day one looking for ENUM. Solved it with CHECK. Adding a new status now needs a migration. In Laravel I'd keep it as a string and validate app-side. In D1, validating at the DB layer felt natural because there's no replication to worry about, the write path is single, and the check is cheap.

Transactions exist, but only inside a single request. `db.batch([s1, s2, s3])` runs atomically, all or nothing. There's no "long-lived open transaction." Workers have a per-request CPU budget, you can't hold one open. In Laravel I'd wrap things in `DB::transaction(function () { ... })`. In D1 you have to think of it as a single batch within a single request. That gets awkward exactly where you used to carry transactional state across requests. I had to move to Durable Objects to get that back. The SQLite inside a DO gives you the single-writer guarantee, and "transaction holds state" comes back. But now you're not on D1 anymore, that's a different story.

There's no Eloquent-style query builder. On the Worker side, you either write raw SQL (`db.prepare(...).bind(...)`) or pull in something like the Drizzle adapter. I started raw, then quickly wrote a tiny helper:

```ts
class Posts {
  constructor(private db: D1Database) {}

  findBySlug(slug: string) {
    return this.db
      .prepare("SELECT * FROM posts WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first<Post>();
  }
}
```

Three days in you notice how much Eloquent gives you for free. Pagination, scopes, relations, casting, mutators. All from scratch or by hand.

If I have to pick a side: D1 is not the right tool for 90% of what you do in a Laravel app. CRUD-heavy apps, complex reporting, deeply related data; MySQL or PostgreSQL is still the answer. Tooling is mature, docs are deep, no Eloquent but every language has its equivalent.

Where D1 is right: edge-first apps, read-heavy and write-light workloads (blog metadata, feature flags, light telemetry), the static-site-plus-tiny-API combo, small projects where cost has to stay low.

I didn't see a good reason to move a Laravel monolith to D1. But putting the "marketing site + lead capture" part of a SaaS on D1, keeping the main DB on MySQL? That made sense.

A week isn't enough, sure. I noticed the sharp edges and saw which habits I had to drop. Plan for week two: a tiny ORM that uses `db.batch` natively. We'll see how far that holds...
