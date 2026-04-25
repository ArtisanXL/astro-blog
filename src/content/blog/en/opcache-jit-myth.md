---
title: "I turned on JIT and nothing happened"
description: "PHP's opcache and JIT measure different things. For a web request handler, JIT's benefit is below the noise floor."
pubDate: 2026-04-25
tags: ["php", "performans"]
translationKey: "opcache-jit-myth"
---

Dropped `opcache.jit=tracing` into `php.ini` one afternoon, reloaded `php-fpm`, ran `ab` against an API endpoint. Looked at the numbers: p50 unchanged, p95 marginally worse. The month before, somebody's tweet said "we turned on JIT, got 40% faster." I didn't get 40%. I got noise.

JIT wasn't broken. The thing I was testing just wasn't what JIT cares about.

People conflate opcache and JIT. They live in the same extension. They do different jobs.

opcache parses a `.php` file on first request, turns it into bytecode, parks it in shared memory. The next request skips parsing and runs bytecode directly. Running prod with opcache off is unforgivable. We're talking 2-3× slower on a Laravel app. If someone says "PHP is slow" while having opcache off, the rest of the conversation is moot.

Sensible config:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

`validate_timestamps=0` matters in prod. With it on, opcache stat()s files every N seconds. Cleaner to reset opcache on deploy by hand.

JIT is a different layer. Instead of interpreting bytecode in the VM, JIT compiles hot code paths to machine code. In tracing mode it watches which paths run a lot and compiles those.

Here's the catch: compiling takes time, and a path has to run a *lot* before JIT considers it hot. A typical web request: boot the framework, autoload, route, controller, view, response. The whole thing is a few thousand opcode executions. The request finishes before any code crosses JIT's compile threshold. On a typical CRUD app, JIT's benefit isn't measurable.

JIT genuinely helps elsewhere. Long-running workers (Laravel Octane, Swoole, RoadRunner doing loop work). Compute-heavy code, math libraries, image manipulation, crypto. Microbenchmarks running Fibonacci. The exact thing PHP shows in the "JIT is 40% faster" demos.

What I saw on a real API endpoint: with opcache off, slow. With opcache on, regular PHP-FPM territory. Adding JIT was statistically a wash, even slightly worse on p95 in tracing mode because JIT's compile overhead bleeds into early requests.

My working stance over the years settled into this. Opcache on everywhere, `validate_timestamps=0` in prod. JIT on or off for a web handler is statistically neutral. Turn it on if you want, but don't sit waiting for the 40%. On long-running workers like Octane, turn JIT on, it genuinely helps. Writing a pure compute library is the one place JIT is for you, and you'll see it the first time you measure.

Wrapping a function in `microtime(true)` and calling it 1000 times is a microbenchmark. You can't use it to claim the app got faster. Hit the real endpoint with `wrk` or `ab` at real concurrency, look at p50/p95/p99. Warm up, throw out the first 100 requests. Change one variable at a time. If you flip JIT and bump PHP at the same time, you can't tell which did what.

Performance improvements in recent PHP 8.x are substantial, but most come from opcache getting better, string handling getting tighter, internal functions speeding up. JIT is a fine tool. It just isn't the tool for a web request.
