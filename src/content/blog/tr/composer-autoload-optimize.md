---
title: "composer dump-autoload --optimize bedavaya gelmiyor"
description: "Optimize flag'i sandığım kadar masum değildi. Bir deploy sonrası anladım."
pubDate: 2026-03-01
tags: ["php", "performans"]
translationKey: "composer-autoload"
---

Bir Laravel projesini ilk büyüttüğümde her deploy'da `composer install --optimize-autoloader` koştuğumdan emindim. Sonra `--classmap-authoritative` ekledim çünkü dokümanda "production için ideal" yazıyordu.

Bir hafta sonra support'tan ticket geldi: yeni eklenen bir admin sayfası 404 değil, 500 dönüyordu. Class not found. Sınıf vardı, namespace doğruydu. Autoloader öyle düşünmüyordu.

Sebep şu: `classmap-authoritative` aslında "bu liste dışında bir şey arama" demek. Deploy sırasında PHP dosyasını taşımıştım ama autoloader cache'ini yeniden üretmemiştim. Eski classmap'te o sınıf yoktu, PHP de "git, dosyayı bul" mantığını kapatmıştı. Sınıf orada ama görünmez.

Üç ayar üzerinde varyasyonu var:

- `--optimize-autoloader` (`-o`): PSR-4'leri tek bir classmap'e indirir. Hızlı, güvenli.
- `--classmap-authoritative` (`-a`): Optimize + "dosya sisteminde arama yok." Çok hızlı ama yeni dosyayı görmez.
- `--apcu-autoloader`: Classmap'i APCu'da tutar. Optimize'ın üzerine ekstra. PHP-FPM ile anlamlı, CLI ile değil.

Production'da hangisi? Bana göre `-o` her zaman. `-a` ise sadece her deploy'da `composer dump-autoload`'un koştuğundan eminsen. Çünkü `-a` ile bir hata yapma noktan var: composer adımını unutursan veya cache invalidation kayarsa, sınıf 500 verir, log'da neden anlaşılmaz.

Bir başka tuzak: dev'de `-a` koşmak. Yeni dosya eklediğinde IDE'de görünür, runtime'da 500. Hata mesajı yanıltıcı. Kendinizi namespace yanlış yazdığınızı sanırken bulursunuz.

Production deploy script'imde şu sıra:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

`-a` yok. Beş milisaniye fark var, kabul edilebilir. Daha fazla hız istediğim yer artık autoloader değil, OPcache.
