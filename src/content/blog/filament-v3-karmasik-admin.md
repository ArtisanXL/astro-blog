---
title: "Filament v3 ile gerçek dünya admin paneli kurmak"
description: "Yetki sistemini özelleştirmek, custom widget yazmak, performans için n+1 düşürmek, tablolar 50k satır olduğunda hayatta kalmak."
pubDate: 2026-04-12
tags: ["laravel", "filament", "veritabani"]
---

Filament v3 ile son altı ayda iki tane admin panel kurdum. Birinde 50.000 satırlık tablo, diğerinde 8 farklı role tabanlı yetki sistemi vardı. İkisi de hayatta — ama yaptığım şeylerin yarısı dökümanda yoktu.

## n+1 ölmesin diye

Filament'in tablo Resource'unda `getEloquentQuery()` override etmeden büyük tablolarda hayat zor:

```php
public static function getEloquentQuery(): Builder
{
    return parent::getEloquentQuery()
        ->with(['customer', 'items.product'])
        ->withCount('items');
}
```

## Yetki — Policy'ler şart

Filament `Resource::canViewAny()` ve benzerlerini kendisi yazıyor, ama altta Policy'leri çağırıyor. Sen sadece `OrderPolicy::class`'ı yaz, geri kalan kendiliğinden çalışıyor.

## Custom widget

```php
class RevenueChart extends ChartWidget
{
    protected function getData(): array
    {
        return Trend::model(Order::class)
            ->between(start: now()->subDays(30), end: now())
            ->perDay()
            ->sum('total');
    }
}
```

## Toparlama

Filament v3 hızlı bir start veriyor ama "no-code admin" değil. Production'a girince Eager loading, Policy ve indeks bilgisi gerekiyor.
