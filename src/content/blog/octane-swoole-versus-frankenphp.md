---
title: "Octane: Swoole, RoadRunner ve FrankenPHP — hangisi?"
description: "Aynı uygulamayı üçüyle de koşturdum. Boot süresi, bellek ayakizi, deploy story, ve hangi durumda hangisi."
pubDate: 2026-03-20
tags: ["laravel", "performans", "devops"]
---

Laravel Octane üç server destekliyor: Swoole, RoadRunner, FrankenPHP. Aynı küçük SaaS'ı (medium yük) üçüyle de bir hafta koşturdum.

## Sonuçlar

| Server | p50 latency | p99 | Memory/worker | Boot |
| --- | ---: | ---: | ---: | ---: |
| Swoole | 14ms | 42ms | 38MB | 1.2s |
| RoadRunner | 16ms | 48ms | 32MB | 0.6s |
| FrankenPHP | 18ms | 51ms | 41MB | 0.4s |

Latency farkı negligible. Asıl fark deploy story'sinde.

## Swoole

Hızlı, ama PHP extension olarak yüklü olmak zorunda. Docker image'ı 250MB. PECL ile uğraş.

## RoadRunner

Go binary. Tek dosya. Boot hızı çok iyi. Worker pool kontrolü en olgun. *Tavsiyem* genelde bu.

## FrankenPHP

Caddy üzerine inşa edilmiş. HTTPS otomatik. Bence en pragmatik seçenek **yeni başlayanlar için**, ama production-grade workload'ları henüz olgun bulmadım.

## Karar

- **Yeni proje, hızlı deploy:** FrankenPHP
- **Üretim, çok worker:** RoadRunner
- **Çok yüksek throughput, custom optimizasyon:** Swoole
