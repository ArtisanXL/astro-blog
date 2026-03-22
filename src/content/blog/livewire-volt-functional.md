---
title: "Livewire Volt: fonksiyonel API ile küçük bileşenler"
description: "Class component yazmak istemediğim 50 satırlık bir bileşen için Volt'a baktım. Sonuç: çoğu yerde class'a dönmedim."
pubDate: 2026-03-28
tags: ["livewire", "laravel"]
---

Livewire'ın yeni Volt API'si tek dosya, single-page component yazımına izin veriyor. React'tan tanıdık geliyor — useState ile.

```php
<?php
use function Livewire\Volt\{state, computed};

state(['count' => 0]);

$increment = fn () => $this->count++;
$double = computed(fn () => $this->count * 2);

?>

<div>
    <p>Sayı: {{ $count }}</p>
    <p>İki katı: {{ $this->double }}</p>
    <button wire:click="increment">+</button>
</div>
```

Bir component için class + view ayrı dosya yerine, hepsi bir `resources/views/livewire/counter.blade.php`'de.

## Ne zaman class'a dön

- Çok sayıda metod (5+) varsa
- Trait kullanıyorsan
- Test yazmak istiyorsan (Volt component'lerinin test'i de mümkün ama biraz daha bürokratik)

Geri kalanı için Volt → öyle bağlı kalmadım ki, yeni component yazarken refleks olarak `php artisan make:volt` yazıyorum.
