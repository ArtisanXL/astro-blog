---
title: "Eloquent'te tembel yükleme, bilerek"
description: "with() her zaman doğru cevap değil. Sayfada 5 satır gösteriyorsan eager loading israf."
pubDate: 2026-03-08
tags: ["laravel", "veritabani", "performans"]
translationKey: "eloquent-lazy-on-purpose"
---

Bir refactor sırasında dashboard sayfasında N+1 buldum. Klasik: bir liste, her satır için bir relation. Önce eager loading ekledim, `with(['user', 'project', 'team', 'permissions'])`. Sayfanın query sayısı 80'den 4'e indi. Mutluluk.

Ama sayfa zamanlaması iyileşmedi. Hatta birazcık kötüleşti.

Sebep şu: o dashboard'da görünen 5 satır vardı, paginate edilmiş. Ben eager loading'i tüm collection'a uyguluyordum çünkü Blade template'inde `@foreach`'in dışında bir condition vardı, görünmüyor sandığım satır gerçekte görünüyordu. 100 satır × 4 relation = 400 ekstra row. Sayfada 5 satır görünüyor. Geri kalan 395 row PHP'nin RAM'inde, hiç kullanılmadan.

Lazy loading'in dezavantajı net: çağrı başına sorgu. Eager loading'in dezavantajı net değil: hafıza ve gereksiz veri transferi. İkincisi sessizdir. Slowlog'da görünmez. Profiler'da query sayısı düşük, sayfa hala yavaş.

Şimdi şöyle düşünüyorum:

- Sayfada N satır gösteriyorsam ve gerçekten N gösteriyorsam: eager loading.
- Conditional render varsa (örneğin admin'in gördüğü, sıradan kullanıcının görmediği satırlar): lazy ya da ihtiyaç anında `loadMissing`.
- Tek bir kayıt sayfasıysa: relation'ı önceden çek, lazy'ye gerek yok.
- Liste API endpoint'iyse: eager + `select`, sadece kullandığın alanları al.

Eloquent'in `loadMissing`'i tam bu durum için var. Eager loading kararını ileri ertelersin ama tekrar tekrar sorguya düşmezsin. Controller veya view tarafında "şu satır admin görüyorsa relation yükle" şeklinde tek bir batch.

"Eager loading her zaman doğru" diye bir kural yok. Asıl kural şu: önce ne göstereceğine karar ver, sonra ne yükleyeceğine. Sıra önemli. Önce yüklersen sonra atarsın. Sonra yüklersen sadece ihtiyaç olana yüklersin.

"N+1 düşmandır" cümlesi yarısı doğru. Diğer yarısı: gereksiz JOIN ve gereksiz hafıza da düşman, sadece daha sessiz.
