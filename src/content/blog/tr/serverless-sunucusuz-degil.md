---
title: "Serverless aslında sunucusuz değil"
description: "Bir hata mesajı, soyutlamanın altındaki donanımı hatırlattı."
pubDate: 2026-05-16
updatedDate: 2026-05-17
tags: ["edge", "mimari"]
translationKey: "serverless-no-server"
---

Gecenin bir vakti, bir Worker'ın hata mesajına bakıyordum:

```
Error: Memory limit exceeded
```

Bir nesnenin içine büyükçe bir liste koymuşum, `JSON.stringify`, KV'ye yazmaya çalışıyorum. Patlıyor.

"Serverless" kelimesinin yarattığı yanılsamayı o an hatırladım. Aslında bu işte sunucu vardı. Bir CPU, bir RAM, bir limit. Sadece o sunucunun nerede durduğunu, ne kadar yaşadığını, ne zaman öldüğünü ben bilmiyordum. Sunucu yokluğu değil. Sunucu bilinmezliği.

Bunu kağıt üstünde ilk Worker'ı yazdığım gün de biliyordum. [Cloudflare'in dökümantasyonu](https://developers.cloudflare.com/workers/reference/how-workers-works/) ilk paragrafta yazıyor zaten: isolate-based runtime, V8, request başına izole. Ama bilmek ile içselleştirmek farklı şey. Bellek hatası bana sunucuyu hatırlattı.

PHP-FPM ile yıllarımı geçirmiştim. Bir sunucum vardı, bellek limiti `php.ini`'de yazıyordu, restart edebiliyordum, `htop` açıp süreçleri görebiliyordum. Worker'da hiçbiri yok. Bir hata var. Bir "yapma onu" var. Sunucu hala orada, sadece bana arkasını dönmüş.

İronik tarafı: bütün soyutlamalar böyle çalışıyor. "Cloud" da bir başkasının bilgisayarıydı. "Managed database" de bir başkasının çalıştırdığı Postgres'ti. Her abstraction layer'ı bir gün altındaki şeyle yüzleşmen için seni bekliyor. Genelde geç bir saatte.

Çözüm önemsizdi. Listeyi parçalara böldüm, KV'ye küçük gruplar halinde yazdım, bir cron tetikleyici parça parça okuyup birleştiriyor. Memory limit aşılmıyor.

Ama yatmadan önce düşündüğüm şey çözüm değildi. Düşündüğüm şey "serverless" kelimesinin küçük yalanıydı. Sunucu vardı. Hala var. Sadece görünmüyor.

Bir gün biri "edge"i de edgeless olarak satacak. Yer yok, mesafe yok, her şey her yerde. Sonra geç bir saatte bir hata mesajıyla, sunucunun bir yerlerde bir veri merkezinde durduğunu hatırlayacağız. Neyse.
