---
title: "Smart Placement Worker'ımı yavaşlattı"
description: "Bir JSON API'sinde Smart Placement açtım, iki gün p75 yukarı kaydı. Worker request'in taşınması gereken kısmı değildi."
pubDate: 2026-04-06
tags: ["cloudflare", "edge", "performans"]
translationKey: "smart-placement-slower"
---

Çarşamba bir JSON API için Smart Placement'ı açtım. Docs'taki paragrafı okudum, mantıklı buldum, kutuyu işaretledim, deploy ettim. Cuma sabahı latency chart'ında yavaş bir yukarı bükülme vardı. Spike değil, drift. Önce chart'ı sorgulatıp sonra değişikliği sorgulatan cins.

Worker tek bir şey yapıyordu. Request al, KV'de key oku, D1'de row oku, JSON döndür. Bilerek sıkıcı. p50 yaklaşık 30ms civarıydı, p75 55ms. Cuma sabahı p50 aynıydı, p75 110ms'a yaklaşmıştı. Mean medyandan daha çok hareket etmişti, bu kendi başına bir ipucu.

Smart Placement'ın söylediği makul. Worker'ın muhtemelen yavaş bir şeyle konuşuyor, tek bir bölgedeki origin ya da tek bir bölgedeki database. Round-trip o yavaş şeye doğru baskın. Cloudflare scheduler subrequest pattern'ine bakar, eğer o pattern'i görürse Worker'ı kullanıcıya değil yavaş şeye yakın yere koyar. Uzaktan gelen kullanıcı için bir trip yersin, çok sayıda uzak origin trip'i kazanırsın.

O model yavaş şeyin tek bir yerde olduğunu varsayıyor.

Benim yavaş şeyim öyle değildi. KV zaten her edge'de cache'lenmiş. D1 tek primary, ama Sessions API ile read replica'ları aktif ettiğim için okumalarım bölgesel bir replica'ya düşüyordu (ENAM, WNAM, WEUR, EEUR, APAC, OC arasında bana yakın olan). Yani okumalar zaten kullanıcıya yeterince yakındı. Smart Placement'ın baktığı pattern, "bu Worker KV ve D1 ile konuşuyor", "bu Worker'ın pahalı subrequest'leri var" olarak okundu. Worker'ı D1 primary'sine doğru hareket ettirdi. Local olan KV okumaları artık önlerinde küçük bir trip taşıyordu. D1 okumaları belki bir kıl daha hızlıydı, belki değildi. Ve her kullanıcı request'i artık önünde bir colo-to-colo hop taşıyordu.

Dashboard'daki placement decision panel bana kibarca ne olacağını söylemişti. Worker'ın belirli bir bölgeye yerleştirildiğini, confidence skoru ve katkıda bulunan subrequest'leri listeliyordu. Ben bunu "Cloudflare ne yaptığını biliyor" diye okumuştum. Aslında "Cloudflare karar verdiğini gösteriyor, itiraz edebilirsin" diyordu.

Cuma öğleden sonra kapattım. p75 hafta sonu boyunca aşağı geldi. Anında değil. Scheduler'ın yeniden dağıtması birkaç saat sürdü, chart'taki smoothing görünür toparlanmayı birkaç saat daha uzattı.

Smart Placement'ın doğru olacağı yer: `us-east-1`'de chatty bir origin var ve Worker request başına üç kez vuruyor. Bir kullanıcı-to-`us-east` trip'inin maliyeti üç Worker-to-`us-east` trip'inden az. Ders kitabı senaryosu, ve gerçek bir senaryo. Bende yoktu.

Kafamda değiştirdiğim şey: subrequest'ler eşit değil. Smart Placement onları sayıyor, hangi colo cevapladığını biliyor, ama maliyet modeli kaba. Local çözen bir KV okuması subrequest. Tek bölge origin'e fetch subrequest. Metric'te aynı görünüyorlar, davranışları aynı değil. Açmadan önce kendine sor: subrequest'lerin lokasyona bağlı mı, yoksa zaten edge'de mi.

`wrangler tail` her request için Worker'ın koştuğu colo'yu gösterir. O alanı hiç umursamamıştım. İzlemeye başlayınca placement hikayesi netti.
