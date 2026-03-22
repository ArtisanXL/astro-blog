---
title: "Queue'ları gerçekten ölçeklemek: Horizon, Redis ve 5M iş/gün"
description: "Bir e-ticaret panelinde günde 5 milyon job patlattık. Hangi connection'ları sıkıştırdık, supervisor'a ne yaptırdık, Redis instance'ı nasıl yaşadı."
pubDate: 2026-04-22
tags: ["laravel", "queue", "performans"]
---

Bir e-ticaret panelinde günlük 5M job çıkmaya başlayınca öğrendiğim ilk şey: Horizon UI yanlış göstermiyor, Redis cidden ölüyor.

## Önce ne yaptık

- **Connection ayırma.** `default`, `mail`, `webhook`, `reports` — her biri ayrı Redis DB.
- **Supervisor profilleri.** Mail için 4 worker yeter; webhook için 32.
- **Job batching.** 10.000 satırlık excel import'unda her satır job değil; 100'lük chunk = 1 job.

## Redis'i nasıl rahatlattık

İki ana darboğaz vardı: `XADD` (queue push) latency'si, ve serialize edilen payload boyutu. Çözümler:

1. **Persistent connection.** PhpRedis ile.
2. **Compressed payloads.** Bir middleware ile `gzip` — %60 yer kazancı.
3. **Pipeline batching.** 1000 job'u tek `MULTI` ile gönder.

```php
Redis::pipeline(function ($pipe) use ($jobs) {
    foreach ($jobs as $job) {
        $pipe->rpush("queues:default", serialize($job));
    }
});
```

## Sonuç

Aynı Redis instance ile p99 dispatch latency 18ms'den 3ms'e düştü. Worker sayısı yarıya indi. Yine de bir noktada Redis Cluster'a geçeceğiz — ölçek bekleniyor.
