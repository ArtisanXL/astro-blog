---
title: "`composer dump-autoload --optimize` isn't free"
description: "The optimize flag wasn't as innocent as I thought. One deploy later I figured out why."
pubDate: 2026-03-01
tags: ["php", "performans"]
translationKey: "composer-autoload"
---

When I first scaled a Laravel project I was sure I was running `composer install --optimize-autoloader` on every deploy. Then I added `--classmap-authoritative` because the docs said "ideal for production."

A week later a ticket came in: a freshly-added admin page returned 500, not 404. Class not found. The class existed, the namespace was right. The autoloader disagreed.

Here's what `classmap-authoritative` actually says: "don't look beyond this list." During the deploy I'd moved the PHP file but I hadn't regenerated the autoloader cache. The old classmap didn't have that class, and PHP had turned off the "go find the file" path. The class was there but invisible.

There are three variants. What each one does:

- `--optimize-autoloader` (`-o`): collapses PSR-4 lookups into a single classmap. Fast, safe.
- `--classmap-authoritative` (`-a`): optimize plus "no filesystem fallback." Very fast, blind to new files.
- `--apcu-autoloader`: keeps the classmap in APCu. Stacks on top of optimize. Meaningful with PHP-FPM, not with CLI.

Which one in production? For me `-o` always. `-a` only if you're absolutely sure `composer dump-autoload` runs on every single deploy. Because with `-a` you've added a way to be wrong: skip the composer step or shift the cache invalidation by an inch, and the class returns 500 with a log line that doesn't explain why.

Another trap: running `-a` in dev. You add a new file, the IDE shows it, runtime 500s. The error message is misleading. You spend ten minutes convinced you mistyped the namespace.

My production deploy script is now this order:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

No `-a`. Five milliseconds slower, acceptable. Where I want more speed now isn't the autoloader. It's OPcache.
