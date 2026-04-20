---
title: "I built a failed_jobs view on D1 in one evening"
description: "The queues post ended with hand-built observability. This is the build. A D1 table, a DLQ consumer, an HTML view, all under 150 lines."
pubDate: 2026-04-20
tags: ["cloudflare", "queue", "veritabani", "edge"]
translationKey: "failed-jobs-on-d1"
---

A post back I wrote about Cloudflare Queues and ended with "I'd hand-built what Cloudflare wasn't giving me." This is that build. One evening, three files.

The thing I'd lost moving from Laravel queues was the `failed_jobs` table. In Laravel that's an automatic dumping ground for any job that exhausts retries: payload, exception, stack trace, failed-at timestamp. You query it like a normal table, retry from it, learn from it. Cloudflare Queues has a dead-letter queue. You can consume from the DLQ, but there's no built-in record of what the failure actually was. You get the message body. You don't get the exception that caused the retries to exhaust.

I wanted three things. A persistent table I could query with SQL. A consumer that pulled DLQ messages into the table without me writing a new one per queue. A minimal HTML view I could load at `/_admin/failed` to see what's failing. Nothing fancy. Horizon-shaped, not Horizon-scaled.

The schema is small. SQLite copies the whole row on every INSERT, and with a replica that row also goes across the wire. So I kept columns to what I actually look at:

```sql
CREATE TABLE failed_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue TEXT NOT NULL,
  message_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  error TEXT,
  attempts INTEGER NOT NULL,
  failed_at INTEGER NOT NULL,
  CHECK (length(payload) < 65536)
);

CREATE INDEX failed_jobs_failed_at ON failed_jobs (failed_at DESC);
CREATE INDEX failed_jobs_queue ON failed_jobs (queue);
```

`failed_at` is unix seconds. D1 has no native timestamp type worth fighting, and an integer is what you want for sorting anyway. The payload length CHECK is there because I'd rather a write fail loudly than fill the table with a 5MB JSON blob someone accidentally shoved into a queue.

The DLQ consumer is one Worker file:

```ts
export default {
  async queue(batch: MessageBatch<unknown>, env: Env) {
    for (const message of batch.messages) {
      try {
        await env.DB.prepare(
          "INSERT INTO failed_jobs (queue, message_id, payload, error, attempts, failed_at) VALUES (?, ?, ?, ?, ?, ?)"
        )
          .bind(
            batch.queue,
            message.id,
            JSON.stringify(message.body).slice(0, 65535),
            (message as any).error ?? null,
            message.attempts,
            Math.floor(Date.now() / 1000)
          )
          .run();
        message.ack();
      } catch (e) {
        console.error("failed to record failed job", e);
        message.retry();
      }
    }
  },
};
```

The actual exception that caused the retries isn't reliably on the DLQ message. I get around the gap by having the original consumers wrap their handlers and stash the last error onto the message body if they're about to retry past the limit. Ugly, but it works.

The HTML view is the part I kept changing. The first version was JSON; I gave up on that after one look. The current version is server-rendered HTML from a Worker route. Cursor-based pagination on `failed_at`, shows the queue, the message_id, the first line of the error, a link to expand the payload. About 80 lines of HTML-in-a-template and one D1 query.

Auth is Cloudflare Access in front of the route. If you're not paying for Access, a shared header with a long random value works fine for the personal-blog tier of seriousness.

What I miss compared to Horizon: retry-from-the-UI. In mine you write a SQL update or run a small CLI script. I haven't built the button yet because so far failures are either "fix the code and the next attempt works" or "the payload was wrong, delete and move on." Neither needs a button.

The pattern, generalized: when the platform doesn't give you the observability shape you want and the volume is small, the cheapest answer is often a table and a Worker. A year of staying out of a SaaS bill in exchange for one evening of writing. Worth doing the math on the next gap you hit. Anyway.
