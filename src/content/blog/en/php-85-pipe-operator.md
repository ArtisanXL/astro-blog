---
title: "PHP 8.5's pipe operator: I'm done reading right-to-left"
description: "Function chains I'd been reading inside-out for years now read top-down with PHP 8.5's pipe operator. Small change, big daily comfort."
pubDate: 2026-05-17
tags: ["php"]
translationKey: "php-85-pipe"
---

A few days into PHP 8.5 and the thing I keep reaching for is the pipe operator (`|>`). It changes muscle memory within an hour or two. Take a simple example:

```php
$slug = str_replace(' ', '-', strtolower(trim($title)));
```

You have to read that right-to-left. First `trim`, then `strtolower`, then `str_replace`. For years, every time I saw a line like this I'd mutter "ok, inside-out" and trace it. Worse, because the writing direction is the opposite of the data direction, I'd count parentheses to follow it. With 8.5 the same thing reads:

```php
$slug = $title
    |> trim(...)
    |> strtolower(...)
    |> str_replace(' ', '-', ...);
```

Top-down. `$title` first, then `trim`, then `strtolower`, then `str_replace`. Data direction and writing direction finally agree.

The piece that makes this work is the first-class callable syntax. `strtolower(...)` is a reference to the function, not a call. The pipe operator passes the left-hand value as the first argument to that callable. So `$x |> f(...)` is `f($x)`. If `f` takes more than one argument, you spell out where the piped value goes with `...` as a placeholder. In the `str_replace(' ', '-', ...)` line above, the piped value is the third argument.

Two places it's a clean win:
- Data normalization chains (trim → lowercase → slug → hash).
- Functional transforms (`array_map`, `array_filter`, custom transformers).

One place it loses: when the argument order doesn't cooperate. Some PHP functions take "haystack, needle," others go the other way. The piped value always lands in the first slot. If the order is wrong, you fall back to a lambda:

```php
$found = $haystack |> fn($h) => str_contains($h, 'needle');
```

At which point the old call form (`str_contains($haystack, 'needle')`) is already shorter.

Other 8.5 things worth mentioning: `array_first()` and `array_last()`, the non-pointer-mutating versions of `reset()` and `end()` everyone's been writing helpers for. And a proper URI parser that handles the RFC edges `parse_url` had been failing on for years.

Pipe isn't a paradigm shift. But it saves two seconds reading every function chain I write, and I write fifty of those a day across 250 days a year. You feel the difference.
