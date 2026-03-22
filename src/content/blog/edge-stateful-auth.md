---
title: "Edge'de stateful auth: cookie + KV ile origin'siz oturum"
description: "Sessiz, hızlı, herhangi bir bölgeden 30ms. Sign-in akışını edge'e taşıdığım için yaşadıklarım — ve bunun ne zaman fena fikir olduğu."
pubDate: 2026-04-06
tags: ["edge", "laravel", "mimari"]
---

Klasik PHP session driver veritabanına yazıyor. Sorun: veritabanı tek bölgede, kullanıcı dünyanın öbür ucunda. Cloudflare KV ile bunu adresledim.

## Kurulum

```php
// config/session.php
'driver' => 'cloudflare-kv',

// AppServiceProvider::register()
$this->app->extend('session', function ($manager) {
    $manager->extend('cloudflare-kv', function ($app) {
        return new KvSessionHandler($app['cloudflare.kv']);
    });
    return $manager;
});
```

`KvSessionHandler` zaten `SessionHandlerInterface`'i implement ediyor. Eski kod hiç değişmiyor.

## Performans

| Driver | p50 read | p99 read |
| --- | ---: | ---: |
| `database` | 42ms | 180ms |
| `redis` (local) | 6ms | 18ms |
| `cloudflare-kv` | 9ms | 22ms |

KV'nin sıkıntısı eventual consistency. Yeni yazdığın session'ı 60 saniye boyunca eski okuyabilir. Sign-in flow'unu *aynı sayfa redirect'i* ile çözdüm; o redirect süresi yetiyor.

## Ne zaman kullanma

Eğer session'da kritik bir state varsa (ödeme adımı vb.), KV'ye güvenme. Durable Objects daha iyi.
