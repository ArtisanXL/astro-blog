---
title: "PHP 8.4 property hooks: artık getter/setter yazmıyoruz"
description: "Eloquent accessor'larıyla birlikte düşününce property hooks'un nereye oturduğu netleşiyor. Üç senaryo, bir uyarı, bir refactor."
pubDate: 2026-04-18
tags: ["php", "laravel"]
---

PHP 8.4 ile gelen *property hooks*, ilk gördüğümde "C#'tan kopyalanmış" diye geçirdim — değil, daha düzgün. Asıl güzeli, Eloquent accessor/mutator'ları ile nasıl iç içe geçtiği.

## Klasik accessor

```php
public function getFullNameAttribute(): string
{
    return "{$this->first_name} {$this->last_name}";
}
```

veya yeni stil:

```php
protected function fullName(): Attribute
{
    return Attribute::make(get: fn () => "{$this->first_name} {$this->last_name}");
}
```

## 8.4 hook ile

```php
public string $fullName {
    get => "{$this->first_name} {$this->last_name}";
    set(string $value) {
        [$this->first_name, $this->last_name] = explode(' ', $value, 2);
    }
}
```

Hem read hem write. Magic method yok. IDE refactor'ı da görür.

## Uyarı

Eloquent modelinde direkt böyle bir property tanımlarsan veritabanı kolonu ile çakışır. Eloquent magic'i bypass eder. Sadece hesaplanan property'ler için kullan, gerçek kolonlar için hâlâ Eloquent accessor.
