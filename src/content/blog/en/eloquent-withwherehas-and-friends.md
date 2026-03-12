---
title: "The Eloquent shortcut I'd been writing the long way for years"
description: "withWhereHas, withAggregate, loadMissing. Three methods that slipped into the framework while I wasn't looking."
pubDate: 2026-03-12
tags: ["laravel", "php", "veritabani"]
translationKey: "eloquent-withwherehas"
---

Reviewing a junior's PR last week I wrote "you can collapse this into one call." When I went to write the example I realized I'd never used the method I was about to recommend. I'd read about it, filed it away, never reached for it. The method was `withWhereHas`.

What I'd been writing for years:

```php
$users = User::query()
    ->whereHas('posts', fn ($q) => $q->where('published', true))
    ->with(['posts' => fn ($q) => $q->where('published', true)])
    ->get();
```

Two closures, same condition, in two places. `whereHas` filters users, `with` eager-loads posts. Both have to carry the same condition or the view shows drafts. `withWhereHas` collapses them:

```php
$users = User::query()
    ->withWhereHas('posts', fn ($q) => $q->where('published', true))
    ->get();
```

Same result. One closure. Landed in Laravel 9. I'm on 11. Missed it for three years.

The reason isn't technical. The 9.x release notes had it as one bullet near the bottom of a long page. The docs page on relations mentions it once, three scrolls past the section you usually visit. Google's first ten results still surface the two-closure pattern because they're older than the method.

After finding it I went looking for what else I'd missed. Two more came up.

`withAggregate` and its family. I knew `withCount`. I hadn't realized the same idea has siblings: `withMin`, `withMax`, `withAvg`, `withSum`. I had production code doing:

```php
$posts = Post::all()->each(function ($post) {
    $post->latest_comment_at = $post->comments()->max('created_at');
});
```

A query per post. Should have been:

```php
$posts = Post::query()->withMax('comments', 'created_at')->get();
```

One query, attribute `comments_max_created_at`. The verbose name was what threw me off the first time I'd skimmed it.

`loadMissing`. The smallest one, the one I use most. You have a model instance and you want to load a relation only if it isn't loaded yet. `$user->loadMissing('profile')` does exactly that. I'd been writing `if (! $user->relationLoaded(...))` blocks for years for the same effect.

All three are additions to old APIs, not new features. Small additions to things you already use. The framework team ships them without much fanfare because they don't want to break anyone, and the people who'd benefit most are the ones least likely to look.

Now I re-read the release notes for the framework I use most every six months, slowly, with one question: did a method I already use get a new sibling.
