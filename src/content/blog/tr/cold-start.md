---
title: "Cold start ile barıştım"
description: "İlk Worker'ımı deploy ettiğim gün p99'a panikledim. Bir hafta sonra ne ölçtüğümü anladım."
pubDate: 2026-05-07
tags: ["edge", "performans"]
translationKey: "cold-start-peace"
featured: true
---

İlk Worker'ımı deploy ettim, dashboard'a baktım. p99 PHP-FPM'deki sayının birkaç katı. Panikledim. Yıllarca p99'a göre yaşamış bir adamım, sayı tanıdık değildi. Geç saate kadar açıktım. Cold start mı, network mi, KV mi? Bilmiyordum.

Bir hafta sonra anladım ki o p99 kimseyi incitmiyordu. Bin requestin neredeyse hepsi hızlı dönüyordu, network dahil, dünyanın öbür ucundan. Sadece bir tane geç request vardı, o da kullanıcının ilk dokunduğu request'ti. Yani p99 dediğim şey, kullanıcının ilk dokunuşunun süresiydi. Sayfa daha açılmamıştı bile.

Cold start soğukken kötüydü, doğru. Ama soğukluğun olduğu an kullanıcının yeni geldiği andı. Bu örtüşme bir şeyi sessizce halletmişti.

PHP-FPM'de p99'a takıntılıydım çünkü orada her request potansiyel olarak soğuk değildi. Sunucum tekti, sürekli açıktı, p99 "kötü bir saat" demekti. Worker'da p99 başka bir şey ölçüyor. Aynı isim, farklı soru.

Tabi cold start'ın gerçekten ısırdığı yerler var. Real-time ödeme sayfası — kullanıcının ilk request'i o ise kötü. WebSocket'in ilk handshake'i. Sürekli yeni cold connection açan API consumer'lar. Bu yerler için ya Worker'ı sıcak tutarsın (Smart Placement, cron tetikleyici), ya farklı bir runtime'a bakarsın.

Gerisi için cold start, eskiden bildiğim p99 değil. Şimdi grafiğe baktığımda kendime başka bir şey soruyorum: bu p99 kim için? Background sync mi, admin paneli girişi mi, landing page mi. Üçü için cevap da farklı.

Neyse. Barıştığım şey aslında sayı değildi. O sayıya verdiğim ağırlıktı.
