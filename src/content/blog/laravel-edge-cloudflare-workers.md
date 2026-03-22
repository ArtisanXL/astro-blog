---
title: "Laravel'i Cloudflare Workers üzerinde çalıştırmak: bir deneyim"
description: "PHP'yi WebAssembly'e derleyip Workers içinde koşturduk. 320 PoP'tan 40ms TTFB. İşte yol haritası, takıldığım yerler ve ne zaman kullanmamak gerektiği."
pubDate: 2026-05-14
tags: ["laravel", "edge", "php", "performans"]
featured: true
---

Geçen ay küçük bir SaaS için Laravel'i Cloudflare Workers'a taşıdım — sadece statik dosyalar değil, yönlendirme, oturum, hatta veritabanı. Yola çıkarken "kötü fikir" diyenler haklıydı, ama yolun çoğu beklediğimden çok daha temiz geçti. Bu yazı, denediklerimin not düşüldüğü hâlidir.

Önce şunu kabul edelim: "edge-native" terimi son iki senede o kadar geniş kullanıldı ki artık "CDN'in arkasında" demekle eş anlamlı hâle geldi. Aslında kastettiğim şey bundan biraz daha fazlası: kodun da, çalışma zamanının da kullanıcının fiziksel olarak yakınında olması.

## Neden bunu denedim

Türkiye'den gelen kullanıcılar için `us-east-1`'in median TTFB'si 240ms civarındaydı. CDN bunu 60–70ms'e düşürüyordu ama dinamik isteklerde değil. Eldeki opsiyonlar:

- Frankfurt'a region eklemek — pahalı, hâlâ bir noktada hairpin var.
- Read replica'ları yaymak — yazma yine merkezde.
- Workers'a taşımak — kodun kendisi yakına geliyor, ama PHP?

> "PHP'yi WebAssembly'e derlersen, bunu çalıştırabilirim" — Cloudflare birinin demediği şey ama tam olarak yaptığı şey.

## Kurulum

FrankenPHP ve PHP-Wasm üzerine yazılmış `workers-php`'i denedim. Build adımları aşağıdaki gibi:

```bash
$ composer require artisanxl/workers-php
$ npx wrangler deploy
# 🚀 Uploaded mertgg-edge (2.41 sec)
# Deployed mertgg-edge triggers (0.34 sec)
#   https://mert.gg
```

### Önce minimal bir router

`routes/web.php` dosyam aşağı yukarı şuna benziyor. Önemli ayrıntı: middleware'ler aynı, ama session driver bağlama (binding) ile gelen `KV` instance'ından geliyor.

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;

Route::get('/', fn () => view('home'));
Route::get('/yazi/{slug}', [PostController::class, 'show'])
    ->name('post.show')
    ->where('slug', '[a-z0-9-]+');

Route::middleware('auth.edge')->group(function () {
    Route::resource('admin/yazi', PostController::class);
});
```

`auth.edge` kendi middleware'im. Session id'yi cookie'den alıp Workers KV'den ilgili payload'ı çekiyor. Database tabanlı session driver'ı eldeki `KvSessionHandler` ile değiştirdim ve hiçbir uygulama kodu değişmedi.

## Karşılaştığım tuzaklar

Şimdi gerçek hayata gelelim. Hiçbir blog yazısı "her şey muhteşemdi" dememeli. Üç şey beni asıl yavaşlattı:

1. **Cron-style scheduled tasks.** Workers'ın `scheduled()` handler'ı saatlik tetikleniyor ama Laravel scheduler'ı dakikalık çalışmaya alışkın. Cron expression mapping yazdım — beklediğimden uzun sürdü.
2. **File uploads.** Workers'ın istek boyut limiti 100MB. Streaming yapmadan büyük dosya yüklemek istiyorsan R2'ye direkt presigned URL ile yazdırman gerekiyor. `Storage::put()` her zaman çalışmıyor.
3. **Queue worker'lar.** Workers context'i kısa ömürlü. Uzun süren job'lar için Queues binding'i şart, ve `php artisan queue:work` burada anlamsız. Job'ları Queues üzerinden tetikleyip ayrı bir Worker'da consume ediyorum.

## Sonuç ve ne zaman kullanmamak gerekir

Bir hafta sonra median TTFB 38ms'e düştü. Tasarruf gerçek, deneyim gerçek. Ama bu mimari hâlâ deneysel.

Şu an üretimde tutuyorum, ama tavsiye ettiğim durum dar: **küçük-orta yüklü, çok bölgeli, çoğunlukla okuma ağırlıklı** uygulamalar. Eğer 200GB veritabanı ve 50 farklı queue'nuz varsa, klasik altyapıya kalın — bunu uzun uzun yazacağım başka bir yazıda.
