---
title: "Kendine fetch atan Worker"
description: "Subrequest loop, daha önce görmediğim bir Cloudflare hata kodu, ve bu çukuru kaçınılmaz yapan routing modeli."
pubDate: 2026-03-29
tags: ["cloudflare", "edge", "mimari"]
translationKey: "worker-self-fetch-loop"
---

Kendi origin'iyle konuşan bir Worker yazdım. `wrangler dev`'de test ettim, sorun yok. Deploy ettim. İlk gerçek request:

```
Error 1042 Ray ID: XXXXXXXXXXXX
Internal request count exceeded
```

1042'yi daha önce hiç görmemiştim. Sayı, Cloudflare'ın "kullanıcı bir şey yanlış yaptı" tonundaki kibar kodlarından biri gibi duruyordu. Anlamı: Worker'ın kendine recurse etti, biz durdurduk.

Mimari kâğıt üzerinde temiz görünüyordu. `example.com/api/*` üzerindeki bir Worker auth yapar, dekore edilmiş request'i `origin.example.com/api/*`'a forward eder. Worker `env.ORIGIN_URL`'i okuyup fetch atar:

```ts
const upstream = new URL(env.ORIGIN_URL + url.pathname + url.search);
const res = await fetch(upstream, {
  method: request.method,
  headers: request.headers,
  body: request.body,
});
```

`env.ORIGIN_URL` `https://origin.example.com`'du. `origin.example.com` Cloudflare üzerindeki bir CNAME'di. Buraya kadar tamam.

Ama Worker'ın route'u, dikkat etmediğim bir wildcard yüzünden `origin.example.com/api/*`'ı da match ediyordu. Yani Worker'ın `origin.example.com`'a attığı fetch Cloudflare edge'inden geçti, Worker route'una çarptı, Worker'ı çalıştırdı, o da `origin.example.com`'a fetch attı ve Worker'ı tekrar çalıştırdı. Edge bir süre izin verdi, sonra subrequest sayacı sınırı geçince 1042 fırlattı.

`wrangler dev` yakalamamıştı. Local'de external hostname'e atılan fetch local Node fetch stack'inden geçer, benim Worker'ım koşmaz. Loop sadece gerçek edge'de var, çünkü route gerçekten Worker'a ait.

İlk fix denemesi: upstream request'e `Host` header set ettim. Yardımcı olmadı. Cloudflare Worker route matching'i URL hostname'e bakıyor, `Host` header'a değil. Routing kararı request edge'e girdiğinde alınıyor.

İkinci deneme: Worker'ın tanıyıp pass-through yapacağı bir query param. İşe yarıyor, ama çirkin. URL'i `?_passthrough=1` ile vuran herkes auth'u atlıyor. Shared secret eklersin, iki sene sonra kimsenin döküman bırakmadığı bir security finding olarak geri gelir.

Asıl çözüm service binding. `wrangler.jsonc`'de:

```jsonc
"services": [
  { "binding": "ORIGIN", "service": "origin-worker" }
]
```

Kodda:

```ts
const res = await env.ORIGIN.fetch(request);
```

Service binding Worker'dan Worker'a public edge'i atlayarak gider. URL resolution yok, route matching yok, loop ihtimali yok. Dezavantajı: karşı tarafın da Worker olması gerek.

Origin Cloudflare üzerinde ama Worker değilse, cevap o origin'e Worker'ın route'unun match etmediği bir hostname vermek. `internal-origin.example.com` gibi bir subdomain altında Worker route'u yoksa iş tamam. Traffic hâlâ edge'den geçer, DDoS koruması, TLS termination, hepsi yerinde. Sadece içeride Worker'a uğramıyor.

Genel şekil şu. Worker'lar hostname pattern'ine göre route'lanıyor. Worker'ın kendi route'una match eden bir hostname'e fetch atıyorsa, loop var. Platform tarafından tanınan bir bypass query param yok. Bypass yapısal: route'un match etmeyeceği bir hostname seç.

Yeni Worker'larda artık üstüne bir comment yazıyorum: "Routes: …" ve "Fetches: …". Üç satır, bir dakika, bir kötü öğleden sonrayı engelliyor.
