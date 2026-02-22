---
title: "Eloquent collection mu LazyCollection mu, ne zaman önemli"
description: "100k satırı belleğe çekip kabul gördüğüm gün. Cursor'a geçince ne kaybettiğimi anladım."
pubDate: 2026-02-22
tags: ["laravel", "performans", "veritabani"]
translationKey: "lazy-collection-memory"
---

Bir gece çalışan script yazdım. Tüm user'ları taradı, bir alanı backfill etti, bitti. Staging'de üç saniye sürdü. Production'da üç dakika sonra OOM ile öldü.

Kod basitti:

```php
User::all()->each(function ($u) {
    $u->something = derive($u);
    $u->save();
});
```

`User::all()` bütün satırları çekti, hepsini Eloquent model'ine instance'ladı, hepsini Collection'a koydu. 100 bin row, her biri yaklaşık 10KB Eloquent model'i, 1 GB RAM. Sunucu 512 MB ile çalışıyordu. OOM kaçınılmazdı.

İlk refleksim chunking'di:

```php
User::chunk(1000, function ($users) {
    foreach ($users as $u) { ... }
});
```

Çalıştı. Ama `chunk` bir tuzak taşır: chunk içinde satırların sırasını değiştirirsen (silme, update'leme), sonraki chunk'ın offset'i kayar ve satırları atlar. `chunkById` bunu çözer ama ID sırasına göre çalışır. Backfill için sorun yok, daha karmaşık iş için akılda tutmak gerek.

Asıl tatmin edici çözüm `lazy` / `cursor`:

```php
User::lazy()->each(function ($u) {
    $u->something = derive($u);
    $u->save();
});
```

`lazy()` arka planda chunk yapan, dışarıya tek bir lazy iterator gibi davranan bir LazyCollection döner. `cursor()` daha düşük seviyede, DB cursor'undan satır satır okur. İkisi de bellek profilini sabit tutar. Aynı script şimdi 30 MB civarında geziniyor, satır sayısına bakmadan.

Trade-off net. LazyCollection eager Collection metodlarının çoğunu destekler ama `groupBy`, `sortBy`, `chunk` gibi tüm dataset'i görmesi gereken işlemler iç tarafta hâlâ buffer eder. `sortBy` LazyCollection'da çalışır ama bütün satırları belleğe çeker. Sıralama gerekliyse zaten `cursor` avantajını kaybediyorsun.

Karar şu hale geldi:
- 1000'den az row beklediğim her yerde: `get()`, Collection, rahat.
- Sıra koyup belleğe almam gereken orta seviye iş: `chunkById`.
- Stream et, hesapla, yaz: `lazy()` veya `cursor()`.
- Stream et, sonra grupla: yanlış araç. Bunu SQL'de `GROUP BY` ile yap.

PHP-FPM gününde bu hata daha az incitirdi çünkü her request kendi bellek bütçesinde yaşardı. Bir cron job ayrı bir bütçedeydi ve OOM bir kez vurup geçerdi. Worker dünyasında her isolate'in bütçesi daha sıkı. Aynı `User::all()` orada 128 MB sınırında çok daha çabuk patlar. `lazy()` her iki dünyada da doğru cevap ama Worker'da sadece güzel değil, zorunlu.

Şimdi `User::all()` yazarken kendime "kaç row olacak" diye soruyorum. Cevap "bilmiyorum" ise zaten yanlış metot.
