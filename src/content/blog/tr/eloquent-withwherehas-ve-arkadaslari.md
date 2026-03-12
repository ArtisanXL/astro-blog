---
title: "Yıllarca uzun yoldan yazdığım Eloquent kısayolu"
description: "withWhereHas, withAggregate, loadMissing. Ben farkına varmadan framework'e sızmış üç metot."
pubDate: 2026-03-12
tags: ["laravel", "php", "veritabani"]
translationKey: "eloquent-withwherehas"
---

Geçen hafta junior bir geliştiricinin PR'ına "bunu tek çağrıya indirgeyebilirsin" yorumu yazdım. Örneği yazmaya geçtiğimde fark ettim ki tavsiye edeceğim metodu kendim hiç kullanmamıştım. Okumuştum, kafamın bir köşesine atmıştım, eline almamıştım. Metodun adı `withWhereHas`.

Yıllardır yazdığım şekil şuydu:

```php
$users = User::query()
    ->whereHas('posts', fn ($q) => $q->where('published', true))
    ->with(['posts' => fn ($q) => $q->where('published', true)])
    ->get();
```

İki closure, aynı koşul, iki yerde. `whereHas` user'ı filtreliyor, `with` post'ları eager-load ediyor. İkisi aynı koşulu taşımak zorunda, yoksa view'da draft post'lar görünür. `withWhereHas` ikisini bir araya getiriyor:

```php
$users = User::query()
    ->withWhereHas('posts', fn ($q) => $q->where('published', true))
    ->get();
```

Aynı sonuç, tek closure. Laravel 9'da gelmiş. Ben 11'deyim. Üç yıl boyunca gözümden kaçmış.

Sebep teknik değil. 9.x release notes'unda uzun bir sayfanın altında tek satır. Docs sayfasında ilişki sorgulama başlığının üç scroll altında geçiyor. Google'da arattığımda hâlâ ilk on sonuç iki-closure pattern'ini öneriyor.

Sonra bakındım, başka neler kaçırmışım. İki tane daha çıktı.

`withAggregate` ailesi. `withCount`'u bilirdim. Aynı mantığın `withMin`, `withMax`, `withAvg`, `withSum` versiyonları varmış. Production'da şöyle bir kod vardı:

```php
$posts = Post::all()->each(function ($post) {
    $post->latest_comment_at = $post->comments()->max('created_at');
});
```

Post başına bir query. Olması gereken:

```php
$posts = Post::query()->withMax('comments', 'created_at')->get();
```

Tek query, attribute adı `comments_max_created_at`. İsim verbose ama tahmin edilebilir.

`loadMissing`. En küçüğü, en çok kullandığım. Bir model elinde, relation'ı yüklü mü değil mi bilmiyorsun. `$user->loadMissing('profile')` yazınca, yüklü değilse yüklüyor, yüklüyse dokunmuyor. Aynı kullanım için `if (! $user->relationLoaded(...))` blokları yazmıştım yıllarca.

Üçü de eski API'lere yapılan eklemeler. Yeni özellik değil. Eski özelliğin kenarlarına sessizce konulmuş kısayollar. Framework ekibi sessizce ekliyor çünkü kimseyi kırmak istemiyor. En çok ihtiyacı olan kişi de gözüne çarpmıyor çünkü uzun yol hâlâ çalışıyor.

Şimdi her altı ayda bir kullandığım framework'ün release notes'unu yavaş okuyorum, tek bir soruyla: bildiğim metoda yeni bir kardeş eklenmiş mi.
