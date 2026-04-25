---
title: "JIT'i açtım, hiçbir şey olmadı"
description: "PHP'nin opcache'i ve JIT'i farklı şeyler ölçüyor. Web request handler'ında JIT'in faydası ölçülebilir bir şey değil."
pubDate: 2026-04-25
tags: ["php", "performans"]
translationKey: "opcache-jit-myth"
---

Bir öğleden sonra `php.ini`'ye `opcache.jit=tracing` yazıp `php-fpm`'i reload ettim. `ab` ile bir API endpoint'i dövdüm. Çıktıya baktım: p50 aynı, p95 biraz kötü. Bir önceki ay birinin tweet'inde "JIT açtık, %40 hızlandı" yazıyordu. Bende fark gürültünün içindeydi.

JIT çalışmıyor değildi. Test ettiğim şey JIT'in derdine giren bir şey değildi.

İnsanlar opcache ile JIT'i karıştırıyor. Aynı extension'da yaşıyorlar ama farklı işler yapıyorlar.

opcache bir `.php` dosyasını ilk request'te parse edip bytecode'a çeviriyor ve shared memory'de tutuyor. İkinci request'te dosya yeniden parse edilmiyor, doğrudan bytecode çalıştırılıyor. Bunu kapalı bırakmak prod sunucuda affedilemez. Bir Laravel uygulamasında 2-3 katlık yavaşlamadan bahsediyoruz. "PHP yavaş" diyen biri opcache'i kapalı tutuyorsa konuşmanın geri kalanı anlamsız.

Tipik ayar:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

`validate_timestamps=0` prod'da önemli. Açık bırakırsan opcache her N saniyede dosyaları stat'lıyor. Deploy'da elle reset etmek daha temiz.

JIT farklı bir katman. Bytecode'u VM'de yorumlamak yerine sıcak kod yollarını makine koduna çeviriyor. Tracing modda hangi yolların sık çalıştığını izleyip onları compile ediyor.

Sorun şu: derleme zaman alıyor ve bir kod yolu "sıcak" sayılması için çok sayıda çalıştırılması gerekiyor. Tipik bir web request şuna benziyor: framework boot, autoload, router, controller, view, response. Hepsi birkaç bin opcode execution. JIT'in compile threshold'una varmadan request bitiyor. Tipik bir CRUD uygulamasında JIT'in faydası ölçülebilir bir şey değil.

JIT'in gerçekten işe yaradığı yerler farklı. Uzun süre çalışan worker'lar (Laravel Octane, Swoole, RoadRunner içinde döngüsel iş). Saf hesap ağırlıklı kod, matematik kütüphaneleri, image manipulation, kriptografi. Microbenchmark'larda Fibonacci. Yani PHP'nin "JIT %40 hızlı" demosunda gösterdiği şey.

Bir API endpoint'inde gerçek sayıları gördüğümde fark ortadaydı. opcache kapalıyken çok yavaş. opcache açıkken bir anda PHP-FPM'in normal seviyesi. JIT'i ekleyince istatistiksel olarak farksız, hatta tracing modda erken request'ler biraz daha kötüleşti çünkü JIT'in compile overhead'i p95'e bulaşıyor.

Pratik tutum yıllar içinde şuna oturdu. opcache her yerde açık, prod'da `validate_timestamps=0`. JIT'i web handler için açıp kapamak istatistiksel olarak fark yaratmıyor. Açık bırakmak zarar vermiyor ama %40 beklemeyle vakit kaybetme. Laravel Octane gibi long-running worker'larda JIT'i aç, burada gerçekten faydası olur. Saf hesap kütüphanesi yazıyorsan zaten JIT senin için, ölçersin görürsün.

`microtime(true)` ile fonksiyon sarmalayıp 1000 kere çağırmak microbenchmark. "Uygulamamız hızlandı" demek için kullanılamaz. `wrk` ya da `ab` ile gerçek concurrency altında p50/p95/p99 ölç. Warmup yap, ilk 100 request'i at. Tek değişken kuralına uy. JIT'i açıp aynı anda PHP versiyonunu da yükseltirsen hangisi katkı yaptı bilemezsin.

PHP 8.x'in son sürümlerindeki performans iyileşmeleri devasa ama bunların çoğu opcache'in iyileşmesinden, string handling'in optimize edilmesinden, internal function'ların hızlanmasından geliyor. JIT iyi bir araç, sadece web request'in problemi değil.
