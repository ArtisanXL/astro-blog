---
title: "Eloquent'i hızlandıran 12 ufak şey"
description: "Çoğu zaten dökümanda var ama hiç birlikte görmemiştim. lazy/eager dengesi, withOnly, chunkById, raw expression'ların gerçekten daha hızlı olduğu yerler."
pubDate: 2026-03-12
tags: ["laravel", "veritabani", "performans"]
---

Eloquent yavaş değil — yanlış kullanılınca yavaş. İşte üretimde ölçtüğüm, gerçekten fark yaratan 12 şey:

1. **Eager loading.** `with('items')` — yokluğu = n+1 ölümü.
2. **`withOnly()`.** Sadece istediğin sütunları yükle.
3. **`select()` sınırla.** `*` yerine 3 kolon istiyorsan onları seç.
4. **`chunkById()`.** Bellek için. Büyük datasette `each()` öldürür.
5. **`cursor()`.** Generator döndürür, lazy.
6. **`lazy()`.** Memory-friendly chunked iterator.
7. **`updateOrCreate` yerine `upsert()`.** Toplu işlemde 10× hızlı.
8. **Indeksli `whereIn`.** Çok büyükse `chunk + union`.
9. **Raw expression — bazı yerlerde.** `DB::raw('COUNT(*) ...')` — ama dikkatle.
10. **Eloquent değil Query Builder.** Hot path'ta model hidrate etmek yavaş.
11. **`fresh()` cache'i bypass eder.** Sadece gerektiğinde.
12. **`withCount` versus `loadCount`.** Aggregate function'ı kullan.

Hangi noktada hangisini kullanacağını bulmak için *önce ölç*. Telescope veya Pulse hâlâ en hızlı yol.
