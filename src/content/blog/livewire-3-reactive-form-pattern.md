---
title: "Livewire 3'te reactive form: wire:model.live yetmediğinde"
description: "Bir form alanı diğerini etkiliyor, doğrulama dinamik, fiyat anlık hesaplanıyor. wire:model.live ile başladım, computed property'lerle bitirdim. Tam pattern."
pubDate: 2026-05-10
tags: ["laravel", "livewire", "php"]
featured: true
---

Livewire 3, eski sürüme göre çok daha "reactive" hissettiriyor. Ama bir noktadan sonra `wire:model.live` her şeyi çözmüyor — özellikle form alanlarının birbirini tetiklediği, ve UI'da anlık güncellemenin beklendiği yerlerde.

## Senaryo

Bir e-ticaret SaaS'ında "Yeni sipariş" formu. Müşteri seçilince adres listesi geliyor, adres seçilince kargo seçenekleri filtreleniyor, ürün eklendikçe ara toplam ve KDV anında güncelleniyor. Klasik.

Birinci versiyon — direkt `wire:model.live` ile.

```php
<?php

use Livewire\Volt\Component;

new class extends Component {
    public ?int $customerId = null;
    public ?int $addressId = null;
    public array $items = [];

    public function getAddressesProperty()
    {
        return $this->customerId
            ? Address::where('customer_id', $this->customerId)->get()
            : collect();
    }
};
```

Bu çalışıyor ama her tuş basışı sunucuya istek atıyor. 300ms'lik bir round-trip toplamda her şeyi hissedilir derecede yavaşlatıyor.

## İkinci yaklaşım: computed + debounce

Livewire 3'te `Computed` attribute ile property'ler memoize ediliyor. İstek hâlâ gidiyor ama önemli kısımları client tarafında tutuyoruz.

```php
use Livewire\Attributes\Computed;

#[Computed]
public function addresses()
{
    return Address::where('customer_id', $this->customerId)->get();
}

#[Computed]
public function subtotal(): int
{
    return collect($this->items)->sum(fn ($i) => $i['price'] * $i['qty']);
}
```

`subtotal` artık sunucuya gitmiyor — Alpine.js tarafında render ediliyor.

## Üçüncü adım: server rules + client preview

Doğrulama kuralları sunucuda, ama kullanıcıya kuralın "şu an" sonucunu göstermek istiyoruz. `validateOnly` + `wire:model.blur` kombinasyonu burada çok iyi çalışıyor.

> Pratik kural: önemli her şey sunucuda doğrulanmalı, ama kullanıcı **bekletilmemeli**. Optimistic UI'ı pas geçme.

İlk versiyondaki "her tuşa istek" deseninden, son versiyondaki "ihtiyaç olunca istek" desenine geçince ortalama form süresi 4.2 saniyeden 1.1 saniyeye düştü.

## Toparlama

- Anlık UX gerektiren her şey için `Computed` + Alpine
- Sunucu validasyonu için `validateOnly` + blur
- `wire:model.live` sadece *zorunlu* tetikleyiciler için (örn. dropdown filtreleri)

Bu desen bana üç ayrı formda iş çıkardı. Senin için de işe yaramazsa, gerçek bir kullanıcıyla 5 dakikalık form testi yap — ne olduğunu hemen göreceksin.
