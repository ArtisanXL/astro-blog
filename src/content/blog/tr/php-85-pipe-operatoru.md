---
title: "PHP 8.5 ve pipe operatörü: artık sağdan sola okumuyorum"
description: "Yıllarca iç içe okuduğum function chain'leri PHP 8.5'in pipe operatörüyle yukarıdan aşağı yazıyorum. Ufak değişim, büyük rahatlık."
pubDate: 2026-05-17
tags: ["php"]
translationKey: "php-85-pipe"
---

PHP 8.5'in birkaç günlük kullanıcısıyım, en sevdiğim şey de pipe operatörü oldu (`|>`). Bir-iki saat içinde kas hafızasını değiştiriyor. Şu basit örneği düşünelim:

```php
$slug = str_replace(' ', '-', strtolower(trim($title)));
```

Bunu sağdan sola okumak zorundasınız. Önce `trim`, sonra `strtolower`, sonra `str_replace`. İlk yıllar bu cümleyi her gördüğümde "tamam, içeriden dışarıya" demem gerekirdi. Sonra yazılma yönü ile akış yönü birbirinin tersi olduğu için, parantezleri sayarak ilerlerdim. 8.5 ile aynı şey:

```php
$slug = $title
    |> trim(...)
    |> strtolower(...)
    |> str_replace(' ', '-', ...);
```

Yukarıdan aşağı okunuyor. Önce `$title`, sonra `trim`, sonra `strtolower`, sonra `str_replace`. Akış yönü ile yazma yönü artık aynı.

Bunu mümkün kılan ikinci parça, ilk-sınıf çağrılabilir (first-class callable) sözdizimi. `strtolower(...)` ifadesi `strtolower` fonksiyonuna referans veriyor, çağırmıyor. Pipe operatörü bu callable'a sol taraftaki değeri ilk argüman olarak geçiriyor. Yani `$x |> f(...)` = `f($x)`. Eğer `f` birden fazla argüman alıyorsa, yer tutucuyu kendin yazmak zorundasın. Yukarıdaki `str_replace(' ', '-', ...)` çağrısında üçüncü argüman pipe ile gelen değerdir. `...` o argümanın yerini tutar.

İki yerde net kazandı:
- Veri normalizasyonu zincirleri (trim → lowercase → slug → hash gibi).
- Functional dönüşümler (`array_map`, `array_filter`, custom transformer'lar).

Bir yerde net kaybetti: argüman düzeni doğru oturmuyorsa. Bazı PHP fonksiyonları "haystack, needle" alır, bazısı tam tersi. Pipe ile gelen değer her zaman ilk argüman gibi davranıyor. Sıra yanlışsa lambda yazmak zorunda kalıyorsun:

```php
$found = $haystack |> fn($h) => str_contains($h, 'needle');
```

O noktada eski çağrı yazımı (`str_contains($haystack, 'needle')`) zaten kısa.

8.5'in diğer yenileri arasında pratik gördüğüm `array_first()` ve `array_last()` oldu. `reset()` ve `end()`'in pointer'a dokunmayan versiyonları. Bir de URI parser geldi, `parse_url`'ün uzun zamandır kabul edemediği RFC kenarlarını handle ediyor.

Pipe büyük bir paradigma kayması değil. Ama her gün defalarca yazdığım function chain'lerini okurken iki saniye kazandırıyor. İki saniye × günlük 50 chain × yıl 250 iş günü, farkı hissediyorsun.
