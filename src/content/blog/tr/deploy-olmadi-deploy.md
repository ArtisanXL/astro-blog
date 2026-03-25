---
title: "wrangler deploy çalıştı, deploy olmadı"
description: "Exit 0, version ID basıldı, dashboard yeşil. Production eski versiyonu serve ediyordu. Sebep altı hafta önceki tek bir karakter eksik."
pubDate: 2026-03-25
tags: ["cloudflare", "edge", "devops"]
translationKey: "wrangler-deploy-noop"
---

Salı gecesi bir bug fix shipledim. `wrangler deploy`, exit 0, yeni version ID, dashboard'da live. Production URL'ini açtım. Bug hâlâ ordaydı. Cache bypass yaptım, hâlâ orda. Başka network'ten denedim, hâlâ orda.

Kırk dakika sonra anladım: Worker'ım altı haftadır no-op'tu.

İlk on dakika alışıldık checklist. Browser cache, hard reload, incognito. `curl -H "Cache-Control: no-cache"`. Response'ta tam da bu durum için bir alana hardcode string koymuştum. String response'ta yoktu. Demek ki response benim kodumdan gelmiyordu.

`wrangler deployments list`'e baktım. Yeni versiyonum en üstte, current deploy olarak işaretli, doğru timestamp. Altındaki altı hafta öncesinin "başarılı deploy"u. İkisi de deployed, ikisi de active.

Sonra route'lara baktım. Worker'ın iki route'u vardı: `api.example.com/*` ve `example.com/api/*`. Bug `example.com/api/*` altında. Bu path'i Worker'ın eklemesi gereken bir header'la `curl`'üyorum, header yok. Request origin'e direkt gidiyor.

`wrangler.jsonc`'deki pattern yanlıştı:

```jsonc
"routes": [
  { "pattern": "api.example.com/*", "zone_name": "example.com" },
  { "pattern": "example.com/api/", "zone_name": "example.com" }
]
```

İkinci route'un sonundaki `*` yoktu. Altı hafta önce api subpath'i eklerken pattern'i yanlış yazmışım. `example.com/api/` tam olarak o URL'i match eder, altındaki hiçbir şeyi değil. Cloudflare pattern'i kabul etti, Worker'ı deploy etti, sessizce neredeyse hiç traffic route etmedi.

Altı haftanın bütün deploy'ları "başarılı"ydı. Worker o pencerede belki birkaç yüz request görmüştü, sadece `/api/` arkasında hiçbir şey olmayan istekler. Geri kalanı yanından geçiyordu. Metrics dashboard'da invocation grafiği düzgündü çünkü api subdomain çalışıyordu. Toplam request count makul görünüyordu. Hiçbir şey beni bakmaya itmemişti.

Fix tek karakterdi: `example.com/api/*`.

Sonradan üç şey ekledim. Birincisi, deploy script'ine post-deploy kontrol. Worker'ın handle ettiği bilinen bir route'u vurur, sadece benim Worker'ın eklediği header'a bakar, yoksa deploy fail. Yirmi satır bash + curl. Yakalamasını istediğim şey tam olarak bu: exit 0 verip eski kodu serve eden bir deploy.

İkincisi, her prod deploy'dan sonra `wrangler deployments list` okuyorum, sadece bir şey ters görününce değil. Liste sana deploy'un olduğunu söyler. Traffic'in oraya ulaştığını söylemez.

Üçüncüsü, deploy'dan sonraki bir dakika `wrangler tail`. Kendi production URL'imi filtrelerim. Kendi traffic'imi tail'da görmüyorsam, önümde bir şey var.

Genel ders: başarılı deploy komutu "kod platformda" demek. "Kod request'lere cevap veriyor" demek değil. İkisi ayrı iddia, ben yıllarca tek sanmışım. Neyse.
