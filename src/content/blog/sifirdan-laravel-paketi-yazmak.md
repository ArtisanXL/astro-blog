---
title: "Sıfırdan bir Laravel paketi: composer'a kadar 9 adım"
description: "Geçen sene 3 paket yayınladım, hata yapmadığım adım kalmadı. Skeleton'dan service provider'a, testlerden semver'a, packagist'e kadar her şey."
pubDate: 2026-05-04
tags: ["laravel", "paket", "php"]
---

Bir Laravel paketi yazmak teoride basit. Üç dosya: composer.json, ServiceProvider, src/. Pratikte ise testlerinizi nasıl koşturacağınız, hangi PHP sürümlerini destekleyeceğiniz, semver'a ne zaman uyacağınız gibi onlarca küçük karar var.

## 1. Skeleton

Spatie'nin `laravel-package-tools` repo'sunu fork etmek yerine kendi minimal skeleton'ımı kullanıyorum. `composer create-project --prefer-source artisanxl/laravel-package-skeleton vendor/my-package`. İçinde Pest, GitHub Actions, ve hazır bir service provider var.

## 2. composer.json'ı doğru yaz

```json
{
  "name": "vendor/my-package",
  "type": "library",
  "require": {
    "php": "^8.2",
    "illuminate/contracts": "^11.0|^12.0"
  },
  "extra": {
    "laravel": {
      "providers": ["Vendor\\MyPackage\\ServiceProvider"]
    }
  }
}
```

Auto-discovery için `extra.laravel.providers` kritik.

## 3–9 — kısa versiyon

- **ServiceProvider** — `register()` ve `boot()` ayrı dertler.
- **Config publish** — `mergeConfigFrom` + `publishes()`.
- **Test** — Orchestra Testbench, Pest 3.
- **CI** — matrix: PHP 8.2/8.3/8.4 × Laravel 11/12.
- **Semver** — minor sürümde sadece eklersin, major'da sözünden döner gibi olursun.
- **README** — örnek kod ilk 30 satırda olmalı.
- **Packagist** — webhook ile auto-publish kur.

İlk paketim 12k indirme aldı, üçüncüsü 900. Konu seçimi her şey.
