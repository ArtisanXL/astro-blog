---
title: "Serverless doesn't mean no server"
description: "An error message that reminded me of the hardware under the abstraction."
pubDate: 2026-05-16
updatedDate: 2026-05-17
tags: ["edge", "mimari"]
translationKey: "serverless-no-server"
---

Late one night, looking at a Worker error:

```
Error: Memory limit exceeded
```

I'd jammed a largeish list into an object, `JSON.stringify`'d it, tried to write to KV. Boom.

That's when the illusion the word "serverless" creates hit me. There wasn't no server. There was a server. A CPU, RAM, a limit. I just didn't know where it lived, how long it stayed alive, when it died. Not absence of server. Invisibility of server.

I knew this on paper the day I wrote my first Worker. Honestly the [Cloudflare docs](https://developers.cloudflare.com/workers/reference/how-workers-works/) say it in the first paragraph: isolate-based runtime, V8, isolated per request. But knowing and internalizing are different things. A memory error reminded me of the server.

I spent years with PHP-FPM. I had a server, the memory limit was in `php.ini`, I could restart it, I could open `htop` and see the processes. None of that exists in a Worker. There's an Error. There's a "don't do that." The server's still there, just with its back turned.

The ironic part: every abstraction works like this. "Cloud" was always someone else's computer. "Managed database" was someone else's Postgres. Every abstraction layer waits for the day you have to face the thing underneath. Usually late at night.

The fix was unimportant. I chunked the list, wrote it in small groups to KV, a cron trigger reads it back and reassembles. Memory limit isn't hit.

But what I thought about before going to sleep wasn't the fix. It was the small lie the word "serverless" tells. There was a server. There still is. It just doesn't show up.

One day someone will sell us "edge" as edgeless. No place, no distance, everywhere everywhere. Then late one night, an error message will remind us the server is actually sitting in some data center somewhere. Anyway.
