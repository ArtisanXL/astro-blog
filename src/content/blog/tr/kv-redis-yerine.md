---
title: "Workers KV ne zaman Redis'i yener (ve ne zaman yenmez)"
description: "Feature-flag store'umu Redis'ten Workers KV'ye taşımayı denedim. Yarısı temiz geçti. Diğer yarısını ertesi sabah geri aldım."
pubDate: 2026-05-17
tags: ["cloudflare", "edge", "laravel", "veritabani"]
translationKey: "kv-vs-redis"
featured: true
---

Pazartesi öğleden sonra feature-flag store'unu Redis'ten Workers KV'ye taşımaya karar verdim. Aynı şekil: çok okunan, az yazılan, key-value. Yarısı temiz geçti. Diğer yarısını ertesi sabah geri aldım.

Temiz geçen yarısı bariz olanıydı. Feature flag'ler, A/B test copy'si, geo-routing override'ları — bir kez yazıp binlerce kez okuduğun şeyler. Laravel'de `Cache::remember('flags:v3', 60, fn() => DB::table('flags')->get())` yapıyor, Redis'ten çekiyordum. KV'de `env.FLAGS.get('v3', 'json')` — globally dağıtılmış, connection pool yok, sıcak tutulacak Redis box yok. [Herhangi bir Cloudflare colo'dan p99 okuma gecikmesi 10ms'nin altında](https://developers.cloudflare.com/kv/reference/how-kv-works/). Bu kullanım için KV daha ucuz, daha hızlı.

API yüzeyi kasıtlı olarak küçük. Bir değer koy, geri al, opsiyonel olarak süresini belirle.

```js
await env.FLAGS.put("v3", JSON.stringify(flags), { expirationTtl: 86400 });

const flags = await env.FLAGS.get("v3", "json");
```

`expirationTtl` saniye cinsinden. `get`'in ikinci argümanı type — `"json"` verirsen parse edilmiş değeri döner. Happy path bu kadar.

Duvarla çarptığım yer, Redis'te kolay olan ama KV'nin yapısal olarak destekleyemediği pattern'lar oldu.

Rate limiting. Per-IP rate limit için Redis'te `INCR key` + `EXPIRE key 60` yapıyordum. KV'de atomic increment yok. Get-then-put bir read-modify-write race'i — farklı colo'lardan aynı anda gelen iki request aynı sayıyı okur, ikisi de `count + 1` yazar. Undercount. Doğru araç: tek-yazıcı sayaç için [Durable Objects](https://developers.cloudflare.com/durable-objects/) ya da Cloudflare'ın [Rate Limiting binding'i](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

Session. KV [eventually consistent](https://developers.cloudflare.com/kv/reference/consistency/). Cloudflare'ın kendi dokümanları açıkça yazıyor: tüm edge'lere yayılması 60 saniyeye kadar sürebilir. Cache verisi için sorun yok. Login sonrası oturum verisi için sorun. Kullanıcı bir colo'da login olur, redirect'te farklı bir edge'e düşer, session anahtarı henüz oraya ulaşmamıştır.

Pub/sub, listeler, sorted set'ler. Yok. KV bir key-value store. Channel yok, LPUSH yok, ZADD yok. Bu primitive'lere ihtiyaç duyuyorsan farklı bir şeye bakman lazım.

Laravel + Redis'ten gelen biri için eşleşme kabaca şöyle:

- Uzun TTL'li cache okuma → KV. Çalışıyor.
- Session storage → teknik olarak mümkün, eventual consistency yüzünden pratikte acı verici.
- Atomic sayaç, rate limit → Durable Objects veya Rate Limiting binding. KV değil.
- Queue job'ları → Cloudflare Queues veya DO alarm. KV değil.

Salı günü başıma gelen şu oldu: Worker içinde bir flag güncelledim, hemen ardından aynı request'te geri okudum, sorun yok. Ama 40ms sonra gelen bir sonraki request farklı bir colo'da işlendi ve eski değeri gördü. "Globally distributed" demek "immediately consistent" demek değilmiş. KV birinci vaadi tutturuyor, ikincisini değil — her yerden hızlı oku, her yere yavaş yaz.

Taşımanın yarısını tuttum. Feature flag'ler, statik copy ve geo-routing override'ları artık KV'de çalışıyor. Rate limiting Durable Objects'ta kaldı. Session önceki store'da.

KV, edge'e yapıştırılmış read-heavy bir key-value store; Redis'in yerine geçmek değil. Birinci şey olarak kullanırsan mükemmel. İkincisini arar gibi bakarsan friction hemen başlıyor.

Neyse. Feature flag'ler artık daha hızlı. Gerisine dokunmadım, pişmanlığım yok.
