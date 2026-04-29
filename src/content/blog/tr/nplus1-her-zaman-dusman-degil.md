---
title: "N+1 her zaman düşmanın değil"
description: "Eager load et tavsiyesinin sınırı. Bazen onlarca küçük cache hit'li sorgu, tek büyük JOIN'den hızlı."
pubDate: 2026-04-29
tags: ["laravel", "performans", "veritabani"]
translationKey: "nplus1-not-always-enemy"
---

Bir admin ekranı yavaş açılıyordu. Debugbar'ı açtım, kırk küsur sorgu vardı. İlk refleks klişe: N+1, eager load eksik. `->with('orders.items.product')` ekledim, sorgu sayısı dörde indi. Ekran daha da yavaş açıldı.

Bu yazıyı yazma sebebim o gün. "N+1 var" demek hala bir sorunu işaret etmiyor, bir sorunun olabileceğini işaret ediyor. Hangi durumda eager load doğru, hangi durumda N+1'in kendisi doğru cevap.

Standart hikaye basit. `User::all()` çekiyorsun, döngüde `$user->profile->avatar` çağırıyorsun, her user için ayrı bir profil sorgusu çalışıyor. `with('profile')` yazınca iki sorguya iniyor. Çoğu yerde doğru çünkü round-trip'in maliyeti veritabanı işinin maliyetinden büyük.

İş şu, bu denge kırıldığında. Veritabanı her sorguda gerçek iş yapıyorsa, sorgu sayısını azaltmak demek daha büyük tek sorgular üretmek demek, ve bu pahalı olabilir.

Benim admin ekranımda olan şuydu. Yüz sipariş, her birinin onlarca item'ı, her item'ın bir product'ı. Full eager load yapınca son sorgu şu hale geliyordu:

```sql
SELECT * FROM products WHERE id IN (1, 4, 7, ... 800 farklı ID);
```

Products tablosu kalın bir tabloydu. Legacy sütunlar, TEXT alanlar. Sekiz yüz satırı PHP tarafında Eloquent hidrate ederken bellek ikiye katlandı, response time bir buçuk kat oldu. Tek tek versiyonda küçük PK lookup'ları InnoDB buffer pool'dan sıcak geliyordu, çünkü products tablosu sık okunuyor, az değişiyordu. Eager load versiyonu ise her seferinde sekiz yüz satırı disk'ten ya da en azından buffer pool'un soğuk bir köşesinden çekiyordu.

Geri döndüm, items'i eager load ettim ama product'ı bıraktım. View içinde `$item->product->name` çağrıldığında her product için ayrı PK lookup, ama her product zaten buffer pool'da sıcak.

Üç senaryoyu da ölçtüm. Pure N+1 yaklaşık bir saniye. Full eager load bir buçuk saniye, daha kötü. Hibrit dört yüz milisaniye civarı, açık ara en iyisi.

Çoğu örnekte tablolar dar, dataset 10-100 satır, eager load neredeyse hep iyi. Tutorial'lar bu varsayımı koruyor çünkü çoğu zaman doğru. Üretim ortamı farklı: tablolar geniş olabiliyor, dataset büyük olabiliyor, DB cache'liyor, ORM hidrate maliyeti yüksek. Bu eksenler bir araya geldiğinde eager load otomatik tercih olmaktan çıkıyor.

Karar verirken kafamda gri bir alan var. Eager load tercih ettiğim yerler: dataset birkaç yüz satıra kadar, tablolar dar, DB uzakta (RDS gibi network round-trip büyük), ilişkili veri sürekli değişiyor. N+1 bırakıp parça eager yaptığım yerler: dataset binlerce satır, ilişkili tablo geniş ya da az değişen (cache hit'li), DB yakın (unix socket, aynı host), hidrate maliyeti yüksek.

Gri bölgede karar veremiyorsan ölç. Sorgu sayısı yarım gerçek. Bir sorgu sekiz yüz milisaniye tarayabilir, on altı sorgu toplam altmış milisaniye olabilir. Ben şunlara bakıyorum: büyük sorgularda EXPLAIN, Debugbar'da her sorgunun süresi (sayı değil), `memory_get_peak_usage(true)` request başı ve sonu, `wrk` ile gerçek concurrency altında p95.

"Eager load her zaman doğru" yanlış. "N+1 her zaman yanlış" da yanlış. İkisi aynı problemin iki ucu, round-trip ve iş. Eloquent'in dilini öğrenmek hangi sözcüğü ne zaman kullanacağını öğrenmek demek. `with`, `withCount`, `loadMissing`, `lazy`, `chunk`, `cursor`. Hepsinin yeri var.

Bir sonraki "kırk sorgu" panik anında sayıya değil süreye bak.
