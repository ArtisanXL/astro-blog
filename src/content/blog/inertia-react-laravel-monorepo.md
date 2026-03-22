---
title: "Inertia + React + Laravel: monorepo'suz da olur"
description: "Tek repo, tek deploy, yine de SPA hissi. Vite konfigürasyonu, type sharing ve neden Inertia hâlâ tartışmasız en pragmatik seçenek."
pubDate: 2026-04-28
tags: ["laravel", "react", "mimari"]
---

Inertia.js'i kullanmaya başladığımdan beri "ayrı bir frontend repo açayım mı" sorusunu sormadım. Tek repo, tek `composer install && npm install`, tek deploy. Bunu söylediğimde "ama tip güvenliği?" diye soranlar oluyor. Cevap: var, ama biraz çalışıyor.

## Tipleri paylaşmak

`spatie/laravel-typescript-transformer` kullanıyorum. Server-side enum'lar, DTO'lar, hatta route isimleri TypeScript'e dökülüyor.

```bash
php artisan typescript:transform
```

`resources/js/types/generated.ts` dosyası elimde, frontend'de:

```ts
import type { OrderStatus } from '@/types/generated';
```

## Inertia + React DX

Bir middleware'la `usePage()` her sayfada `auth.user`, `csrf_token`, `flash` veriyor. Sayfa scroll pozisyonu ve form state'i `useForm()` ile yönetilen. SPA'dan farkı?

> Pratik anlamda hiçbir şey. Ama serverde `Route::resource('orders', OrderController::class)` yazıyorum, frontend'de `Inertia::render('Orders/Index', ...)`. Aradaki tüm boilerplate kayboldu.

## Ne zaman terk ederim

İki durum: (1) gerçekten public-API'lı bir backend lazım (mobile, partner), (2) backend Laravel değil. Bu ikisi olmadığı sürece Inertia kalır.
